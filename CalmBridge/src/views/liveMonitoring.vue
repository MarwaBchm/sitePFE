<script setup>
import { useRealtimeData } from '../composables/useRealtimeData';

const { latestData, bufferSize } = useRealtimeData();
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">
      Live Monitoring
    </h1>

    <div v-if="!latestData">
      Waiting for realtime data...
    </div>

    <div v-else class="space-y-4">

      <div class="p-4 border rounded-xl">
        <h2 class="font-bold">Heart Rate</h2>
        <p>{{ latestData.hr }}</p>
      </div>

      <div class="p-4 border rounded-xl">
        <h2 class="font-bold">HRV</h2>
        <p>{{ latestData.hrv }}</p>
      </div>

      <div class="p-4 border rounded-xl">
        <h2 class="font-bold">GSR</h2>
        <p>{{ latestData.gsr }}</p>
      </div>

      <div class="p-4 border rounded-xl">
        <h2 class="font-bold">Buffer Size</h2>
        <p>{{ bufferSize }}</p>
      </div>

    </div>
  </div>
</template>