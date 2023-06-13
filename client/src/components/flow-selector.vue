<template>
  <core-box mt="lg">
    <core-label>Flow</core-label>

    <select :value="flowValue" @change="handleSelectFlow">
      <option value="none">None</option>

      <option :key="i" :value="flow.id" v-for="(flow, i) in flowOptions">
        {{ flow.name }}
      </option>
    </select>
  </core-box>
</template>

<script lang="ts">
import { IFlow } from "@/interfaces/IFlow";
import { ID } from "@/interfaces/ILight";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  props: {
    flow: { type: Object as PropType<ID | null> },
    allFlows: { type: Array as PropType<IFlow[]>, required: true },
  },
  computed: {
    flowOptions() {
      return this.allFlows;
    },
    flowValue() {
      return this.flow?.id || "none";
    },
  },
  methods: {
    handleSelectFlow(e: Event) {
      if (!e.target) return;
      this.$emit("select-flow", (e.target as HTMLInputElement).value);
    },
  },
});
</script>
