<template>
  <div id="app">
    <core-container center>
      <core-box v-if="isSearching">Looking for devices</core-box>
      <core-box v-if="!isSearching && !lights.length">Couldn't find any devices</core-box>
      <core-box
        depth="sm"
        radius="md"
        border="ui"
        p="lg"
        :key="light.ip"
        v-for="(light, i) in lights"
      >
        <core-text tag="p" size="xs">{{ light.ip }}</core-text>
        <core-text tag="h2">Device nr.{{i + 1}}</core-text>
        <core-box mt="lg">
          <core-label>Mode</core-label>
          <core-tabs
            class="tab-buttons"
            :value="light.type"
            @onChange="e => light.type = e.target.value"
          >
            <core-tab value="RAINBOW">Rainbow</core-tab>
            <core-tab value="SIMPLE">Simple</core-tab>
            <core-tab value="PULSE">Pulse</core-tab>
          </core-tabs>
        </core-box>
        <core-box mt="lg">
          <core-label>Hue</core-label>
          <input
            class="hue-range"
            type="range"
            min="0"
            max="360"
            :value="light.color.h"
            @input="e => setHue(light, parseInt(e.target.value))"
          />
        </core-box>
        <core-box mt="lg">
          <core-label>Saturation</core-label>
          <input
            class="saturation-range"
            type="range"
            min="0"
            max="100"
            :style="{ '--color': `${getHex(light.color.h, 255, 100)}`}"
            :value="light.color.s"
            @input="e => setSaturation(light, parseInt(e.target.value))"
          />
        </core-box>
        <core-box mt="lg">
          <core-label>Brightness</core-label>
          <input
            class="brightness-range"
            type="range"
            min="0"
            max="100"
            :style="{ '--color': `${getHex(light.color.h, 255, 100)}`}"
            :value="light.color.v"
            @input="e => setBrightness(light, parseInt(e.target.value))"
          />
        </core-box>

        <core-box mt="lg">
          <core-label>Color picker</core-label>
          <input
            class="color-picker"
            type="color"
            :value="getHex(light.color.h, light.color.s, light.color.v)"
            @input="e => setColor(light, e.target.value)"
          />
        </core-box>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import convertColor from "color-convert";
import { getData } from "./api/getData";

const ALL_LIGHTS = /* GraphQL */ `
  query {
    allLights {
      ip
    }
  }
`;

const SET_LIGHT_STATE = /* GraphQL */ `
  mutation SetLight($ip: String!, $state: LightState!) {
    setLightState(ip: $ip, state: $state) {
      ip
    }
  }
`;

const initialLightState = {
  type: "SIMPLE",
  on: false,
  brightness: 255,
  color: {
    h: 0,
    s: 255,
    v: 100,
  },
};

export default {
  name: "App",
  async mounted() {
    //this.getDevices();
  },
  data() {
    return {
      isSearching: true,
      lights: [{ ...initialLightState }],
    };
  },
  methods: {
    getHex(h, s, v) {
      const hex = convertColor.hsv.hex(h, s, v);
      return `#${hex}`;
    },
    async getDevices() {
      this.isSearching = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.lights = allLights.map((light) => ({
        ...light,
        ...initialLightState,
      }));
      this.isSearching = false;
    },
    setColor(light, value) {
      const hsv = convertColor.hex.hsv(value);
      light.color.h = hsv[0];
      light.color.s = hsv[1];
      light.color.v = hsv[2];
      this.setLightState(light.ip, {
        type: light.type,
        color: {
          h: hsv[0],
          s: hsv[1],
          v: hsv[2],
        },
      });
    },
    setSaturation(light, value) {
      light.color.s = value;
      this.setLightState(light.ip, {
        type: light.type,
        color: {
          h: light.color.h,
          s: value,
          v: light.color.v,
        },
      });
    },
    setBrightness(light, value) {
      light.color.v = value;
      this.setLightState(light.ip, {
        type: light.type,
        color: {
          h: light.color.h,
          s: light.color.s,
          v: value,
        },
      });
    },
    setHue(light, value) {
      light.color.h = value;
      this.setLightState(light.ip, {
        type: light.type,
        color: {
          h: value,
          s: light.color.s,
          v: light.color.v,
        },
      });
    },
    async setLightState(ip, state) {
      await getData({
        query: SET_LIGHT_STATE,
        variables: {
          ip,
          state,
        },
      });
    },
  },
};
</script>

<style>
</style>
