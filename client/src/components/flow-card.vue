<template>
  <core-box class="list-card">
    <core-flex align-items="center">
      <input
        ref="name"
        class="text-input"
        v-if="isEditingName"
        v-model="tempName"
        @keyup.esc="handleCancelEditingClick"
        @blur="handleDoneEditingClick"
      />

      <core-text @click.prevent="handleEditClick" v-else>
        {{ flow.name }}
      </core-text>

      <div class="ml-auto">
        <core-button
          v-if="isEditingName"
          class="mx-xxs"
          size="sm"
          @click="handleDoneEditingClick"
        >
          <ion-icon name="save-outline"></ion-icon>
        </core-button>

        <core-button
          v-if="isEditingName"
          class="mx-xxs"
          size="sm"
          @click="handleCancelEditingClick"
        >
          <ion-icon name="close-circle-outline"></ion-icon>
        </core-button>

        <router-link :to="'flow/' + flow.id">
          <core-button class="mx-xxs" size="sm">
            <ion-icon name="git-branch-outline"></ion-icon>
          </core-button>
        </router-link>

        <core-button
          v-if="!isEditingName"
          class="mx-xxs"
          size="sm"
          @click.prevent="handleEditClick"
        >
          <ion-icon name="create-outline"></ion-icon>
        </core-button>

        <core-button
          class="mx-xxs"
          variant="danger"
          size="sm"
          @click="handleRemoveFlow"
        >
          <ion-icon name="trash-outline"></ion-icon>
        </core-button>
      </div>
    </core-flex>
  </core-box>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import EditSaveButtons from "./edit-save-buttons.vue";
import DeleteButton from "./delete-button.vue";
import { IFlow } from "@/interfaces/IFlow";

// interface IRefs {
//   enumValue: HTMLElement[];
//   name: HTMLElement;
// }

export default defineComponent({
  props: {
    flow: {
      type: Object as PropType<IFlow>,
      required: true,
    },
    removeFlow: {
      type: Function,
      required: true,
    },
    updateFlow: {
      type: Function,
      required: true,
    },
  },
  components: { DeleteButton, EditSaveButtons },
  data() {
    return {
      isEditingName: false,
      tempName: this.flow.name,
    };
  },
  methods: {
    handleRemoveFlow(e: MouseEvent) {
      e.preventDefault();
      this.removeFlow(this.flow.id);
    },
    handleEditClick() {
      this.tempName = this.flow.name;
      this.isEditingName = true;
      type This = typeof this;
      setTimeout(
        function (this: This) {
          (this.$refs.name as HTMLInputElement | undefined)?.focus();
        }.bind(this),
        0
      );
    },
    handleCancelEditingClick(e: KeyboardEvent) {
      e.preventDefault();
      this.isEditingName = false;
    },
    handleDoneEditingClick(e: FocusEvent) {
      e.preventDefault();
      this.updateFlow(this.flow.id, { name: this.tempName });
      this.isEditingName = false;
    },
  },
});
</script>

<style>
ion-icon {
  color: white;
}
</style>
