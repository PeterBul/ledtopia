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
          <input
            type="range"
            @change="e => adjustBrightness(light, e.target.value)"
            :value="light.brightness"
            min="0"
            max="255"
          />
        </core-box>
      </core-box>
    </core-container>
  </div>
</template>

<script>
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
    //this.getDevices();
  },
  data() {
    return {
      isSearching: true,
      lights: [
        {
          ip: "123",
          brightness: 255,
        },
      ],
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
    async adjustBrightness(light, value) {
      await getData({
        query: SET_LIGHT_STATE,
        variables: {
          ip: light.ip,
          state: {
            on: !light.on,
            brightness: parseInt(value),
          },
        },
      });
      light.brightness = value;
    },
  },
};
</script>

<style>
</style>
