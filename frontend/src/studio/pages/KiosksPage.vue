<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import DeviceRegistry from "../components/DeviceRegistry.vue";
</script>
<template>
  <section>
    <PageHeader title="Kiosks" description="Connect and manage your kiosk fleet." />
    <DeviceRegistry surface="kiosks" />
  </section>
</template>
