<template>
  <details class="list-card">
    <summary>
      <core-flex align-items="center" justify-content="between">
        <core-flex align-items="center" justify-content="start">
          <div
            :style="{
              marginRight: 'var(--core-space-sm)',
              background: `${getHex(controller.simpleState.hue, 100, 100)}`,
              height: '20px',
              width: '20px',
              borderRadius: '50%',
            }"
          ></div>
          <core-text size="lg">{{ controller.name || "Device" }}</core-text>
        </core-flex>
        <core-flex align-items="center" justify-content="end">
          <core-toggle
            :checked="controller.simpleState.on"
            @click.prevent
            @change.prevent="
              (e) =>
                updateController(controller.id, {
                  simpleState: { on: e.target.checked },
                })
            "
          ></core-toggle>
          <core-overlay position-x="right">
            <core-button
              variant="transparent"
              @click.prevent
              slot="trigger"
              full
              tabindex="0"
            >
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </core-button>
            <core-menu style="min-width: 150px" slot="content">
              <core-menu-item @click="handleRemoveController"
                >Delete</core-menu-item
              >
            </core-menu>
          </core-overlay>
        </core-flex>
      </core-flex>
    </summary>

    <core-box mt="lg">
      <core-label>Control Mode</core-label>
      <core-tabs
        full
        class="tab-buttons"
        :value="controller.controlMode"
        @change="
          (e) =>
            updateController(controller.id, {
              controlMode: e.target.value,
            })
        "
      >
        <core-tab value="SIMPLE">Simple</core-tab>
        <core-tab value="ADVANCED">Advanced</core-tab>
      </core-tabs>
    </core-box>

    <simple-color-settings
      v-if="controller.controlMode === 'SIMPLE'"
      :state="controller.simpleState"
      @mode-change="handleModeChange"
      @hue-change="handleHueChange"
      @brightness-change="handleBrightnessChange"
      @saturation-change="handleSaturationChange"
      @pulse-speed-change="handlePulseSpeedChange"
      @rainbow-speed-change="handleRainbowSpeedChange"
    ></simple-color-settings>
  </details>
</template>

<script>
import convertColor from "color-convert";
import SimpleColorSettings from "./simple-color-settings.vue";

export default {
  props: {
    allDevices: Array,
    controller: Object,
    updateController: Function,
    removeController: Function,
  },
  components: { SimpleColorSettings },
  methods: {
    handleRemoveController(e) {
      e.preventDefault();
      this.removeController(this.controller.id);
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
    getHex(h, s, v) {
      const multiplyHue = 360 / 255;
      const hex = convertColor.hsv.hex(h * multiplyHue, s, v);
      return `#${hex}`;
    },
    handleModeChange(mode) {
      this.updateController(this.controller.id, {
        simpleState: { mode },
      });
    },
    handleHueChange(v) {
      this.updateController(this.controller.id, {
        simpleState: { hue: v },
      });
    },
    handleBrightnessChange(v) {
      this.updateController(this.controller.id, {
        simpleState: { brightness: v },
      });
    },
    handleSaturationChange(v) {
      this.updateController(this.controller.id, {
        simpleState: { saturation: v },
      });
    },
    handlePulseSpeedChange(v) {
      this.updateController(this.controller.id, {
        simpleState: { pulseSpeed: v },
      });
    },
    handleRainbowSpeedChange(v) {
      this.updateController(this.controller.id, {
        simpleState: { rainbowSpeed: v },
      });
    },
  },
};
</script>
