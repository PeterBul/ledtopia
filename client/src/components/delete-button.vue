<template>
  <core-button
    class="mx-xxs"
    variant="danger"
    size="sm"
    @click.prevent="handleDelete"
    ><ion-icon name="trash-outline"></ion-icon
  ></core-button>
</template>
<script lang="ts">
export default {
  methods: {
    handleDelete() {
      this.$emit("on-delete");
    },
  },
};
</script>
