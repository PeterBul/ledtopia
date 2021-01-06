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
          <core-toggle
            :checked="light.state.on"
            @click.prevent
            @change.prevent="e => updateLight(light.id, { state: { on: e.target.checked }})"
          ></core-toggle>
          <core-overlay position-x="right">
            <core-button variant="transparent" @click.prevent slot="trigger" full tabindex="0">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </core-button>
            <core-menu style="min-width: 150px" slot="content">
              <core-menu-item @click.prevent="() => copyLight(light.state)">Copy</core-menu-item>
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
        >{{device.id}} {{device.isTaken ? "(taken)" : ""}} {{ device.isOnline ? "" : "offline" }}</option>
      </select>
    </core-box>

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
    copyLight: Function,
    allDevices: Array,
    light: Object,
    updateLight: Function,
    removeLight: Function,
  },
  computed: {
    deviceOptions() {
      const lightId = this.light.device?.id;

      if (!lightId)
        return this.allDevices.map((device) => ({ ...device, isOnline: true }));

      const devices = this.allDevices
        .filter((device) => device.id !== lightId)
        .map((device) => ({ ...device, isOnline: true }));

      const light = {
        ...this.light.device,
        isOnline: this.allDevices.some((device) => device.id === lightId),
        isTaken: false,
      };

      return [...devices, { ...light }];
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
  },
};
</script>
