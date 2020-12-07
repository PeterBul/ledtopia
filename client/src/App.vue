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
              :copyLight="copyLight"
              :getDevices="getAllDevices"
              :allDevices="deviceOptions"
              :light="light"
              :removeLight="removeLight"
              :updateLight="updateLight"
            />
          </div>
          <div>
            <core-button full variant="primary" size="lg" @click="() => addLight()">Add light</core-button>
          </div>
        </div>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import {
  ALL_DEVICES,
  ALL_LIGHTS,
  LIGHT_ADDED,
  UPDATE_LIGHT,
  REMOVE_LIGHT,
  ADD_LIGHT,
  LIGHT_UPDATED,
  LIGHT_REMOVED,
} from "./api/queries";
import { getData, subscribeData } from "./api/getData";
import LightCard from "./components/light-card";
import Spinner from "./components/spinner";

export default {
  name: "App",
  components: { LightCard, Spinner },
  async mounted() {
    subscribeData({ query: LIGHT_ADDED }, ({ lightAdded }) => {
      if (lightAdded) {
        this.allLights.push(lightAdded);
      }
    });

    subscribeData({ query: LIGHT_UPDATED }, ({ lightUpdated }) => {
      if (lightUpdated) {
        this.allLights = this.allLights.map((light) =>
          lightUpdated.id === light.id ? lightUpdated : light
        );
      }
    });

    subscribeData({ query: LIGHT_REMOVED }, ({ lightRemoved }) => {
      if (lightRemoved) {
        this.allLights = this.allLights.filter(
          (light) => lightRemoved !== light.id
        );
      }
    });

    this.getAllDevices();
    this.getAllLights();
  },
  data() {
    return {
      loadingLights: false,
      isSearching: false,
      allLights: [],
      allDevices: [],
    };
  },
  computed: {
    deviceOptions() {
      return this.allDevices.map((device) => ({
        ...device,
        isTaken: this.deviceIsTaken(device.id),
      }));
    },
  },
  methods: {
    deviceIsTaken(id) {
      return this.allLights.some((light) => light.device?.id === id);
    },
    copyLight(state) {
      this.addLight({ state });
    },
    async getAllDevices() {
      const { allDevices } = await getData({
        query: ALL_DEVICES,
      });
      this.allDevices = allDevices;
    },
    async getAllLights() {
      this.loadingLights = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.allLights = allLights;
      this.loadingLights = false;
    },
    async addLight(input = {}) {
      await getData({
        query: ADD_LIGHT,
        variables: {
          input,
        },
      });
    },
    async removeLight(id) {
      await getData({
        query: REMOVE_LIGHT,
        variables: {
          id,
        },
      });
    },
    async updateLight(id, input) {
      await getData({
        query: UPDATE_LIGHT,
        variables: {
          id,
          input,
        },
      });
    },
  },
};
</script>

<style>
</style>
