<template>
  <core-box>
    <core-box mt="lg">
      <core-label>Mode</core-label>
      <core-tabs
        full
        class="tab-buttons"
        :value="state.mode"
        @change="handleModeTabClick"
      >
        <core-tab value="SIMPLE">Simple</core-tab>
        <core-tab value="PULSE">Pulse</core-tab>
        <core-tab value="RAINBOW">Rainbow</core-tab>
        <core-tab value="BOUNCE">Bounce</core-tab>
      </core-tabs>
    </core-box>

    <color-slider
      :state="state"
      :show="showHue(state.mode)"
      label="Hue"
      @change="handleHueChange"
      type="hue"
    ></color-slider>
    <color-slider
      :state="state"
      :show="showSaturation(state.mode)"
      label="Saturation"
      @change="handleSaturationChange"
      type="saturation"
    ></color-slider>
    <color-slider
      :state="state"
      :show="showBrightness(state.mode)"
      label="Brightness"
      @change="handleBrightnessChange"
      type="brightness"
    ></color-slider>

    <core-box mt="lg" v-if="state.mode === 'PULSE'">
      <core-label>Pulse speed</core-label>
      <input
        class="range"
        type="range"
        :style="{ transform: 'rotate(180deg)' }"
        min="10"
        max="500"
        :value="state.pulseSpeed"
        @input="handlePulseSpeedInputChange"
      />
    </core-box>

    <core-box mt="lg" v-if="state.mode === 'RAINBOW'">
      <core-label>Rainbow speed</core-label>
      <input
        class="range"
        type="range"
        min="0"
        max="255"
        :value="state.rainbowSpeed"
        @input="handleRainbowSpeedInputChange"
      />
    </core-box>
  </core-box>
</template>

<script>
import colorSlider from "./color-slider.vue";
export default {
  components: { colorSlider },
  props: {
    state: Object,
  },
  methods: {
    handleModeTabClick(e) {
      this.$emit("mode-change", e.target.value);
    },
    handleHueChange(v) {
      this.$emit("hue-change", v);
    },
    handleBrightnessChange(v) {
      this.$emit("brightness-change", v);
    },
    handleSaturationChange(v) {
      this.$emit("saturation-change", v);
    },
    handlePulseSpeedInputChange(e) {
      this.$emit("pulse-speed-change", parseInt(e.target.value));
    },
    handleRainbowSpeedInputChange(e) {
      this.$emit("rainbow-speed-change", parseInt(e.target.value));
    },
    showHue(mode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    showBrightness(mode) {
      return mode === "SIMPLE";
    },
    showSaturation(mode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
  },
};
</script>
