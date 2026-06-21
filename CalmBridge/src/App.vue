<script setup>
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'

const route = useRoute()

onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
})
</script>

<template>
  <div class="flex h-screen bg-background text-text overflow-hidden">
    <Sidebar v-if="route.name !== 'login'" />
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <HeaderBar v-if="route.name !== 'login'" />
      
      <main class="flex-1 overflow-y-auto p-0" :class="{'p-8': route.name != 'login'} ">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
