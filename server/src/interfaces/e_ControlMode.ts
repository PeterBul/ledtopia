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
