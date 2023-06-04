<template>
  <details ref="details" class="list-card">
    <summary
      @keyup="($event) => isEditingName && $event.preventDefault()"
      @click="preventToggleDetailsOnButton"
      @keyup.enter="preventToggleDetailsOnButton"
    >
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
          {{ enumm.name }}
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

          <core-button
            v-if="!isEditingName"
            class="mx-xxs"
            size="sm"
            @click.prevent="handleNewClick"
          >
            <ion-icon name="add-circle-outline"></ion-icon>
          </core-button>

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
            @click="handleRemoveEnum"
          >
            <ion-icon name="trash-outline"></ion-icon>
          </core-button>
        </div>
      </core-flex>
    </summary>

    <br />

    <core-flex direction="column">
      <div class="card-1" :key="index" v-for="(val, index) in enumm.values">
        <core-text class="enum-number-prefix">{{ index }}</core-text>

        <core-flex align-items="center">
          <input
            ref="enumValue"
            class="text-input"
            v-if="editIndex === index"
            v-model="tempEnumValue"
            @blur="handleDoneEditingEnumValue"
            @keyup.esc="handleCancelEditingEnumValue"
          />

          <core-text @click.prevent="handleEditEnumValue(index)" v-else>
            {{ val }}
          </core-text>

          <div class="ml-auto flex">
            <EditSaveButtons
              :isEditing="editIndex === index"
              @done="handleDoneEditingEnumValue"
              @edit="handleEditEnumValue(index)"
              @cancel="handleCancelEditingEnumValue"
            ></EditSaveButtons>

            <delete-button
              @on-delete="() => handleRemoveEnumValue(index)"
            ></delete-button>
          </div>
        </core-flex>
      </div>
    </core-flex>
  </details>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import EditSaveButtons from "./edit-save-buttons.vue";
import DeleteButton from "./delete-button.vue";

interface IRefs {
  details: {
    open: boolean;
  };
  enumValue: HTMLElement[];
  name: HTMLElement;
}

interface IEnum {
  id: string;
  name: string;
  values: string[];
}

export default defineComponent({
  props: {
    enumm: {
      type: Object as PropType<IEnum>,
      required: true,
    },
    removeEnum: {
      type: Function,
      required: true,
    },
    updateEnum: {
      type: Function,
      required: true,
    },
  },
  components: { DeleteButton, EditSaveButtons },
  data() {
    return {
      isEditingName: false,
      tempName: this.enumm.name,
      isDetailsOpen: false,
      editIndex: -1,
      tempEnumValue: "",
    };
  },
  methods: {
    handleRemoveEnum(e: MouseEvent) {
      e.preventDefault();
      this.removeEnum(this.enumm.id);
    },
    handleEditClick() {
      this.tempName = this.enumm.name;
      this.isEditingName = true;
      this.isDetailsOpen = true;
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
      this.updateEnum(this.enumm.id, { name: this.tempName });
      this.isEditingName = false;
    },
    handleNewClick(e: MouseEvent) {
      console.log(this.$refs.details);
      if (this.$refs.details) {
        console.log("set to open");
        (this.$refs.details as HTMLDetailsElement).open = true;
      }
      e.preventDefault();
      const newIndex = this.enumm.values.length;
      this.updateEnum(this.enumm.id, { values: [...this.enumm.values, ""] });
      this.handleEditEnumValue(newIndex);
    },
    handleRemoveEnumValue(index: number) {
      this.updateEnum(this.enumm.id, {
        values: this.enumm.values.filter((_: any, i: number) => i !== index),
      });
    },
    handleEditEnumValue(index: number) {
      this.editIndex = index;
      this.isEditingName = false;
      this.tempEnumValue = this.enumm.values[index];
      setTimeout(
        function () {
          // @ts-ignore
          const refs: IRefs = this.$refs;
          if (refs.enumValue?.[0]) {
            console.log("here");
            refs.enumValue[0].focus();
          }
        }.bind(this),
        0
      );
    },
    handleDoneEditingEnumValue() {
      this.updateEnum(this.enumm.id, {
        values: this.enumm.values.map((val, i) =>
          i === this.editIndex ? this.tempEnumValue : val
        ),
      });
      this.editIndex = -1;
    },
    handleCancelEditingEnumValue() {
      console.log("cancel");
      this.editIndex = -1;
    },
    preventToggleDetailsOnButton(e: Event) {
      if (document?.activeElement?.nodeName.toLowerCase().includes("button")) {
        e.preventDefault();
      }
    },
  },
});
</script>

<style>
ion-icon {
  color: white;
}
.enum-number-prefix {
  width: 1rem;
  margin-right: 0.5rem;
  color: grey;
}
</style>
