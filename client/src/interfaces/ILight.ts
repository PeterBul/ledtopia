const e_LightType = {
  LED_STRIP: "LED_STRIP",
} as const;

type e_LightType = (typeof e_LightType)[keyof typeof e_LightType];

namespace e_LightType {
  export type LED_STRIP = typeof e_LightType.LED_STRIP;
}

export const e_BaseMode = {
  SIMPLE: "SIMPLE",
  PULSE: "PULSE",
  RAINBOW: "RAINBOW",
  BOUNCE: "BOUNCE",
} as const;

export type e_BaseMode = (typeof e_BaseMode)[keyof typeof e_BaseMode];

namespace e_BaseMode {
  export type SIMPLE = typeof e_BaseMode.SIMPLE;
  export type PULSE = typeof e_BaseMode.PULSE;
  export type RAINBOW = typeof e_BaseMode.RAINBOW;
  export type BOUNCE = typeof e_BaseMode.BOUNCE;
}

export interface ILightState {
  mode: e_BaseMode;
  on: boolean;
  hue: number; // 0 - 255
  saturation: number; // 0 - 255
  brightness: number; // 0 - 255
  pulseSpeed: number; // 0 - 255
  rainbowSpeed: number; // 0 - 65 535
}

export type ILightStateInput = ILightState;

export interface ILight {
  id: string;
  name: string;
  sceneId: string;
  deviceId: string;
  type: e_LightType;
  state: ILightState;
}
