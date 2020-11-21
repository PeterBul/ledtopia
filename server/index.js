import { ApolloServer, gql } from "apollo-server";
import { getLocalDevices, sockets, setupConnections } from "./utils/index.js";

const devices = await getLocalDevices();
setupConnections(devices);

const typeDefs = gql`
  type Query {
    allLights: [Light]
  }

  type Mutation {
    setLightState(ip: String, state: LightState!): Light
  }

  type Light {
    ip: String
  }

  enum StateTypes {
    RAINBOW
    SIMPLE
    PULSE
  }

  input LightState {
    type: StateTypes
    on: Boolean
    speed: Float
    brightness: Float
    color: Color
  }

  input Color {
    h: Float
    s: Float
    v: Float
  }
`;

const resolvers = {
  Query: {
    allLights: async () => {
      const devices = await getLocalDevices();
      setupConnections(devices);
      return devices;
    },
  },
  Mutation: {
    setLightState: async (root, { ip, state }, ctx) => {
      if (!sockets[ip]) {
        console.log("couldnt find open socket");
        return;
      }

      console.log(state);

      sockets[ip].send(JSON.stringify({ ...state }));

      return { ip: ip };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen({
    port: 3000,
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
