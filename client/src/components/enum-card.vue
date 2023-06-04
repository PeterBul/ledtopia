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
        <core-text @click.prevent="handleEditClick" v-else>{{
          enumm.name
        }}</core-text>
        <div class="ml-auto">
          <core-button
            v-if="isEditingName"
            class="mx-xxs"
            size="sm"
            @click="handleDoneEditingClick"
            ><ion-icon name="save-outline"></ion-icon
          ></core-button>
          <core-button
            v-if="isEditingName"
            class="mx-xxs"
            size="sm"
            @click="handleCancelEditingClick"
            ><ion-icon name="close-circle-outline"></ion-icon
          ></core-button>
          <core-button
            v-if="!isEditingName"
            class="mx-xxs"
            size="sm"
            @click.prevent="handleNewClick"
            ><ion-icon name="add-circle-outline"></ion-icon
          ></core-button>
          <core-button
            v-if="!isEditingName"
            class="mx-xxs"
            size="sm"
            @click.prevent="handleEditClick"
            ><ion-icon name="create-outline"></ion-icon
          ></core-button>
          <core-button
            class="mx-xxs"
            variant="danger"
            size="sm"
            @click="handleRemoveEnum"
            ><ion-icon name="trash-outline"></ion-icon
          ></core-button>
        </div>
      </core-flex>
    </summary>
    <br />
    <core-flex direction="column">
      <div class="card-1" :key="index" v-for="(val, index) in enumm.values">
        <core-text class="enum-number-prefix">{{ index }}</core-text>
        <core-flex align-items="center">
          <input
            ref="enum-value"
            class="text-input"
            v-if="editIndex === index"
            v-model="tempEnumValue"
            @blur="handleDoneEditingEnumValue"
            @keyup.esc="handleCancelEditingEnumValue"
          />
          <core-text @click.prevent="handleEditEnumValue(index)" v-else>{{
            val
          }}</core-text>
          <div class="ml-auto flex">
            <EditSaveButtons
              :isEditing="editIndex === index"
              @done="handleDoneEditingEnumValue"
              @edit="handleEditEnumValue(index)"
              @cancel="handleCancelEditingEnumValue"
            ></EditSaveButtons>
            <delete-button
              @on-delete="($e) => handleRemoveEnumValue(e, index)"
            ></delete-button>
          </div>
        </core-flex>
      </div>
    </core-flex>
  </details>
</template>
<script>
import EditSaveButtons from "./edit-save-buttons.vue";
import DeleteButton from "./delete-button.vue";

export default {
  props: {
    enumm: {
      type: Object,
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
    handleRemoveEnum(e) {
      e.preventDefault();
      this.removeEnum(this.enumm.id);
    },
    handleEditClick() {
      this.tempName = this.enumm.name;
      this.isEditingName = true;
      this.isDetailsOpen = true;
      setTimeout(
        function () {
          this.$refs.name.focus();
        }.bind(this),
        0
      );
    },
    handleCancelEditingClick(e) {
      e.preventDefault();
      this.isEditingName = false;
    },
    handleDoneEditingClick(e) {
      e.preventDefault();
      this.updateEnum(this.enumm.id, { name: this.tempName });
      this.isEditingName = false;
    },
    handleNewClick(e) {
      console.log(this.$refs.details);
      if (this.$refs.details) {
        console.log("set to open");
        this.$refs.details.open = true;
      }
      e.preventDefault();
      const newIndex = this.enumm.values.length;
      this.updateEnum(this.enumm.id, { values: [...this.enumm.values, ""] });
      this.handleEditEnumValue(newIndex);
    },
    handleRemoveEnumValue(e, index) {
      this.updateEnum(this.enumm.id, {
        values: this.enumm.values.filter((_, i) => i !== index),
      });
    },
    handleEditEnumValue(index) {
      this.editIndex = index;
      this.isEditingName = false;
      this.tempEnumValue = this.enumm.values[index];
      setTimeout(
        function () {
          if (this.$refs["enum-value"]?.[0]) {
            console.log("here");
            this.$refs["enum-value"][0].focus();
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
    preventToggleDetailsOnButton(e) {
      if (document.activeElement.nodeName.toLowerCase().includes("button")) {
        e.preventDefault();
      }
    },
  },
};
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
