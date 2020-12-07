import { ApolloServer, gql, PubSub } from "apollo-server";
import { database } from "./utils/db.js";
import { sendState, allDevices } from "./utils/devices.js";
import nanoid from "nanoid";

const LIGHT_ADDED = "LIGHT_ADDED";
const LIGHT_REMOVED = "LIGHT_REMOVED";
const LIGHT_UPDATED = "LIGHT_UPDATED";

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
    lightAdded: Light
    lightRemoved: ID
    lightUpdated: Light
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
    removeLight(id: ID!): ID!
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
    ip: String
    mac: String
    isReachable: Boolean
  }

  input LightInput {
    name: String
    deviceId: ID
    state: LightStateInput
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
  },
  Light: {
    device: async ({ deviceId }) => {
      const device = allDevices.find((device) => device.id === deviceId);
      if (!device) {
        console.log("No device found");
        return null;
      } else {
        return device;
      }
    },
  },
  Mutation: {
    addLight: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("lights")
        .push({
          id: id,
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

      if (light.deviceId) {
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

      if (input.deviceId === null) {
        sendState(oldLight.deviceId, { on: false });
      } else if (light.deviceId) {
        sendState(light.deviceId, light.state);
      }

      pubsub.publish(LIGHT_UPDATED, { lightUpdated: light });

      return light;
    },
  },
};

const server = new ApolloServer({
  context: {
    db: database,
    pubsub: new PubSub(),
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
