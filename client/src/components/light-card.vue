<template>
  <details class="device">
    <summary>
      <core-flex align-items="center" justify-content="between">
        <core-flex align-items="center" justify-content="start">
          <div
            :style="{ marginRight: 'var(--core-space-sm)', background: `${getHex(light.state.hue, 100, 100)}`, height: '20px', width: '20px', borderRadius: '50%'}"
          ></div>
          <core-text size="lg">{{ light.name || "Device"}}</core-text>
        </core-flex>
        <core-flex align-items="center" justify-content="end">
          <core-toggle @click="e => e.preventDefault()"></core-toggle>
          <core-button variant="transparent" squared rounded @click="handleRemoveLight">&#10005;</core-button>
        </core-flex>
      </core-flex>
    </summary>

    <core-box mt="lg">
      <core-label>Mode</core-label>
      <core-tabs
        full
        class="tab-buttons"
        :value="light.state.mode"
        @change="e => updateLight(light.id, { state: { mode: e.target.value }})"
      >
        <core-tab value="SIMPLE">Simple</core-tab>
        <core-tab value="PULSE">Pulse</core-tab>
        <core-tab value="RAINBOW">Rainbow</core-tab>
        <core-tab value="BOUNCE">Bounce</core-tab>
      </core-tabs>
    </core-box>
    <core-box mt="lg" v-if="showHue(light.state.mode)">
      <core-label>Hue</core-label>
      <input
        class="hue-range"
        type="range"
        min="0"
        max="255"
        :value="light.state.hue"
        @input="e => updateLight(light.id, { state: { hue: parseInt(e.target.value) } })"
      />
    </core-box>
    <core-box mt="lg" v-if="showSaturation(light.state.mode)">
      <core-label>Saturation</core-label>
      <input
        class="saturation-range"
        type="range"
        min="0"
        max="255"
        :style="{ '--color': `${getHex(light.state.hue, 100, 100)}`}"
        :value="light.state.saturation"
        @input="e => updateLight(light.id, { state: { saturation: parseInt(e.target.value) } })"
      />
    </core-box>
    <core-box mt="lg" v-if="showBrightness(light.state.mode)">
      <core-label>Brightness</core-label>
      <input
        class="brightness-range"
        type="range"
        min="0"
        max="255"
        :style="{ '--color': `${getHex(light.state.hue, 100, 100)}`}"
        :value="light.state.brightness"
        @input="e => updateLight(light.id, { state: { brightness: parseInt(e.target.value) } })"
      />
    </core-box>
    <core-box mt="lg" v-if="light.state.mode === 'PULSE'">
      <core-label>Pulse speed</core-label>
      <input
        class="range"
        type="range"
        :style="{ transform: 'rotate(180deg)'}"
        min="10"
        max="500"
        :value="light.state.pulseSpeed"
        @input="e => updateLight(light.id, { state: { pulseSpeed: parseInt(e.target.value) }})"
      />
    </core-box>
    <core-box mt="lg" v-if="light.state.mode === 'RAINBOW'">
      <core-label>Rainbow speed</core-label>
      <input
        class="range"
        type="range"
        min="0"
        max="255"
        :value="light.state.rainbowSpeed"
        @input="e => updateLight(light.id, { state: { rainbowSpeed: parseInt(e.target.value) }})"
      />
    </core-box>
  </details>
</template>

<script>
import convertColor from "color-convert";

export default {
  props: {
    light: Object,
    updateLight: Function,
    removeLight: Function,
  },
  methods: {
    handleRemoveLight(e) {
      e.preventDefault();
      this.removeLight(this.light.id);
    },
    showHue(mode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    showBrightness(mode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    showSaturation(mode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    getHex(h, s, v) {
      const multiplyHue = 360 / 255;
      const hex = convertColor.hsv.hex(h * multiplyHue, s, v);
      return `#${hex}`;
    },
  },
};
</script>
