<template>

  <details class="list-card">

    <summary>

      <core-flex align-items="center" justify-content="between">

        <core-flex align-items="center" justify-content="start">

          <div
            :style="{
              marginRight: 'var(--core-space-sm)',
              background: `${getHex(light.state.hue, 100, 100)}`,
              height: '20px',
              width: '20px',
              borderRadius: '50%',
            }"
          ></div>

          <core-text size="lg">{{ light.name || "Device" }}</core-text>

        </core-flex>

        <core-flex align-items="center" justify-content="end">

          <core-toggle
            :checked="light.state.on"
            @click.prevent
            @change.prevent="
              (e) => updateLight(light.id, { state: { on: e.target.checked } })
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

              <core-menu-item @click.prevent="() => copyLight(light.state)">
                 Copy
              </core-menu-item>

              <core-menu-item @click="handleRemoveLight">Delete</core-menu-item>

            </core-menu>

          </core-overlay>

        </core-flex>

      </core-flex>

    </summary>

    <core-box mt="lg">

      <core-label>Device</core-label>

      <select
        :value="light.device ? light.device && light.device.id : 'none'"
        @change="handleSelectDevice"
      >

        <option value="none">None</option>

        <option
          :disabled="device.isTaken"
          :key="i"
          :value="device.id"
          v-for="(device, i) in deviceOptions"
        >
           {{ device.id }} {{ device.isTaken ? "(taken)" : "" }} {{ device.isOnline
          ? "" : "offline" }}
        </option>

      </select>

    </core-box>

    <simple-color-settings
      :state="light.state"
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
import {
  updateHue,
  updateBrightness,
  updateSaturation,
  updatePulseSpeed,
  updateRainbowSpeed,
  updateMode,
} from "../utils/lights";

export default {
  props: {
    copyLight: Function,
    allDevices: Array,
    light: Object,
    updateLight: Function,
    removeLight: Function,
  },
  components: { SimpleColorSettings },
  computed: {
    deviceOptions() {
      const lightDeviceId = this.light.device?.id;

      if (!lightDeviceId)
        return this.allDevices.map((device) => ({ ...device, isOnline: true }));

      const isOtherDevices = (device) => device.id !== lightDeviceId;
      const otherDevices = this.allDevices
        .filter(isOtherDevices)
        .map((device) => ({ ...device, isOnline: true }));

      // This is the current light, so the device is taken, but for this light
      const light = {
        ...this.light.device,
        isOnline: this.allDevices.some((device) => device.id === lightDeviceId),
        isTaken: false,
      };

      return [...otherDevices, { ...light }];
    },
  },
  methods: {
    deviceIsTaken(device) {
      if (this.light.device && this.light.device.id === device) {
        return false;
      }
      if (device.isTaken) return true;
    },
    handleSelectDevice(e) {
      if (e.target.value === "none") {
        this.updateLight(this.light.id, {
          deviceId: null,
        });
      } else {
        this.updateLight(this.light.id, { deviceId: e.target.value });
      }
    },
    handleRemoveLight(e) {
      e.preventDefault();
      this.removeLight(this.light.id);
    },
    handleModeChange(value) {
      updateMode(this.light.id, value);
    },
    getHex(h, s, v) {
      const multiplyHue = 360 / 255;
      const hex = convertColor.hsv.hex(h * multiplyHue, s, v);
      return `#${hex}`;
    },
    handleHueChange(v) {
      updateHue(this.light.id, v);
    },
    handleBrightnessChange(v) {
      updateBrightness(this.light.id, v);
    },
    handleSaturationChange(v) {
      updateSaturation(this.light.id, v);
    },
    handlePulseSpeedChange(v) {
      updatePulseSpeed(this.light.id, v);
    },
    handleRainbowSpeedChange(v) {
      updateRainbowSpeed(this.light.id, v);
    },
  },
};
</script>

