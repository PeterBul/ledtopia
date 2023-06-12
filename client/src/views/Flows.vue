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
            <core-text size="xxl">Flows</core-text>
          </core-flex>
        </core-box>

        <core-box py="lg" v-if="loadingFlows">
          <core-flex justify-content="center" align-items="center">
            <spinner></spinner>
          </core-flex>
        </core-box>

        <div class="device-grid">
          <div :key="flow.id" v-for="flow in allFlows">
            <flow-card
              :flow="flow"
              :removeFlow="removeFlow"
              :updateFlow="updateFlow"
            ></flow-card>
          </div>

          <div>
            <core-button
              full
              variant="primary"
              size="lg"
              @click="() => addFlow()"
            >
              Add flow
            </core-button>
          </div>
        </div>
      </core-box>
    </core-container>
  </div>
</template>

<script lang="ts">
import {
  ALL_FLOWS,
  ADD_FLOW,
  UPDATE_FLOW,
  REMOVE_FLOW,
  FLOW_ADDED,
  FLOW_UPDATED,
  FLOW_REMOVED,
} from "../api/queries";
import { getData, subscribeData } from "../api/getData";
import FlowCard from "@/components/flow-card.vue";
import Spinner from "../components/spinner.vue";
import { defineComponent } from "vue";
import { IFlow } from "@/interfaces/IFlow";

export default defineComponent({
  name: "flows-page",
  components: { FlowCard, Spinner },
  async created() {
    subscribeData({ query: FLOW_ADDED }, ({ flowAdded }) => {
      console.log("flow added");
      if (flowAdded) {
        this.allFlows.push(flowAdded);
      }
    });

    subscribeData({ query: FLOW_UPDATED }, ({ flowUpdated }) => {
      console.log("flow updated");
      if (flowUpdated) {
        this.allFlows = this.allFlows.map((flow) =>
          flowUpdated.id === flow.id ? flowUpdated : flow
        );
      }
    });

    subscribeData({ query: FLOW_REMOVED }, ({ flowRemoved }) => {
      console.log("flow removed");
      if (flowRemoved) {
        this.allFlows = this.allFlows.filter((flow) => flowRemoved !== flow.id);
      }
    });

    console.log("Getting devices");
    this.getAllFlows();
  },
  data() {
    return {
      loadingFlows: false,
      allFlows: [] as IFlow[],
    };
  },
  methods: {
    async getAllFlows() {
      const { allFlows } = await getData({
        query: ALL_FLOWS,
      });
      this.allFlows = allFlows;
    },
    async addFlow(input = {}) {
      await getData({
        query: ADD_FLOW,
        variables: {
          input: { ...input },
        },
      });
    },
    async removeFlow(id: string) {
      console.log("Removing flow");
      await getData({
        query: REMOVE_FLOW,
        variables: {
          id,
        },
      });
    },
    async updateFlow(id: string, input = {}) {
      await getData({
        query: UPDATE_FLOW,
        variables: {
          id,
          input,
        },
      });
    },
  },
});
</script>

<style></style>
