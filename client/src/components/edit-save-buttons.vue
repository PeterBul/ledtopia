<template>
  <div>
    <core-button
      v-if="isEditing"
      class="mx-xxs"
      size="sm"
      @click="handleDoneEditing"
      ><ion-icon name="save-outline"></ion-icon
    ></core-button>
    <core-button
      v-if="isEditing"
      class="mx-xxs"
      size="sm"
      @click="handleCancelEditing"
      ><ion-icon name="close-circle-outline"></ion-icon
    ></core-button>
    <core-button v-else class="mx-xxs" size="sm" @click.prevent="handleEdit"
      ><ion-icon name="create-outline"></ion-icon
    ></core-button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isEditing: Boolean,
  },
  methods: {
    handleEdit() {
      this.$emit("edit");
    },
    handleDoneEditing() {
      this.$emit("done");
    },
    handleCancelEditing() {
      this.$emit("cancel");
    },
  },
});
</script>
