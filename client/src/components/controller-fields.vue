<template>
  <core-box mt="lg">
    <core-text size="md"> Fields </core-text>
    <details class="card-1" :key="index" v-for="(field, index) in fields">
      <summary>
        <core-flex align-items="center">
          <input
            ref="fieldName"
            class="text-input"
            v-if="editIndex === index"
            v-model="tempFieldName"
            @blur="handleDoneEditingFieldName"
            @keyup.esc="handleCancelEditFieldValue"
          />

          <core-text @click.prevent="handleEditFieldName(index)" v-else>
            {{ field.name }}
          </core-text>

          <div class="ml-auto flex">
            <EditSaveButtons
              :isEditing="editIndex === index"
              @done="handleDoneEditingFieldName"
              @edit="handleEditFieldName(index)"
              @cancel="handleCancelEditFieldValue"
            ></EditSaveButtons>

            <delete-button
              @on-delete="() => handleRemoveField(index)"
            ></delete-button>
          </div>
        </core-flex>
      </summary>
      <core-box ml="xs" mt="sm">
        <core-flex align-items="center">
          <core-label left size="md">Type:</core-label>
          <select
            :value="controller.advancedFields[index].type"
            @change="(e) => handleSelectFieldType(e, index)"
          >
            <option value="ENUM">Enum</option>
            <option value="INTEGER">Integer</option>
          </select>
          <core-box
            v-if="field.type === 'ENUM'"
            flex
            ml="md"
            align-items="center"
          >
            <core-label left size="md">Enum:</core-label>
            <select @change="(e) => handleSelectFieldEnum(e, index)">
              <option
                value="none"
                :selected="!controller.advancedFields[index].value"
              >
                None
              </option>
              <option
                :key="i"
                v-for="(enumm, i) in allEnums"
                :value="enumm.id"
                :selected="controller.advancedFields[index].value === enumm.id"
              >
                {{ enumm.name }}
              </option>
            </select>
          </core-box>
        </core-flex>
      </core-box>
    </details>
    <core-box mt="md">
      <core-button
        full
        size="md"
        variant="primary"
        @click.prevent="handleNewClick"
        >Add field</core-button
      >
    </core-box>
  </core-box>
</template>
<script lang="ts">
import EditSaveButtons from "./edit-save-buttons.vue";
import DeleteButton from "./delete-button.vue";
import { PropType } from "vue";
import {
  IController,
  IUpdateController,
  e_FieldType,
} from "@/interfaces/IController";
import { getData, subscribeData } from "@/api/getData";
import {
  ALL_ENUMS,
  ENUM_ADDED,
  ENUM_REMOVED,
  ENUM_UPDATED,
} from "@/api/queries";
import { IEnum } from "@/interfaces/IEnum";

export default {
  components: { EditSaveButtons, DeleteButton },
  props: {
    controller: {
      type: Object as PropType<IController>,
      required: true,
    },
    updateController: {
      type: Function as PropType<IUpdateController>,
      required: true,
    },
  },
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
  computed: {
    fields() {
      return this.controller.advancedFields;
    },
  },
  data() {
    return {
      editIndex: -1,
      tempFieldName: "",
      allEnums: [] as IEnum[],
    };
  },
  methods: {
    getFieldValue(index: number) {
      return this.controller.advancedFields[index].value;
    },
    handleNewClick() {
      const newIndex = this.fields.length;
      this.updateController(this.controller.id, {
        advancedFields: [
          ...this.controller.advancedFields,
          { type: "ENUM", name: "", value: null },
        ],
      });
      this.handleEditFieldName(newIndex);
    },
    handleRemoveField(index: number) {
      this.updateController(this.controller.id, {
        advancedFields: this.controller.advancedFields.filter(
          (_, i) => i !== index
        ),
      });
    },
    handleEditFieldName(index: number) {
      this.editIndex = index;
      this.tempFieldName = this.controller.advancedFields[index].name;
      type This = typeof this;
      setTimeout(
        function (this: This) {
          const fieldName = this.$refs.fieldName as HTMLInputElement[];
          if (fieldName?.[0]) {
            console.log("here");
            fieldName[0].focus();
          }
        }.bind(this),
        0
      );
    },
    handleDoneEditingFieldName() {
      this.updateController(this.controller.id, {
        advancedFields: this.controller.advancedFields.map((val, i) =>
          i === this.editIndex ? { ...val, name: this.tempFieldName } : val
        ),
      });
      this.editIndex = -1;
    },
    handleCancelEditFieldValue() {
      console.log("cancel");
      this.editIndex = -1;
    },
    preventToggleDetailsOnButton(e: Event) {
      if (document.activeElement?.nodeName.toLowerCase().includes("button")) {
        e.preventDefault();
      }
    },
    handleSelectFieldType(e: Event, index: number) {
      const target = e.target as HTMLSelectElement;
      if (this.controller.advancedFields[index].type === target.value) {
        return;
      }
      const advancedFields = this.controller.advancedFields.map((field, i) => {
        if (i !== index) return field;
        return { ...field, type: target.value as e_FieldType };
      });
      this.updateController(this.controller.id, {
        advancedFields,
      });
    },
    handleSelectFieldEnum(e: Event, index: number) {
      const target = e.target as HTMLSelectElement;
      if (this.controller.advancedFields[index]?.value === target.value) {
        return;
      }
      const advancedFields = this.controller.advancedFields.map((field, i) => {
        if (i !== index) return field;
        return {
          ...field,
          value: target.value === "none" ? null : target.value,
        };
      });
      this.updateController(this.controller.id, {
        advancedFields,
      });
    },
    async getAllEnums() {
      const { allEnums } = await getData({
        query: ALL_ENUMS,
      });
      this.allEnums = allEnums;
    },
  },
};
</script>
