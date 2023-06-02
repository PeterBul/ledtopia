export const ALL_DEVICES = /* GraphQL */ `
  query {
    allDevices {
      id
    }
  }
`;

export const ALL_SCENES = /* GraphQL */ `
  query {
    allScenes {
      id
      name
      lights {
        id
      }
    }
  }
`;

export const ALL_LIGHTS = /* GraphQL */ `
  query {
    allLights {
      id
      name
      device {
        id
      }
      scene {
        id
      }
      state {
        on
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
    }
  }
`;

export const ALL_ENUMS = /* GraphQL */ `
  query {
    allEnums {
      id
      name
      values
    }
  }
`;

export const ALL_CONTROLLERS = /* GraphQL */ `
  query {
    allControllers {
      id
      name
      device {
        id
      }
      controlMode
      simpleState {
        on
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
      advancedFields {
        type
        value
      }
    }
  }
`;

export const UPDATE_ENUM = /* GraphQL */ `
  mutation UpdateEnum($id: ID!, $input: EnumInput!) {
    updateEnum(id: $id, input: $input) {
      id
    }
  }
`;

export const REMOVE_ENUM = /* GraphQL */ `
  mutation RemoveEnum($id: ID!) {
    removeEnum(id: $id)
  }
`;

export const ADD_ENUM = /* GraphQL */ `
  mutation AddEnum($input: EnumInput) {
    addEnum(input: $input) {
      id
    }
  }
`;

export const UPDATE_CONTROLLER = /* GraphQL */ `
  mutation UpdateController($id: ID!, $input: ControllerInput!) {
    updateController(id: $id, input: $input) {
      id
    }
  }
`;

export const REMOVE_CONTROLLER = /* GraphQL */ `
  mutation RemoveController($id: ID!) {
    removeController(id: $id)
  }
`;

export const ADD_CONTROLLER = /* GraphQL */ `
  mutation AddController($input: ControllerInput) {
    addController(input: $input) {
      id
    }
  }
`;

export const ENUM_ADDED = /* GraphQL */ `
  subscription EnumAdded {
    enumAdded {
      id
      name
      values
    }
  }
`;

export const ENUM_REMOVED = /* GraphQL */ `
  subscription EnumRemoved {
    enumRemoved
  }
`;

export const ENUM_UPDATED = /* GraphQL */ `
  subscription EnumUpdated {
    enumUpdated {
      id
      name
      values
    }
  }
`;

export const CONTROLLER_ADDED = /* GraphQL */ `
  subscription ControllerAdded {
    controllerAdded {
      id
      name
      device {
        id
      }
      controlMode
      simpleState {
        on
        mode
        hue
        brightness
        saturation
        pulseSpeed
        rainbowSpeed
      }
      advancedFields {
        type
        value
      }
    }
  }
`;

export const CONTROLLER_REMOVED = /* GraphQL */ `
  subscription ControllerRemoved {
    controllerRemoved
  }
`;

export const CONTROLLER_UPDATED = /* GraphQL */ `
  subscription ControllerUpdated {
    controllerUpdated {
      id
      name
      device {
        id
      }
      controlMode
      simpleState {
        on
        mode
        hue
        brightness
        saturation
        pulseSpeed
        rainbowSpeed
      }
      advancedFields {
        type
        value
      }
    }
  }
`;

export const UPDATE_LIGHT = /* GraphQL */ `
  mutation UpdateLight($id: ID!, $input: LightInput!) {
    updateLight(id: $id, input: $input) {
      id
    }
  }
`;

export const REMOVE_LIGHT = /* GraphQL */ `
  mutation RemoveLight($id: ID!) {
    removeLight(id: $id)
  }
`;

export const ADD_LIGHT = /* GraphQL */ `
  mutation AddLight($input: LightInput) {
    addLight(input: $input) {
      id
    }
  }
`;

export const ADD_SCENE = /* GraphQL */ `
  mutation AddScene($input: SceneInput) {
    addScene(input: $input) {
      id
    }
  }
`;

export const SCENE_ADDED = /* GraphQL */ `
  subscription SceneAdded {
    sceneAdded {
      id
      name
      lights {
        id
      }
    }
  }
`;

export const SCENE_REMOVED = /* GraphQL */ `
  subscription SceneRemoved {
    sceneRemoved
  }
`;

export const REMOVE_SCENE = /* GraphQL */ `
  mutation RemoveScene($id: ID!) {
    removeScene(id: $id)
  }
`;

export const LIGHT_ADDED = /* GraphQL */ `
  subscription LightAdded {
    lightAdded {
      id
      name
      device {
        id
      }
      scene {
        id
      }
      state {
        on
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
    }
  }
`;

export const LIGHT_UPDATED = /* GraphQL */ `
  subscription LightUpdated {
    lightUpdated {
      id
      name
      device {
        id
      }
      scene {
        id
      }
      state {
        on
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
    }
  }
`;

export const LIGHT_REMOVED = /* GraphQL */ `
  subscription LightRemoved {
    lightRemoved
  }
`;

export const DEVICES_UPDATED = /* GraphQL */ `
  subscription DevicesUpdated {
    devicesUpdated {
      id
    }
  }
`;
