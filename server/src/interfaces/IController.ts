import { IDevice } from "./IDevice.js";
import { ILightState } from "./ILight.js";

export interface IController {
  id: string;
  name: string;
  deviceId: string;
  controlMode: e_ControlMode;
  simpleState: ILightState;
  advancedFields: ICustomField[];
}

export interface IControllerBuilt {
  id: string;
  name: string;
  device: IDevice;
  controlMode: e_ControlMode;
  simpleState: ILightState;
  advancedFields: ICustomField[];
}

export const e_ControlMode = {
  SIMPLE: "SIMPLE",
  ADVANCED: "ADVANCED",
} as const;

const controlModeValues: Set<string> = new Set(Object.values(e_ControlMode));

export type e_ControlMode = (typeof e_ControlMode)[keyof typeof e_ControlMode];

namespace e_ControlMode {
  export type SIMPLE = typeof e_ControlMode.SIMPLE;
  export type ADVANCED = typeof e_ControlMode.ADVANCED;
}

export const isControlMode = (value: string): value is e_ControlMode =>
  controlModeValues.has(value);

export const e_FieldType = {
  ENUM: "ENUM",
  INTEGER: "INTEGER",
} as const;

export type e_FieldType = (typeof e_FieldType)[keyof typeof e_FieldType];

namespace e_FieldType {
  export type ENUM = typeof e_FieldType.ENUM;
  export type INTEGER = typeof e_FieldType.INTEGER;
}

export interface ICustomField {
  type: e_FieldType;
  name: string;
  value: string | null;
}
