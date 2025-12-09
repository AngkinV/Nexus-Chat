<template>
  <div class="main-layout">
    <LeftPanel class="panel-left" />
    <MiddlePanel class="panel-middle" />
    <RightPanel class="panel-right" :class="{ 'collapsed': !showRightPanel }" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import LeftPanel from '@/components/layout/LeftPanel.vue'
import MiddlePanel from '@/components/layout/MiddlePanel.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import { useUserStore } from '@/stores/user'
import { useContactStore } from '@/stores/contact'
import { useChatStore } from '@/stores/chat'
import websocket from '@/services/websocket'

const userStore = useUserStore()
const contactStore = useContactStore()
const chatStore = useChatStore()

const showRightPanel = ref(false)

// Provide global state for panels
provide('toggleRightPanel', () => {
  showRightPanel.value = !showRightPanel.value
})
provide('showRightPanel', showRightPanel)

// Load data on mount
onMounted(async () => {
  // Ensure user is loaded
  if (!userStore.currentUser) {
    userStore.loadUserFromStorage()
  }

  const userId = userStore.currentUser?.id
  if (userId) {
    try {
      // Load contacts from backend
      await contactStore.fetchContacts(userId)

      // Load chats from backend
      await chatStore.fetchChats(userId)

      // Connect WebSocket
      websocket.connect(userId)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.panel-left {
  width: 25%;
  min-width: 280px;
  max-width: 400px;
  border-right: 1px solid #e5e5e5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-middle {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.panel-right {
  width: 25%;
  min-width: 250px;
  max-width: 350px;
  border-left: 1px solid #e5e5e5;
  height: 100%;
  transition: margin-right 0.3s ease;
}

.panel-right.collapsed {
  margin-right: -25%; /* Hide by moving off-screen */
  display: none; /* Or use display: none for simpler handling */
}

@media (max-width: 900px) {
  .panel-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background: white;
    z-index: 100;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  }
}
</style>
