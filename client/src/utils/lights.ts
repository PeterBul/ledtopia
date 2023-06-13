import { UPDATE_LIGHT } from "../api/queries";
import { getData } from "../api/getData";

export async function updateLight(id: string, input = {}) {
  await getData({
    query: UPDATE_LIGHT,
    variables: {
      id,
      input,
    },
  });
}

export function updateHue(lightId: string, hue: number) {
  updateLight(lightId, {
    state: { hue },
  });
}

export function updateBrightness(lightId: string, brightness: number) {
  updateLight(lightId, {
    state: { brightness },
  });
}

export function updateSaturation(lightId: string, saturation: number) {
  updateLight(lightId, {
    state: { saturation },
  });
}

export function updatePulseSpeed(lightId: string, speed: number) {
  updateLight(lightId, {
    state: { pulseSpeed: speed },
  });
}

export function updateRainbowSpeed(lightId: string, speed: number) {
  updateLight(lightId, {
    state: { rainbowSpeed: speed },
  });
}

export function updateMode(lightId: string, mode: string) {
  updateLight(lightId, { state: { mode } });
}
