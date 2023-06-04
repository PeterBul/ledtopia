import { UPDATE_LIGHT } from "../api/queries";
import { getData } from "../api/getData";

export async function updateLight(id, input = {}) {
  await getData({
    query: UPDATE_LIGHT,
    variables: {
      id,
      input,
    },
  });
}

export function updateHue(lightId, hue) {
  updateLight(lightId, {
    state: { hue },
  });
}

export function updateBrightness(lightId, brightness) {
  updateLight(lightId, {
    state: { brightness },
  });
}

export function updateSaturation(lightId, saturation) {
  updateLight(lightId, {
    state: { saturation },
  });
}

export function updatePulseSpeed(lightId, speed) {
  updateLight(lightId, {
    state: { pulseSpeed: speed },
  });
}

export function updateRainbowSpeed(lightId, speed) {
  updateLight(lightId, {
    state: { rainbowSpeed: speed },
  });
}

export function updateMode(lightId, mode) {
  updateLight(lightId, { state: { mode } });
}
