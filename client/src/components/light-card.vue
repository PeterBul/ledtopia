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
            @change.prevent="handleToggleOn"
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
              <core-menu-item
                @click.prevent="() => copyLight && copyLight(light.state)"
              >
                Copy
              </core-menu-item>

              <core-menu-item @click="handleRemoveLight">Delete</core-menu-item>
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
        :value="light.controlMode"
        @change="handleChangeControlMode"
      >
        <core-tab value="SIMPLE">Simple</core-tab>
        <core-tab value="ADVANCED">Advanced</core-tab>
      </core-tabs>
    </core-box>

    <div v-if="light.controlMode === 'SIMPLE'">
      <device-selector
        :device="light.device"
        :allDevices="allDevices"
        @select-device="handleSelectDevice"
      ></device-selector>

      <simple-color-settings
        :state="light.state"
        @mode-change="handleModeChange"
        @hue-change="handleHueChange"
        @brightness-change="handleBrightnessChange"
        @saturation-change="handleSaturationChange"
        @pulse-speed-change="handlePulseSpeedChange"
        @rainbow-speed-change="handleRainbowSpeedChange"
      ></simple-color-settings>
    </div>
    <div v-else>
      <FlowSelector
        @select-flow="handleSelectFlow"
        :flow="light.flow"
        :all-flows="allFlows"
      ></FlowSelector>
    </div>
  </details>
</template>

<script lang="ts">
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
import DeviceSelector from "./device-selector.vue";
import { PropType } from "vue";
import { ILight, IRemoveLight, IUpdateLight } from "@/interfaces/ILight";
import { isControlMode } from "@/interfaces/IController";
import FlowSelector from "./flow-selector.vue";
import { IFlow } from "@/interfaces/IFlow";

export default {
  props: {
    copyLight: Function,
    allDevices: Array,
    light: { type: Object as PropType<ILight>, required: true },
    updateLight: { type: Function as PropType<IUpdateLight>, required: true },
    removeLight: { type: Function as PropType<IRemoveLight>, required: true },
    allFlows: { type: Array as PropType<IFlow[]>, required: true },
  },
  components: { SimpleColorSettings, DeviceSelector, FlowSelector },
  // computed: {
  //   deviceOptions() {
  //     const lightDeviceId = this.light.device?.id;

  //     if (!lightDeviceId)
  //       return this.allDevices.map((device) => ({ ...device, isOnline: true }));

  //     const isOtherDevices = (device) => device.id !== lightDeviceId;
  //     const otherDevices = this.allDevices
  //       .filter(isOtherDevices)
  //       .map((device) => ({ ...device, isOnline: true }));

  //     // This is the current light, so the device is taken, but for this light
  //     const light = {
  //       ...this.light.device,
  //       isOnline: this.allDevices.some((device) => device.id === lightDeviceId),
  //       isTaken: false,
  //     };

  //     return [...otherDevices, { ...light }];
  //   },
  // },
  methods: {
    handleSelectDevice(deviceId: string) {
      if (deviceId === "none") {
        this.updateLight(this.light.id, {
          deviceId: null,
        });
      } else {
        this.updateLight(this.light.id, { deviceId });
      }
    },
    handleSelectFlow(flowId: string) {
      if (flowId === "none") {
        this.updateLight(this.light.id, {
          flowId: null,
        });
      } else {
        this.updateLight(this.light.id, { flowId });
      }
    },
    handleRemoveLight(e: MouseEvent) {
      e.preventDefault();
      this.removeLight(this.light.id);
    },
    handleModeChange(value: string) {
      updateMode(this.light.id, value);
    },
    getHex(h: number, s: number, v: number) {
      const multiplyHue = 360 / 255;
      const hex = convertColor.hsv.hex([h * multiplyHue, s, v]);
      return `#${hex}`;
    },
    handleHueChange(hue: number) {
      updateHue(this.light.id, hue);
    },
    handleBrightnessChange(brightness: number) {
      updateBrightness(this.light.id, brightness);
    },
    handleSaturationChange(saturation: number) {
      updateSaturation(this.light.id, saturation);
    },
    handlePulseSpeedChange(pulseSpeed: number) {
      updatePulseSpeed(this.light.id, pulseSpeed);
    },
    handleRainbowSpeedChange(rainbowSpeed: number) {
      updateRainbowSpeed(this.light.id, rainbowSpeed);
    },
    handleToggleOn(e: ChangeEvent<HTMLInputElement>) {
      this.updateLight(this.light.id, { state: { on: e.target.checked } });
    },
    handleChangeControlMode(e: ChangeEvent<HTMLSelectElement>) {
      if (!isControlMode(e.target.value)) return;
      this.updateLight(this.light.id, { controlMode: e.target.value });
    },
  },
};
</script>
