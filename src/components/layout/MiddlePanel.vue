<template>
  <div class="middle-panel">
    <template v-if="chatStore.activeChat">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-info" @click="toggleRightPanel">
          <el-avatar :size="40" :src="chatStore.activeChat.avatar || defaultAvatar" />
          <div class="chat-meta">
            <span class="chat-name">{{ chatStore.activeChat.name }}</span>
            <span class="chat-status">{{ $t('chat.' + (chatStore.activeChat.status || 'online')) }}</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button text circle><el-icon :size="20"><Phone /></el-icon></el-button>
          <el-button text circle><el-icon :size="20"><Search /></el-icon></el-button>
          <el-button text circle @click="toggleRightPanel"><el-icon :size="20"><MoreFilled /></el-icon></el-button>
        </div>
      </div>

      <!-- Message List -->
      <div class="messages-container">
        <MessageList :messages="currentMessages" />
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <MessageInput @send="handleSendMessage" />
      </div>
    </template>

    <div v-else class="empty-state">
      <span class="empty-text">{{ $t('chat.selectChat') }}</span>
    </div>
  </div>
</template>

<script setup>
import { inject, watch, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { messageAPI } from '@/services/api'
import websocket from '@/services/websocket'
import { Phone, Search, MoreFilled } from '@element-plus/icons-vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'

const chatStore = useChatStore()
const messageStore = useMessageStore()
const userStore = useUserStore()
const toggleRightPanel = inject('toggleRightPanel')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Get messages for current chat from messageStore
const currentMessages = computed(() => {
  if (!chatStore.activeChat) return []
  return messageStore.getMessages(chatStore.activeChat.id)
})

// Watch activeChat changes to load messages and subscribe to chat room
watch(() => chatStore.activeChat, async (newChat, oldChat) => {
  if (newChat && newChat.id !== oldChat?.id) {
    // Load chat messages if not already loaded
    try {
      const response = await messageAPI.getChatMessages(
        newChat.id,
        userStore.currentUser?.id,
        0,
        50
      )
      // Transform messages to match frontend format
      const transformedMessages = (response.data || []).map(m => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        senderName: m.senderNickname,
        senderAvatar: m.senderAvatar,
        content: m.content,
        type: m.messageType?.toUpperCase() || 'TEXT',
        fileUrl: m.fileUrl,
        timestamp: m.createdAt,
        createdAt: m.createdAt,
        isRead: m.isRead,
        isSelf: m.senderId === userStore.currentUser?.id
      }))
      messageStore.setMessages(newChat.id, transformedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }

    // Subscribe to chat room for real-time messages
    if (!chatStore.isChatSubscribed(newChat.id)) {
      websocket.subscribeToChatRoom(newChat.id)
      chatStore.markChatSubscribed(newChat.id)
    }
  }
}, { immediate: true })

const handleSendMessage = (content, type = 'TEXT') => {
  if (!chatStore.activeChat || !userStore.currentUser) return

  const chatId = chatStore.activeChat.id
  const user = userStore.currentUser

  // Create optimistic message (show immediately)
  const optimisticMessage = {
    id: `temp-${Date.now()}`,
    chatId: chatId,
    senderId: user.id,
    senderName: user.nickname,
    senderAvatar: user.avatar,
    content: content,
    type: type,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isRead: false,
    isSelf: true
  }

  // Add message to store immediately
  messageStore.addMessage(chatId, optimisticMessage)

  // Send message via WebSocket
  websocket.sendMessage(
    chatId,
    user.id,
    content,
    type.toLowerCase()
  )
}
</script>

<style scoped>
.middle-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff; /* Or a pattern background */
  position: relative;
}

.chat-header {
  height: 60px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  background: #ffffff;
  z-index: 10;
  cursor: pointer;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chat-meta {
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-weight: 600;
  font-size: 16px;
  color: #1c1c1e;
}

.chat-status {
  font-size: 13px;
  color: #3390ec;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  background-color: #8e8e931a; /* Very light gray/pattern placeholder */
}

.input-area {
  padding: 10px;
  background: #ffffff;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  color: #707579;
}

.empty-text {
  background: rgba(0, 0, 0, 0.06);
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 14px;
}
</style>
