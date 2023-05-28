import { ApolloServer, gql } from "apollo-server";
import { database } from "./utils/db.js";
import { sendState, allDevices } from "./utils/devices.js";
import {
  pubsub,
  SCENE_ADDED,
  SCENE_REMOVED,
  LIGHT_UPDATED,
  LIGHT_REMOVED,
  LIGHT_ADDED,
  DEVICES_UPDATED,
} from "./utils/pubsub.js";

import nanoid from "nanoid";

const initialLightState = {
  mode: "SIMPLE",
  on: false,
  hue: 0,
  saturation: 255,
  brightness: 255,
  pulseSpeed: 200,
  rainbowSpeed: 10,
};

const typeDefs = gql`
  type Subscription {
    sceneAdded: Scene
    sceneRemoved: ID
    lightAdded: Light
    lightRemoved: ID
    lightUpdated: Light
    devicesUpdated: [Device]
  }

  type Query {
    allScenes: [Scene]
    scene(id: String): Scene

    allLights: [Light]
    light(id: ID!): Light

    allDevices: [Device]
  }

  type Mutation {
    addLight(input: LightInput): Light
    addScene(input: SceneInput): Scene
    removeLight(id: ID!): ID!
    removeScene(id: ID!): ID!
    updateLight(id: ID!, input: LightInput!): Light
  }

  type Scene {
    id: ID!
    name: String
    lights: [Light]
    state: LightState
  }

  type Light {
    id: ID!
    name: String
    device: Device
    scene: Scene
    type: LightType
    state: LightState
  }

  type LightState {
    mode: StateType
    on: Boolean
    speed: Float
    hue: Float
    brightness: Float
    saturation: Float
    pulseSpeed: Float
    rainbowSpeed: Float
  }

  type Device {
    id: String
  }

  input LightInput {
    name: String
    deviceId: ID
    sceneId: ID
    state: LightStateInput
  }

  input SceneInput {
    name: String
  }

  input LightStateInput {
    mode: StateType
    on: Boolean
    speed: Float
    hue: Float
    brightness: Float
    saturation: Float
    pulseSpeed: Float
    rainbowSpeed: Float
  }

  enum StateType {
    RAINBOW
    SIMPLE
    PULSE
    BOUNCE
  }

  enum LightType {
    LED_STRIP
  }
`;

const resolvers = {
  Subscription: {
    sceneAdded: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([SCENE_ADDED]),
    },
    sceneRemoved: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([SCENE_REMOVED]),
    },
    lightAdded: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([LIGHT_ADDED]),
    },
    lightUpdated: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([LIGHT_UPDATED]),
    },
    lightRemoved: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([LIGHT_REMOVED]),
    },
    devicesUpdated: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([DEVICES_UPDATED]),
    },
  },
  Query: {
    light: async (root, args, { db }) => {
      return db.get("lights").find({ id: args.id }).value();
    },
    allLights: async (root, args, { db }) => {
      return db.get("lights").value();
    },
    allDevices: async () => {
      return allDevices;
    },
    allScenes: async (root, args, { db }) => {
      return db.get("scenes").value();
    },
  },
  Scene: {
    lights: async ({ id }, args, { db }) => {
      const lights = db.get("lights").filter({ sceneId: id }).value();
      if (!lights.length) return [];
      else return lights;
    },
  },
  Light: {
    scene: async ({ sceneId }, args, { db }) => {
      if (!sceneId) return null;
      const scene = db.get("scenes").find({ id: sceneId }).value();
      if (!scene) return null;
      else return scene;
    },
    device: async ({ deviceId }) => {
      const device = allDevices.find((device) => device.id === deviceId);
      if (!device) return { id: deviceId };
      else return device;
    },
  },
  Mutation: {
    addScene: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("scenes")
        .push({
          id: id,
          name: input.name || "My scene",
        })
        .write();

      const scene = db.get("scenes").find({ id }).value();

      pubsub.publish(SCENE_ADDED, { sceneAdded: scene });

      return scene;
    },
    addLight: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("lights")
        .push({
          id: id,
          sceneId: input.sceneId || null,
          deviceId: input.deviceId || null,
          name: input.name || "My light",
          type: "LED_STRIP",
          state: { ...initialLightState, ...input.state },
        })
        .write();

      if (id) {
        sendState(id, { ...initialLightState, ...input.state });
      }

      const light = db.get("lights").find({ id }).value();

      pubsub.publish(LIGHT_ADDED, { lightAdded: light });

      return light;
    },
    removeLight: async (root, args, { db, pubsub }) => {
      const light = db.get("lights").find({ id: args.id }).value();

      if (light?.deviceId) {
        sendState(light.deviceId, { on: false });
      }

      pubsub.publish(LIGHT_REMOVED, { lightRemoved: args.id });

      db.get("lights").remove({ id: args.id }).write();
      return args.id;
    },
    updateLight: async (root, { id, input }, { db, pubsub }) => {
      const oldLight = { ...db.get("lights").find({ id }).value() };
      const light = db
        .get("lights")
        .find({ id })
        .assign({
          ...oldLight,
          ...input,
          state: { ...oldLight.state, ...input.state },
        })
        .write();

      console.log(input);

      if (!light.deviceId) {
        sendState(oldLight.deviceId, { on: false });
      } else if (light.deviceId) {
        sendState(light.deviceId, light.state);
      }

      pubsub.publish(LIGHT_UPDATED, { lightUpdated: light });

      return light;
    },
    removeScene: async (root, args, { db, pubsub, resolvers }) => {
      db.get("scenes").remove({ id: args.id }).write();
      const lights = db.get("lights").filter({ sceneId: args.id }).value();
      lights.forEach((light) => {
        resolvers.Mutation.removeLight(
          undefined,
          { id: light.id },
          { db, pubsub, resolvers }
        );
      });

      //db.get("lights").remove({ sceneId: args.id }).write();
      pubsub.publish(SCENE_REMOVED, { sceneRemoved: args.id });
      return args.id;
    },
  },
};

const server = new ApolloServer({
  context: {
    db: database,
    pubsub: pubsub,
    resolvers,
  },
  typeDefs,
  resolvers,
});

server
  .listen({
    port: 3000,
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
