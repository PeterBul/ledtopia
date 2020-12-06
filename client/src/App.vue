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
        <core-box py="lg" v-if="loadingLights">
          <core-flex justify-content="center" align-items="center">
            <spinner></spinner>
          </core-flex>
        </core-box>
        <div class="device-grid">
          <div :key="light.id" v-for="light in allLights">
            <light-card
              :allDevices="allDevices"
              :light="light"
              :removeLight="removeLight"
              :updateLight="updateLight"
            />
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
        <core-box py="lg" v-if="loadingDevices">
          <core-flex justify-content="center" align-items="center">
            <spinner></spinner>
          </core-flex>
        </core-box>
        <core-box my="lg" :key="device.id" v-for="device in allDevices">
          <core-button
            :disabled="deviceIsTaken(device.id)"
            full
            @click="handleAddDevice(device.id)"
          >
            {{device.id}}
            {{ deviceIsTaken(device.id) ? '(taken)' : '' }}
          </core-button>
        </core-box>
      </core-modal>
    </core-container>
  </div>
</template>

<script>
import { getData } from "./api/getData";
import LightCard from "./components/light-card";
import Spinner from "./components/spinner";

const ALL_DEVICES = /* GraphQL */ `
  query {
    allDevices {
      id
    }
  }
`;

const ALL_LIGHTS = /* GraphQL */ `
  query {
    allLights {
      id
      name
      device {
        id
      }
      state {
        on
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
      id
      name
      device {
        id
      }
      state {
        on
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
  mutation AddLight($deviceId: ID, $name: String) {
    addLight(deviceId: $deviceId, name: $name) {
      id
    }
  }
`;

export default {
  name: "App",
  components: { LightCard, Spinner },
  async mounted() {
    this.getAllDevices();
    this.getAllLights();
  },
  data() {
    return {
      loadingDevices: false,
      loadingLights: false,
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
    deviceIsTaken(mac) {
      return this.allLights.some((light) => light.device?.mac === mac);
    },
    async getAllDevices() {
      try {
        this.loadingDevices = true;
        const { allDevices } = await getData({
          query: ALL_DEVICES,
        });
        this.allDevices = allDevices;
      } catch (e) {
        console.log(e);
      } finally {
        this.loadingDevices = false;
      }
    },
    async getAllLights() {
      this.loadingLights = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.allLights = allLights;
      this.loadingLights = false;
    },
    handleAddDevice(mac) {
      const isTaken = this.deviceIsTaken(mac);
      if (isTaken) return;
      this.showAddLight = false;
      this.addLight(mac);
    },
    async addLight(mac) {
      await getData({
        query: ADD_LIGHT,
        variables: {
          mac,
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
