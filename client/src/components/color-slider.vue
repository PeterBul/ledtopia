<template>

  <core-box mt="lg" v-if="show">

    <core-label>{{ label }}</core-label>

    <input
      :class="className"
      type="range"
      min="0"
      max="255"
      :value="value"
      :style="style"
      @input="(e) => handleInput(parseInt(e.target.value))"
    />

  </core-box>

</template>

<script>
import convertColor from "color-convert";

export default {
  props: {
    state: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    className() {
      return `range ${this.type}-range`;
    },
    value() {
      return this.state[this.type];
    },
    style() {
      if (this.type === "saturation" || this.type === "brightness") {
        return { "--color": `${this.getHex(this.state.hue, 100, 100)}` };
      } else {
        return {};
      }
    },
  },
  methods: {
    getHex(h, s, v) {
      const multiplyHue = 360 / 255;
      const hex = convertColor.hsv.hex(h * multiplyHue, s, v);
      return `#${hex}`;
    },
    handleInput(value) {
      this.$emit("change", value);
    },
  },
};
</script>

