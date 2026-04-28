<script setup>
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
</script>

<template>
  <div class="flex h-screen bg-background">
    <Sidebar v-if="route.name !== 'login'" />
    <main class="flex-1 overflow-y-auto p-0" :class="{'p-8': route.name != 'login'} ">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
