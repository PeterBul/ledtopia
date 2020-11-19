import { ApolloServer, gql } from "apollo-server";
import { getLocalDevices } from "./utils/index.js";
import WebSocket from "ws";

// Find all local devices and try to connect to them
let sockets = {};
const devices = await getLocalDevices();

devices.forEach((device) => {
  const ws = new WebSocket("ws://" + device.ip + ":81/");
  sockets = { ...sockets, [device.ip]: ws };
  ws.on("open", () => {
    console.log("Opened ws");
  });
  ws.on("close", function close() {
    console.log("disconnected");
    delete sockets[device.ip];
  });
  ws.on("error", function (err) {
    console.log("Ws error", err);
  });
});

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

  input LightState {
    on: Boolean
    brightness: Float
    speed: Float
    color: Color
  }

  input Color {
    r: Float
    g: Float
    b: Float
  }
`;

const resolvers = {
  Query: {
    allLights: async () => await getLocalDevices(),
  },
  Mutation: {
    setLightState: async (root, { ip, state }, ctx) => {
      if (!sockets[ip]) {
        console.log("couldnt find open socket");
        return;
      }
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
