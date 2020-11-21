<template>
  <div id="app">
    <core-container center>
      <core-box v-if="isSearching">Looking for devices</core-box>
      <core-box v-if="!isSearching && !Object.keys(lights).length">Couldn't find any devices</core-box>
      <core-box
        depth="sm"
        radius="md"
        border="ui"
        p="lg"
        :key="ip"
        v-for="(light, ip, i) in lights"
      >
        <core-text tag="p" size="xs">{{ ip }}</core-text>
        <core-text tag="h2">Device nr.{{i + 1}}</core-text>
        <core-box mt="lg">
          <core-label>Mode</core-label>
          <core-tabs
            class="tab-buttons"
            :value="light.mode"
            @change="e => setLightState(ip, { mode: e.target.value})"
          >
            <core-tab value="SIMPLE">Simple</core-tab>
            <core-tab value="PULSE">Pulse</core-tab>
            <core-tab>Rainbow</core-tab>
          </core-tabs>
        </core-box>
        <core-box mt="lg">
          <core-label>Hue</core-label>
          <input
            class="hue-range"
            type="range"
            min="0"
            max="255"
            :value="light.hue"
            @input="e => setLightState(ip, { hue: parseInt(e.target.value) })"
          />
        </core-box>
        <core-box mt="lg">
          <core-label>Saturation</core-label>
          <input
            class="saturation-range"
            type="range"
            min="0"
            max="255"
            :style="{ '--color': `${getHex(light.hue, 100, 100)}`}"
            :value="light.saturation"
            @input="e => setLightState(ip, { saturation: parseInt(e.target.value) })"
          />
        </core-box>
        <core-box mt="lg">
          <core-label>Brightness</core-label>
          <input
            class="brightness-range"
            type="range"
            min="0"
            max="100"
            :style="{ '--color': `${getHex(light.hue, 100, 100)}`}"
            :value="light.brightness"
            @input="e => setLightState(ip, { brightness: parseInt(e.target.value) })"
          />
        </core-box>
        <core-box mt="lg" v-if="light.mode === 'PULSE'">
          <core-label>Pulse speed</core-label>
          <input
            class="range"
            type="range"
            min="0"
            max="10"
            :value="100"
            @input="e => setLightState(ip, { pulseSpeed: parseInt(e.target.value)})"
          />
        </core-box>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import { merge } from "lodash";
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
  mode: "SIMPLE",
  on: false,
  hue: 0,
  saturation: 255,
  brightness: 255,
  pulseSpeed: 200,
};

export default {
  name: "App",
  async mounted() {
    this.getDevices();
  },
  data() {
    return {
      isSearching: true,
      lights: {},
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
      this.lights = allLights.reduce((acc, light) => {
        return {
          ...acc,
          [light.ip]: { ...initialLightState },
        };
      }, {});
      this.isSearching = false;
    },
    async setLightState(ip, state) {
      const oldState = this.lights[ip];
      const newState = merge(oldState, state);
      this.lights[ip] = newState;
      await getData({
        query: SET_LIGHT_STATE,
        variables: {
          ip,
          state: newState,
        },
      });
    },
  },
};
</script>

<style>
</style>
