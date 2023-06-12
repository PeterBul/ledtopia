import { ApolloServer, gql } from "apollo-server";
import GraphQLJSON from "graphql-type-json";
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
  ENUM_ADDED,
  ENUM_REMOVED,
  ENUM_UPDATED,
  CONTROLLER_ADDED,
  CONTROLLER_UPDATED,
  CONTROLLER_REMOVED,
  FLOW_ADDED,
  FLOW_UPDATED,
  FLOW_REMOVED,
} from "./utils/pubsub.js";

import nanoid from "nanoid";
import { IResolvers } from "graphql-tools";

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
  scalar JSON

  type Subscription {
    sceneAdded: Scene
    sceneRemoved: ID
    lightAdded: Light
    lightRemoved: ID
    lightUpdated: Light
    devicesUpdated: [Device]
    enumAdded: Enum
    enumRemoved: ID
    enumUpdated: Enum
    controllerAdded: Controller
    controllerUpdated: Controller
    controllerRemoved: ID
    flowAdded: Flow
    flowUpdated: Flow
    flowRemoved: ID
  }

  type Query {
    allScenes: [Scene]
    scene(id: String): Scene

    allLights: [Light]
    light(id: ID!): Light

    allDevices: [Device]

    allEnums: [Enum]
    enum(id: ID!): Enum

    allControllers: [Controller]
    controller(id: ID!): Controller

    allFlows: [Flow]
    flow(id: ID!): Flow
  }

  type Mutation {
    addLight(input: LightInput): Light
    addScene(input: SceneInput): Scene
    removeLight(id: ID!): ID!
    removeScene(id: ID!): ID!
    updateLight(id: ID!, input: LightInput!): Light
    addEnum(input: EnumInput): Enum
    removeEnum(id: ID!): ID!
    updateEnum(id: ID!, input: EnumInput!): Enum
    addController(input: ControllerInput): Controller
    removeController(id: ID!): ID!
    updateController(id: ID!, input: ControllerInput!): Controller
    addFlow(input: FlowInput): Flow
    removeFlow(id: ID!): ID!
    updateFlow(id: ID!, input: FlowInput!): Flow
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
    controller: Controller
    state: LightState
  }

  type Controller {
    id: ID!
    name: String
    device: Device
    controlMode: ControlMode
    """
    The state of the light when in simple mode
    """
    simpleState: LightState
    """
    Custom fields to be used in flows
    """
    advancedFields: [CustomField]
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

  type Enum {
    id: ID!
    name: String
    values: [String]
  }

  type Flow {
    id: ID!
    name: String
    data: JSON
  }

  input LightInput {
    name: String
    deviceId: ID
    sceneId: ID
    controllerId: ID
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

  input EnumInput {
    name: String
    values: [String]
  }

  input ControllerInput {
    name: String
    deviceId: ID
    controlMode: ControlMode
    simpleState: LightStateInput
    advancedFields: [CustomFieldInput]
  }

  input CustomFieldInput {
    type: FieldType
    name: String
    value: String
  }

  input FlowInput {
    name: String
    data: JSON
  }

  enum StateType {
    RAINBOW
    SIMPLE
    PULSE
    BOUNCE
  }

  enum ControlMode {
    SIMPLE
    ADVANCED
  }

  type CustomField {
    type: FieldType
    name: String
    value: String
  }

  enum FieldType {
    ENUM
    INTEGER
  }

  enum LightType {
    LED_STRIP
  }
`;

const resolvers: IResolvers = {
  JSON: GraphQLJSON,
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
    enumAdded: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([ENUM_ADDED]),
    },
    enumRemoved: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([ENUM_REMOVED]),
    },
    enumUpdated: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([ENUM_UPDATED]),
    },
    controllerAdded: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([CONTROLLER_ADDED]),
    },
    controllerUpdated: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([CONTROLLER_UPDATED]),
    },
    controllerRemoved: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([CONTROLLER_REMOVED]),
    },
    flowAdded: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([FLOW_ADDED]),
    },
    flowUpdated: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([FLOW_UPDATED]),
    },
    flowRemoved: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator([FLOW_REMOVED]),
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
    enum: async (root, args, { db }) => {
      return db.get("enums").find({ id: args.id }).value();
    },
    allEnums: async (root, args, { db }) => {
      return db.get("enums").value();
    },
    controller: async (root, args, { db }) => {
      return db.get("controllers").find({ id: args.id }).value();
    },
    allControllers: async (root, args, { db }) => {
      return db.get("controllers").value();
    },
    flow: async (root, args, { db }) => {
      return db.get("flows").find({ id: args.id }).value();
    },
    allFlows: async (root, args, { db }) => {
      return db.get("flows").value();
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
    controller: async ({ controllerId }, args, { db }) => {
      if (!controllerId) return null;
      const controller = db
        .get("controllers")
        .find({ id: controllerId })
        .value();
      if (!controller) return null;
      else return controller;
    },
  },
  Controller: {
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
    addEnum: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("enums")
        .push({
          id: id,
          name: input.name || "My enum",
          values: input.values || [],
        })
        .write();

      const enumm = db.get("enums").find({ id }).value();

      pubsub.publish(ENUM_ADDED, { enumAdded: enumm });

      return enumm;
    },
    addController: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("controllers")
        .push({
          id: id,
          name: input.name || "My controller",
          deviceId: input.deviceId || null,
          controlMode: input.controlMode || "SIMPLE",
          simpleState: { ...initialLightState, ...input.state },
          advancedFields: [...(input.advancedFields || [])],
        })
        .write();

      const controller = db.get("controllers").find({ id }).value();

      pubsub.publish(CONTROLLER_ADDED, { controllerAdded: controller });

      return controller;
    },
    addFlow: async (root, { input }, { db, pubsub }) => {
      const id = nanoid(10);

      db.get("flows")
        .push({
          id: id,
          name: input.name || "My flow",
          data: input.data || null,
        })
        .write();

      const flow = db.get("flows").find({ id }).value();

      pubsub.publish(FLOW_ADDED, { flowAdded: flow });

      return flow;
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

    removeFlow: async (root, args, { db, pubsub }) => {
      db.get("flows").remove({ id: args.id }).write();

      pubsub.publish(FLOW_REMOVED, { flowRemoved: args.id });

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
    updateFlow: async (root, { id, input }, { db, pubsub }) => {
      const oldFlow = { ...db.get("flows").find({ id }).value() };
      console.log("oldFlow", oldFlow);
      const newFlow = {
        ...oldFlow,
        ...input,
      };
      console.log("newFlow", newFlow);
      const flow = db.get("flows").find({ id }).assign(newFlow).write();

      pubsub.publish(FLOW_UPDATED, { flowUpdated: flow });

      return flow;
    },
    updateEnum: async (root, { id, input }, { db, pubsub }) => {
      const oldEnum = { ...db.get("enums").find({ id }).value() };
      const enumm = db
        .get("enums")
        .find({ id })
        .assign({
          ...oldEnum,
          ...input,
        })
        .write();

      pubsub.publish(ENUM_UPDATED, { enumUpdated: enumm });
      return enumm;
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
    removeEnum: async (root, args, { db, pubsub }) => {
      db.get("enums").remove({ id: args.id }).write();
      pubsub.publish(ENUM_REMOVED, { enumRemoved: args.id });
      return args.id;
    },
    updateController: async (root, { id, input }, { db, pubsub }) => {
      const oldController = { ...db.get("controllers").find({ id }).value() };
      const controller = db
        .get("controllers")
        .find({ id })
        .assign({
          ...oldController,
          ...input,
          simpleState: { ...oldController.simpleState, ...input.simpleState },
          advancedFields: [
            ...(input.advancedFields || oldController.advancedFields),
          ],
        })
        .write();

      pubsub.publish(CONTROLLER_UPDATED, { controllerUpdated: controller });
      return controller;
    },
    removeController: async (root, args, { db, pubsub }) => {
      db.get("controllers").remove({ id: args.id }).write();
      pubsub.publish(CONTROLLER_REMOVED, { controllerRemoved: args.id });
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
