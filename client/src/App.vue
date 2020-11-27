<template>
  <div id="app">
    <core-container size="sm" center>
      <core-box px="lg" py="xl">
        <core-box pb="xl">
          <core-text size="md">LEDTOPIA</core-text>
        </core-box>
        <core-box pb="xl">
          <core-flex align-items="center" justify-content="between">
            <core-text size="xxl">My scene</core-text>
            <core-toggle></core-toggle>
          </core-flex>
        </core-box>
        <core-box v-if="!isSearching && !Object.keys(allLights).length">Couldn't find any devices</core-box>
        <div class="device-grid">
          <div :key="light.id" v-for="light in allLights">
            <light-card :light="light" :removeLight="removeLight" :updateLight="updateLight" />
          </div>
          <div>
            <core-button full variant="primary" size="lg" @click="showAddLight = true">Add device</core-button>
          </div>
        </div>
      </core-box>
      <core-modal
        heading="Devices"
        @toggle="e => showAddLight = e.target.open"
        :open="showAddLight"
      >
        <core-box my="lg" :key="device.ip" v-for="device in allDevices">
          <core-button
            :disabled="deviceIsTaken(device.ip)"
            full
            @click="handleAddDevice(device.ip)"
          >
            {{device.ip}}
            {{ deviceIsTaken(device.ip) ? '(taken)' : '' }}
          </core-button>
        </core-box>
      </core-modal>
    </core-container>
  </div>
</template>

<script>
import { getData } from "./api/getData";
import LightCard from "./components/light-card";

const ALL_DEVICES = /* GraphQL */ `
  query {
    allDevices {
      ip
    }
  }
`;

const ALL_LIGHTS = /* GraphQL */ `
  query {
    allLights {
      ip
      id
      name
      state {
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
    }
  }
`;

const UPDATE_LIGHT = /* GraphQL */ `
  mutation UpdateLight($id: ID!, $input: UpdateLightInput!) {
    updateLight(id: $id, input: $input) {
      ip
      id
      name
      state {
        mode
        brightness
        saturation
        hue
        pulseSpeed
        rainbowSpeed
      }
    }
  }
`;

const REMOVE_LIGHT = /* GraphQL */ `
  mutation RemoveLight($id: ID!) {
    removeLight(id: $id)
  }
`;

const ADD_LIGHT = /* GraphQL */ `
  mutation AddLight($ip: String!, $name: String) {
    addLight(ip: $ip, name: $name) {
      id
    }
  }
`;

export default {
  name: "App",
  components: { LightCard },
  async mounted() {
    this.getAllLights();
  },
  data() {
    return {
      showAddLight: false,
      isSearching: false,
      allLights: [],
      allDevices: [],
    };
  },
  watch: {
    showAddLight: function (show) {
      if (show) {
        this.getAllDevices();
      }
    },
  },
  methods: {
    deviceIsTaken(ip) {
      return this.allLights.some((light) => light.ip === ip);
    },
    async getAllDevices() {
      const { allDevices } = await getData({
        query: ALL_DEVICES,
      });
      this.allDevices = allDevices;
    },
    async getAllLights() {
      this.isSearching = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.allLights = allLights;
      this.isSearching = false;
    },
    handleAddDevice(ip) {
      const isTaken = this.deviceIsTaken(ip);
      if (isTaken) return;
      this.showAddLight = false;
      this.addLight(ip);
    },
    async addLight(ip) {
      await getData({
        query: ADD_LIGHT,
        variables: {
          ip,
        },
      });
      this.getAllLights();
    },
    async removeLight(id) {
      await getData({
        query: REMOVE_LIGHT,
        variables: {
          id,
        },
      });
      this.getAllLights();
    },
    async updateLight(id, input) {
      const { updateLight } = await getData({
        query: UPDATE_LIGHT,
        variables: {
          id,
          input,
        },
      });
      this.allLights = this.allLights.map((light) =>
        light.id === id ? updateLight : light
      );
    },
  },
};
</script>

<style>
</style>
