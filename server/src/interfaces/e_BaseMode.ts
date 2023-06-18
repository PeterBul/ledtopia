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
