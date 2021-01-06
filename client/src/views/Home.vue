<template>
  <div id="app">
    <core-container size="sm" center>
      <core-box px="lg">
        <core-box pb="xl">
          <core-flex align-items="center" justify-content="between">
            <core-text size="xxl">My scenes</core-text>
            <core-toggle></core-toggle>
          </core-flex>
        </core-box>
        <div class="device-grid">
          <router-link
            tag="core-box"
            clickable
            radius="md"
            p="lg"
            depth="lg"
            bg="ui-weaker"
            v-for="scene in allScenes"
            :key="scene.id"
            :to="'scene/' + scene.id "
          >
            <core-flex justify-content="between">
              <div>
                <core-text tag="h2" size="lg">{{scene.name}}</core-text>
                <core-text>{{ scene.lights.length }} lights</core-text>
              </div>
              <core-button @click.prevent="handleRemoveScene">Delete</core-button>
            </core-flex>
          </router-link>
          <div>
            <core-button full variant="primary" size="lg" @click="() => addScene()">Create scene</core-button>
          </div>
        </div>
      </core-box>
    </core-container>
  </div>
</template>

<script>
import {
  ALL_SCENES,
  SCENE_ADDED,
  ADD_SCENE,
  REMOVE_SCENE,
} from "../api/queries";
import { subscribeData, getData } from "../api/getData";

export default {
  name: "Home",
  async created() {
    subscribeData({ query: SCENE_ADDED }, ({ sceneAdded }) => {
      console.log("what");
      if (sceneAdded) {
        this.allScenes.push(sceneAdded);
      }
    });

    this.getAllScenes();
  },
  data() {
    return {
      allScenes: [],
    };
  },
  methods: {
    async getAllScenes() {
      const { allScenes } = await getData({
        query: ALL_SCENES,
      });
      this.allScenes = allScenes;
    },
    async handleRemoveScene(id) {
      await getData({
        query: REMOVE_SCENE,
        variables: {
          id,
        },
      });
    },
    async addScene(input = {}) {
      await getData({
        query: ADD_SCENE,
        variables: {
          input,
        },
      });
    },
  },
};
</script>

<style>
</style>
