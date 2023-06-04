<template>

  <div id="app">

    <core-container size="sm" center>

      <core-box px="lg" py="lg">

        <core-button @click="$router.push('/')" variant="transparent">

          <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
           Back
        </core-button>

      </core-box>

      <core-box px="lg" pb="xl">

        <core-box pb="xl">

          <core-flex align-items="center" justify-content="between">

            <core-text size="xxl">Controllers</core-text>

            <core-toggle></core-toggle>

          </core-flex>

        </core-box>

        <core-box py="lg" v-if="loadingControllers || loadingLights">

          <core-flex justify-content="center" align-items="center">

            <spinner></spinner>

          </core-flex>

        </core-box>

        <div class="device-grid">

          <div :key="controller.id" v-for="controller in allControllers">

            <controller-card
              :allDevices="deviceOptions"
              :controller="controller"
              :removeController="removeController"
              :updateController="updateController"
            />

          </div>

          <div>

            <core-button
              full
              variant="primary"
              size="lg"
              @click="() => addController()"
            >
               Add controller
            </core-button>

          </div>

        </div>

      </core-box>

    </core-container>

  </div>

</template>

<script>
import {
  ALL_DEVICES,
  ALL_CONTROLLERS,
  DEVICES_UPDATED,
  CONTROLLER_ADDED,
  CONTROLLER_UPDATED,
  CONTROLLER_REMOVED,
  ALL_LIGHTS,
  ADD_CONTROLLER,
  UPDATE_CONTROLLER,
  REMOVE_CONTROLLER,
} from "../api/queries";
import { getData, subscribeData } from "../api/getData";
import Spinner from "../components/spinner.vue";
import ControllerCard from "../components/controller-card.vue";

export default {
  name: "controllers-page",
  components: { ControllerCard, Spinner },
  async created() {
    subscribeData({ query: CONTROLLER_ADDED }, ({ controllerAdded }) => {
      console.log("added");
      if (controllerAdded) {
        this.allControllers.push(controllerAdded);
      }
    });

    subscribeData({ query: CONTROLLER_UPDATED }, ({ controllerUpdated }) => {
      if (controllerUpdated) {
        this.allControllers = this.allControllers.map((controller) =>
          controllerUpdated.id === controller.id
            ? controllerUpdated
            : controller
        );
      }
    });

    subscribeData({ query: CONTROLLER_REMOVED }, ({ controllerRemoved }) => {
      if (controllerRemoved) {
        this.allControllers = this.allControllers.filter(
          (controller) => controllerRemoved !== controller.id
        );
      }
    });

    subscribeData({ query: DEVICES_UPDATED }, ({ devicesUpdated }) => {
      if (devicesUpdated) {
        this.allDevices = devicesUpdated;
      }
    });
    console.log("Getting devices");
    this.getAllDevices();
    this.getAllControllers();
  },
  data() {
    return {
      loadingControllers: false,
      loadingLights: false,
      isSearching: false,
      allControllers: [],
      allDevices: [],
      allLights: [],
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
      return (
        this.allLights.some((light) => light.device?.id === id) ||
        this.allControllers.some((controller) => controller.device?.id === id)
      );
    },
    async getAllDevices() {
      const { allDevices } = await getData({
        query: ALL_DEVICES,
      });
      this.allDevices = allDevices;
    },
    async getAllControllers() {
      this.loadingControllers = true;
      const { allControllers } = await getData({
        query: ALL_CONTROLLERS,
      });
      this.allControllers = allControllers;
      this.loadingControllers = false;
    },
    async getAllLights() {
      this.loadingLights = true;
      const { allLights } = await getData({
        query: ALL_LIGHTS,
      });
      this.allLights = allLights;
      this.loadingLights = false;
    },
    async addController(input = {}) {
      await getData({
        query: ADD_CONTROLLER,
        variables: {
          input: {
            ...input,
            advancedFields: input.advancedFields ? input.advancedFields : [],
          },
        },
      });
    },
    async removeController(id) {
      await getData({
        query: REMOVE_CONTROLLER,
        variables: {
          id,
        },
      });
    },
    async updateController(id, input = {}) {
      await getData({
        query: UPDATE_CONTROLLER,
        variables: {
          id,
          input,
        },
      });
    },
  },
};
</script>

<style></style>

