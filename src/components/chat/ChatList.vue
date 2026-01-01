<template>
  <div class="chat-list">
    <div
      v-for="chat in filteredChats"
      :key="chat.id"
      class="chat-item"
      :class="{ active: chatStore.activeChat?.id === chat.id }"
      @click="selectChat(chat)"
    >
      <div class="active-indicator" v-if="chatStore.activeChat?.id === chat.id"></div>
      <div class="chat-avatar">
        <el-avatar :size="52" :src="chat.avatar || defaultAvatar" class="avatar-img" />
        <div v-if="chat.online" class="online-badge"></div>
      </div>
      <div class="chat-content">
        <div class="chat-top">
          <span class="chat-name">{{ chat.name }}</span>
          <span class="chat-time">{{ formatTime(chat.lastMessageTime) }}</span>
        </div>
        <div class="chat-bottom">
          <span class="last-message">{{ chat.lastMessage }}</span>
          <div v-if="chat.unreadCount > 0" class="unread-badge">
            {{ chat.unreadCount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import dayjs from 'dayjs'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const chatStore = useChatStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const filteredChats = computed(() => {
  if (!props.searchQuery) return chatStore.chats
  return chatStore.chats.filter(chat => 
    chat.name.toLowerCase().includes(props.searchQuery.toLowerCase())
  )
})

const selectChat = (chat) => {
  chatStore.toggleActiveChat(chat)
}

const formatTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm')
}
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 20px;
  margin: 0 4px;
  position: relative;
  overflow: hidden;
}

.chat-item:hover {
  background: #f1f5f9;
  transform: scale(1.02);
}

.chat-item:active {
  transform: scale(0.98);
}

.chat-item.active {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #14b8a6 0%, #06b6d4 100%);
  border-radius: 0 4px 4px 0;
}

.chat-avatar {
  position: relative;
  margin-right: 14px;
  flex-shrink: 0;
}

.avatar-img {
  border-radius: 18px;
}

.avatar-img :deep(.el-avatar) {
  border-radius: 18px;
}

.online-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #10b981;
  border: 3px solid #ffffff;
  border-radius: 50%;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  min-width: 0;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.chat-name {
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

.chat-item.active .chat-name {
  color: #0d9488;
}

.chat-time {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-item.active .chat-time {
  color: #14b8a6;
}

.chat-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
  font-weight: 500;
}

.chat-item.active .last-message {
  color: #475569;
}

.unread-badge {
  background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 0 7px;
  height: 20px;
  min-width: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
  flex-shrink: 0;
}

.chat-item.active .unread-badge {
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
}

/* Dark Mode */
[data-theme="dark"] .chat-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .chat-item.active {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
  border: 1px solid rgba(20, 184, 166, 0.3);
}

[data-theme="dark"] .online-badge {
  border-color: #181B21;
}

[data-theme="dark"] .chat-name {
  color: #e2e8f0;
}

[data-theme="dark"] .chat-item.active .chat-name {
  color: #5eead4;
}

[data-theme="dark"] .chat-time {
  color: #64748b;
}

[data-theme="dark"] .chat-item.active .chat-time {
  color: #2dd4bf;
}

[data-theme="dark"] .last-message {
  color: #94a3b8;
}

[data-theme="dark"] .chat-item.active .last-message {
  color: #cbd5e1;
}
</style>
