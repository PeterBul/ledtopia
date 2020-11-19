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
          <core-label>Brightness: {{light.brightness}}</core-label>
          <input type="color" @input="e => changeColor(light, e.target.value)" />
        </core-box>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import { hexToRgb } from "./utils";
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

export default {
  name: "App",
  async mounted() {
    this.getDevices();
  },
  data() {
    return {
      isSearching: true,
      lights: [],
    };
  },
  methods: {
    async getDevices() {
      this.isSearching = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.lights = allLights.map((light) => ({
        ...light,
        on: false,
        brightness: 255,
      }));
      this.isSearching = false;
    },
    async changeColor(light, value) {
      const { r, g, b } = hexToRgb(value);
      await getData({
        query: SET_LIGHT_STATE,
        variables: {
          ip: light.ip,
          state: {
            color: {
              r: r,
              g: g,
              b: b,
            },
          },
        },
      });
    },
  },
};
</script>

<style>
</style>
