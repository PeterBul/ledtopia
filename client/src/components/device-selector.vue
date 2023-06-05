<template>
  <core-box mt="lg">
    <core-label>Device</core-label>

    <select
      :value="device && device.id ? device.id : 'none'"
      @change="handleSelectDevice"
    >
      <option value="none">None</option>

      <option
        :disabled="device.isTaken"
        :key="i"
        :value="device.id"
        v-for="(device, i) in deviceOptions"
      >
        {{ device.id }} {{ device.isTaken ? "(taken)" : "" }}
        {{ device.isOnline ? "" : "offline" }}
      </option>
    </select>
  </core-box>
</template>

<script>
export default {
  props: {
    device: Object,
    allDevices: Array,
  },
  computed: {
    deviceOptions() {
      const thisDeviceId = this.device?.id;

      if (!thisDeviceId)
        return this.allDevices.map((device) => ({ ...device, isOnline: true }));

      const isOtherDevices = (device) => device.id !== thisDeviceId;
      const otherDevices = this.allDevices
        .filter(isOtherDevices)
        .map((device) => ({ ...device, isOnline: true }));

      const thisDevice = {
        ...this.device,
        isOnline: this.allDevices.some((device) => device.id === thisDeviceId),
        isTaken: false,
      };

      return [...otherDevices, { ...thisDevice }];
    },
  },
  methods: {
    handleSelectDevice(e) {
      this.$emit("select-device", e.target.value);
    },
  },
};
</script>
