<template>
  <div id="app">
    <core-container size="sm" center>
      <core-box px="lg" py="lg">
        <core-button @click="$router.push('/')" variant="transparent">
          <ion-icon name="arrow-back-outline" slot="start"></ion-icon>Back
        </core-button>
      </core-box>
      <core-box px="lg" pb="xl">
        <core-box pb="xl">
          <core-flex align-items="center" justify-content="between">
            <core-text size="xxl">Enums</core-text>
          </core-flex>
        </core-box>
        <core-box py="lg" v-if="loadingLights">
          <core-flex justify-content="center" align-items="center">
            <spinner></spinner>
          </core-flex>
        </core-box>
        <div class="device-grid">
          <div :key="enumm.id" v-for="enumm in allEnums">
            <enum-card
              :enumm="enumm"
              :removeEnum="removeEnum"
              :updateEnum="updateEnum"
            />
          </div>
          <div>
            <core-button
              full
              variant="primary"
              size="lg"
              @click="() => addEnum()"
              >Add enum</core-button
            >
          </div>
        </div>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import {
  ENUM_ADDED,
  ENUM_UPDATED,
  ENUM_REMOVED,
  ALL_ENUMS,
  REMOVE_ENUM,
  ADD_ENUM,
  UPDATE_ENUM,
} from "../api/queries";
import { getData, subscribeData } from "../api/getData";
import EnumCard from "../components/enum-card";
import Spinner from "../components/spinner";

export default {
  name: "Enum",
  components: { EnumCard, Spinner },
  async created() {
    subscribeData({ query: ENUM_ADDED }, ({ enumAdded }) => {
      console.log("enum added");
      if (enumAdded) {
        this.allEnums.push(enumAdded);
      }
    });

    subscribeData({ query: ENUM_UPDATED }, ({ enumUpdated }) => {
      console.log("enum updated");
      if (enumUpdated) {
        this.allEnums = this.allEnums.map((enumm) =>
          enumUpdated.id === enumm.id ? enumUpdated : enumm
        );
      }
    });

    subscribeData({ query: ENUM_REMOVED }, ({ enumRemoved }) => {
      console.log("enum removed");
      if (enumRemoved) {
        this.allEnums = this.allEnums.filter(
          (enumm) => enumRemoved !== enumm.id
        );
      }
    });

    console.log("Getting devices");
    this.getAllEnums();
  },
  data() {
    return {
      loadingEnums: false,
      isSearching: false,
      allEnums: [],
    };
  },
  methods: {
    async getAllEnums() {
      const { allEnums } = await getData({
        query: ALL_ENUMS,
      });
      this.allEnums = allEnums;
    },
    async addEnum(input = {}) {
      await getData({
        query: ADD_ENUM,
        variables: {
          input: { ...input },
        },
      });
    },
    async removeEnum(id) {
      console.log("Removing enum");
      await getData({
        query: REMOVE_ENUM,
        variables: {
          id,
        },
      });
    },
    async updateEnum(id, input = {}) {
      await getData({
        query: UPDATE_ENUM,
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
