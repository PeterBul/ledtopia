import { ApolloServer, gql, PubSub } from "apollo-server";
import low from "lowdb";
import nanoid from "nanoid";
import FileSync from "lowdb/adapters/FileSync.js";

import {
  getLocalDevices,
  allDevices,
  initDevices,
  sendState,
} from "./utils/connections.js";

initDevices();

const adapter = new FileSync("db.json");
const database = low(adapter);

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
  type Query {
    allScenes: [Scene]
    scene(id: String): Scene

    allLights: [Light]
    light(id: ID!): Light

    allDevices: [Device]
  }

  type Mutation {
    addLight(mac: String!, name: String): Light
    removeLight(id: ID!): ID!
    updateLight(id: ID!, input: UpdateLightInput!): Light
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
    ip: String
    mac: String
    isReachable: Boolean
  }

  input AddLightInput {
    ip: String
    name: String
  }

  input UpdateLightInput {
    name: String
    mode: StateType
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
      const device = allDevices.find((device) => device.mac === deviceId);
      if (!device) throw new Error("No device found");
      return device;
    },
  },
  Mutation: {
    addLight: async (root, args, { db }) => {
      const id = nanoid();
      db
        .get("lights")
        .push({
          id,
          deviceId: args.mac,
          name: args.name || "My light",
          type: "LED_STRIP",
          isReachable: true,
          state: { ...initialLightState },
        })
        .write().id;

      sendState(args.mac, initialLightState);

      return db.get("lights").find({ id }).value();
    },
    removeLight: async (root, args, { db }) => {
      db.get("lights").remove({ id: args.id }).write();
      return args.id;
    },
    updateLight: async (root, { id, input }, { db }) => {
      const oldLight = db.get("lights").find({ id }).value();
      const light = db
        .get("lights")
        .find({ id })
        .assign({
          ...oldLight,
          ...input,
          state: { ...oldLight.state, ...input.state },
        })
        .write();

      console.log(light.state);

      sendState(light.deviceId, light.state);

      return light;
    },
  },
};

const server = new ApolloServer({
  context: {
    db: database,
    pubSub: new PubSub(),
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
