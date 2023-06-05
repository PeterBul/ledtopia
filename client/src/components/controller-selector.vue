<template>

  <core-box mt="lg">

    <core-label>Controller</core-label>

    <select>

      <option value="none">None</option>

      <option :key="i" :value="device.id" v-for="(device, i) in deviceOptions">
         {{ device.id }} {{ device.isTaken ? "(taken)" : "" }} {{ device.isOnline
        ? "" : "offline" }}
      </option>

    </select>

  </core-box>

</template>

<script></script>
