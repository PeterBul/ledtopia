export const ALL_DEVICES = /* GraphQL */ `
  query {
    allDevices {
      id
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
      name
      device {
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

export const LIGHT_ADDED = /* GraphQL */ `
  subscription LightAdded {
    lightAdded {
      id
      name
      device {
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
