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
