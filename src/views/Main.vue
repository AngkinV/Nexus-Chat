<template>
  <div class="main-layout">
    <LeftPanel class="panel-left" ref="leftPanelRef" />
    <MiddlePanel class="panel-middle" @open-new-chat="handleOpenNewChat" />
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
const leftPanelRef = ref(null)

// Handle open new chat from MiddlePanel
const handleOpenNewChat = () => {
  // Trigger the create group modal in LeftPanel
  // This is a simple approach - you could also use provide/inject or event bus
  if (leftPanelRef.value) {
    // LeftPanel already has its own openNewChat method
    leftPanelRef.value.$el.querySelector('.icon-btn-new')?.click()
  }
}

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

      // Load pending friend requests
      await contactStore.fetchPendingRequests(userId)

      // Load chats from backend
      await chatStore.fetchChats(userId)

      // Connect WebSocket with callback to subscribe to all chats
      websocket.connect(userId, subscribeToAllChats)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }
})

// Subscribe to all existing chat rooms
const subscribeToAllChats = () => {
  console.log('Subscribing to all chats:', chatStore.chats.length)
  chatStore.chats.forEach(chat => {
    if (!chatStore.isChatSubscribed(chat.id)) {
      websocket.subscribeToChatRoom(chat.id)
      chatStore.markChatSubscribed(chat.id)
      console.log('Subscribed to chat:', chat.id, chat.name)
    }
  })
}
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
  transition: background 0.3s ease;
}

.panel-left {
  width: 380px;
  min-width: 320px;
  max-width: 420px;
  border-right: 1px solid #f1f5f9;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
  transition: all 0.3s ease;
}

.panel-middle {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  position: relative;
  background: transparent;
  z-index: 1;
}

.panel-right {
  width: 25%;
  min-width: 280px;
  max-width: 380px;
  border-left: 1px solid #f1f5f9;
  height: 100%;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 5;
  position: relative;
}

.panel-right.collapsed {
  margin-right: -25%;
  display: none;
}

/* Dark Mode */
[data-theme="dark"] .main-layout {
  background: #0F1115;
}

[data-theme="dark"] .panel-left {
  background: rgba(24, 27, 33, 0.8);
  border-right-color: #232730;
}

[data-theme="dark"] .panel-right {
  background: rgba(24, 27, 33, 0.9);
  border-left-color: #232730;
}

@media (max-width: 900px) {
  .panel-left {
    width: 100%;
    max-width: none;
  }

  .panel-middle {
    display: none;
  }

  .panel-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  }

  [data-theme="dark"] .panel-right {
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  }
}
</style>
