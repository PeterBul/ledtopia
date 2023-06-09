<template>
  <div class="container">
    {{ name }}
    <input
      type="color"
      class="dark-input color-input"
      :value="value"
      v-on="listeners"
      :placeholder="name"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ColorOption extends Vue {
  @Prop({ type: String, default: "" })
  value!: string;

  @Prop({ type: String })
  name!: string;

  get v() {
    return this.value;
  }

  get listeners(): any {
    return {
      ...this.$listeners,
      input: (ev: any) => this.$emit("input", ev.target.value),
    };
  }
}
</script>
<style>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-input {
  max-width: 80px;
  height: 35px;
}
</style>
