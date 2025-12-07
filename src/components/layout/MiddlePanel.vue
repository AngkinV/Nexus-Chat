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
        <MessageList :messages="chatStore.messages" />
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
import { inject } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Phone, Search, MoreFilled } from '@element-plus/icons-vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageInput from '@/components/chat/MessageInput.vue'

const chatStore = useChatStore()
const toggleRightPanel = inject('toggleRightPanel')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const handleSendMessage = (content, type = 'TEXT') => {
  chatStore.sendMessage({
    chatId: chatStore.activeChat.id,
    content,
    type
  })
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
