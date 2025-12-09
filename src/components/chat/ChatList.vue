<template>
  <div class="chat-list">
    <div
      v-for="chat in filteredChats"
      :key="chat.id"
      class="chat-item"
      :class="{ active: chatStore.activeChat?.id === chat.id }"
      @click="selectChat(chat)"
    >
      <div class="chat-avatar">
        <el-avatar :size="50" :src="chat.avatar || defaultAvatar" />
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
}

.chat-item {
  display: flex;
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 10px;
  margin: 2px 8px;
}

.chat-item:hover {
  background: #f1f1f1;
}

.chat-item.active {
  background: #3390ec;
}

.chat-item.active .chat-name,
.chat-item.active .last-message,
.chat-item.active .chat-time {
  color: #ffffff;
}

.chat-avatar {
  position: relative;
  margin-right: 12px;
}

.online-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #00c73e;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-weight: 600;
  font-size: 15px;
  color: #1c1c1e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #8e8e93;
}

.chat-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 14px;
  color: #8e8e93;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
}

.unread-badge {
  background: #c4c9cc; /* Default gray for unread */
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 0 6px;
  height: 20px;
  min-width: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-item.active .unread-badge {
  background: #ffffff;
  color: #3390ec;
}
</style>
