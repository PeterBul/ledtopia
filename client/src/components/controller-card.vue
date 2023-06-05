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
              <core-menu-item @click="handleRemoveController">
                Delete
              </core-menu-item>
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
        @change="handleChangeControlMode"
      >
        <core-tab value="SIMPLE">Simple</core-tab>

        <core-tab value="ADVANCED">Advanced</core-tab>
      </core-tabs>
    </core-box>

    <simple-color-settings
      v-if="controller?.controlMode === 'SIMPLE'"
      :state="controller?.simpleState"
      @mode-change="handleModeChange"
      @hue-change="handleHueChange"
      @brightness-change="handleBrightnessChange"
      @saturation-change="handleSaturationChange"
      @pulse-speed-change="handlePulseSpeedChange"
      @rainbow-speed-change="handleRainbowSpeedChange"
    ></simple-color-settings>

    <device-selector
      v-if="controller?.controlMode === 'ADVANCED'"
      :device="controller?.device"
      :allDevices="allDevices"
      @select-device="handleSelectDevice"
    ></device-selector>
    <controller-fields
      :updateController="updateController"
      v-if="
        updateController && controller && controller.controlMode === 'ADVANCED'
      "
      :controller="controller"
    ></controller-fields>
  </details>
</template>

<script lang="ts">
import convert from "color-convert";
import SimpleColorSettings from "./simple-color-settings.vue";
import DeviceSelector from "./device-selector.vue";
import ControllerFields from "./controller-fields.vue";
import { PropType, defineComponent } from "vue";
import { IDevice } from "@/interfaces/IDevice";
import {
  IController,
  IRemoveController,
  IUpdateController,
  isControlMode,
} from "@/interfaces/IController";
import { e_BaseMode } from "@/interfaces/ILight";

export default defineComponent({
  props: {
    allDevices: Array as PropType<IDevice[]>,
    controller: { type: Object as PropType<IController>, required: true },
    updateController: Function as PropType<IUpdateController>,
    removeController: Function as PropType<IRemoveController>,
  },
  components: { ControllerFields, SimpleColorSettings, DeviceSelector },
  methods: {
    handleRemoveController(e: Event) {
      e.preventDefault();
      if (!this.controller || !this.removeController) {
        return;
      }
      this.removeController(this.controller.id);
    },
    showHue(mode: e_BaseMode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    showBrightness(mode: e_BaseMode) {
      return mode === "SIMPLE";
    },
    showSaturation(mode: e_BaseMode) {
      return mode === "SIMPLE" || mode === "PULSE";
    },
    getHex(h: number, s: number, v: number) {
      const multiplyHue = 360 / 255;
      const hex = convert.hsv.hex([h * multiplyHue, s, v]);
      return `#${hex}`;
    },
    handleModeChange(mode: e_BaseMode) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { mode },
      });
    },
    handleHueChange(hue: number) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { hue },
      });
    },
    handleBrightnessChange(brightness: number) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { brightness },
      });
    },
    handleSaturationChange(saturation: number) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { saturation },
      });
    },
    handlePulseSpeedChange(pulseSpeed: number) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { pulseSpeed },
      });
    },
    handleRainbowSpeedChange(rainbowSpeed: number) {
      if (!this.updateController || !this.controller) return;
      this.updateController(this.controller.id, {
        simpleState: { rainbowSpeed },
      });
    },
    handleSelectDevice(deviceId: string | null) {
      if (!this.updateController || !this.controller) return;
      if (deviceId === "none") {
        this.updateController(this.controller.id, {
          deviceId,
        });
      } else {
        this.updateController(this.controller.id, { deviceId });
      }
    },
    handleToggleOn(e: ChangeEvent<HTMLInputElement>) {
      if (!this.updateController) return;
      this.updateController(this.controller.id, {
        simpleState: { on: e.target.checked },
      });
    },
    handleChangeControlMode(e: ChangeEvent<HTMLSelectElement>) {
      if (!this.updateController || !this.controller) return;
      if (!isControlMode(e.target.value)) return;
      this.updateController(this.controller.id, {
        controlMode: e.target?.value,
      });
    },
    isControlMode,
  },
});
</script>
