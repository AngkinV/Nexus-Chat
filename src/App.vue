<template>
  <div class="app-container">
    <TitleBar v-if="isElectron" />
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import TitleBar from '@/components/common/TitleBar.vue'

const userStore = useUserStore()
const isElectron = ref(false)

onMounted(() => {
  // Check if running in Electron
  isElectron.value = !!window.electronAPI
  
  // Check if user is logged in
  const token = localStorage.getItem('token')
  if (token) {
    userStore.loadUserFromStorage()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure Element Plus message components appear above custom title bar */
.el-message {
  z-index: 10001 !important;
  margin-top: 40px !important; /* Account for title bar height */
}

.el-notification {
  z-index: 10001 !important;
  margin-top: 40px !important;
}
</style>
