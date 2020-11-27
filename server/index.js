import { ApolloServer, gql } from "apollo-server";
import { getLocalDevices, sockets, setupConnections } from "./utils/index.js";
import low from "lowdb";
import nanoid from "nanoid";
import FileSync from "lowdb/adapters/FileSync.js";

const adapter = new FileSync("db.json");
const database = low(adapter);

const modeMap = {
  SIMPLE: 0,
  PULSE: 1,
  RAINBOW: 2,
  BOUNCE: 3,
};

const initialLightState = {
  mode: "SIMPLE",
  on: false,
  hue: 0,
  saturation: 255,
  brightness: 255,
  pulseSpeed: 200,
  rainbowSpeed: 10,
};

async function initSockets() {
  const devices = await getLocalDevices();
  setupConnections(devices);
}

initSockets();

const typeDefs = gql`
  type Query {
    allScenes: [Scene]
    scene(id: String): Scene

    allLights: [Light]
    light(id: ID!): Light

    allDevices: [Device]
  }

  type Mutation {
    addLight(ip: String!, name: String): Light
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
    ip: String
    name: String
    isReachable: Boolean
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
      const devices = await getLocalDevices();
      setupConnections(devices);
      return devices;
    },
  },
  Mutation: {
    addLight: async (root, args, { db }) => {
      const id = nanoid();
      db
        .get("lights")
        .push({
          id,
          ip: args.ip,
          name: args.name,
          type: "LED_STRIP",
          isReachable: true,
          state: { ...initialLightState },
        })
        .write().id;

      if (sockets[args.ip]) {
        sockets[args.ip].send(
          JSON.stringify({
            ...initialLightState,
            mode: modeMap[initialLightState.mode],
          })
        );
      } else {
        initSockets();
        console.log("couldnt find socket");
      }

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

      if (sockets[light.ip]) {
        sockets[light.ip].send(
          JSON.stringify({ ...light.state, mode: modeMap[light.state.mode] })
        );
      } else {
        initSockets();
        console.log("couldnt find socket");
      }

      return light;
    },
  },
};

const server = new ApolloServer({
  context: {
    db: database,
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
