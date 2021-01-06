<template>
  <div>
    <core-container size="sm" center>
      <core-box px="lg" py="xl">
        <router-link to="/">
          <core-text size="md">LEDTOPIA</core-text>
        </router-link>
      </core-box>
    </core-container>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {};
</script>
