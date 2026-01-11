<template>
  <div class="chat-list">
    <div
      v-for="chat in filteredChats"
      :key="chat.id"
      class="chat-item-wrapper"
    >
      <!-- Swipe action buttons (hidden on the right) -->
      <div class="swipe-actions">
        <button
          class="action-btn pin-btn"
          @click.stop="handleTogglePin(chat)"
        >
          <span class="material-icons-round">push_pin</span>
          <span>{{ chatStore.isChatPinned(chat.id) ? $t('chat.unpin') : $t('chat.pin') }}</span>
        </button>
        <button
          class="action-btn delete-btn"
          @click.stop="handleDelete(chat)"
        >
          <span class="material-icons-round">delete</span>
          <span>{{ $t('common.delete') }}</span>
        </button>
      </div>

      <!-- Chat item (swipeable) -->
      <div
        class="chat-item"
        :class="{
          active: chatStore.activeChat?.id === chat.id,
          swiped: swipedChatId === chat.id
        }"
        :style="{ transform: `translateX(${getSwipeOffset(chat.id)}px)` }"
        @click="handleChatClick(chat)"
        @touchstart="onTouchStart($event, chat.id)"
        @touchmove="onTouchMove($event)"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown($event, chat.id)"
      >
        <div class="active-indicator" v-if="chatStore.activeChat?.id === chat.id"></div>

        <!-- Pin indicator -->
        <div v-if="chatStore.isChatPinned(chat.id)" class="pin-indicator">
          <span class="material-icons-round">push_pin</span>
        </div>

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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const chatStore = useChatStore()
const messageStore = useMessageStore()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Use sortedChats for pinned sorting
const filteredChats = computed(() => {
  const sorted = chatStore.sortedChats
  if (!props.searchQuery) return sorted
  return sorted.filter(chat =>
    chat.name.toLowerCase().includes(props.searchQuery.toLowerCase())
  )
})

// Swipe state
const swipedChatId = ref(null)
const swipeOffset = ref({})
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)
const SWIPE_THRESHOLD = 80 // px to trigger swipe action reveal

const getSwipeOffset = (chatId) => {
  return swipeOffset.value[chatId] || 0
}

const onTouchStart = (event, chatId) => {
  // Close any other swiped item
  if (swipedChatId.value && swipedChatId.value !== chatId) {
    closeSwipe(swipedChatId.value)
  }

  touchStartX.value = event.touches[0].clientX
  touchCurrentX.value = touchStartX.value
  isSwiping.value = false
}

const onTouchMove = (event) => {
  if (!touchStartX.value) return

  touchCurrentX.value = event.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value

  // Only allow left swipe (negative delta)
  if (deltaX < -10) {
    isSwiping.value = true
    // Find which chat is being swiped
    const chatId = getCurrentSwipingChatId(event)
    if (chatId) {
      // Limit the swipe distance
      const offset = Math.max(deltaX, -160)
      swipeOffset.value[chatId] = offset
    }
  }
}

const onTouchEnd = () => {
  if (!isSwiping.value) {
    touchStartX.value = 0
    return
  }

  const deltaX = touchCurrentX.value - touchStartX.value

  // Find which chat was swiped
  for (const chatId in swipeOffset.value) {
    if (swipeOffset.value[chatId] < -SWIPE_THRESHOLD) {
      // Snap to open position
      swipeOffset.value[chatId] = -160
      swipedChatId.value = chatId
    } else {
      // Snap back to closed
      closeSwipe(chatId)
    }
  }

  touchStartX.value = 0
  touchCurrentX.value = 0

  // Reset swiping flag after a short delay to prevent click
  setTimeout(() => {
    isSwiping.value = false
  }, 50)
}

// Mouse events for desktop
const onMouseDown = (event, chatId) => {
  // Right click to toggle swipe on desktop
  if (event.button === 2) {
    event.preventDefault()
    if (swipedChatId.value === chatId) {
      closeSwipe(chatId)
    } else {
      if (swipedChatId.value) {
        closeSwipe(swipedChatId.value)
      }
      swipeOffset.value[chatId] = -160
      swipedChatId.value = chatId
    }
  }
}

const getCurrentSwipingChatId = (event) => {
  // Find the chat-item-wrapper parent to get the chat id
  let target = event.target
  while (target && !target.classList?.contains('chat-item-wrapper')) {
    target = target.parentElement
  }
  if (target) {
    // Get the chat id from the v-for key (stored in dataset or find by index)
    const wrapper = target
    const index = Array.from(wrapper.parentElement.children).indexOf(wrapper)
    if (index >= 0 && filteredChats.value[index]) {
      return filteredChats.value[index].id
    }
  }
  return null
}

const closeSwipe = (chatId) => {
  swipeOffset.value[chatId] = 0
  if (swipedChatId.value === chatId) {
    swipedChatId.value = null
  }
}

const handleChatClick = (chat) => {
  // If swiping, don't select chat
  if (isSwiping.value) return

  // If this chat is swiped open, close it instead of selecting
  if (swipedChatId.value === chat.id) {
    closeSwipe(chat.id)
    return
  }

  // Close any open swipe
  if (swipedChatId.value) {
    closeSwipe(swipedChatId.value)
  }

  chatStore.toggleActiveChat(chat)
}

const handleTogglePin = (chat) => {
  const isPinned = chatStore.togglePinChat(chat.id)
  ElMessage.success(isPinned ? t('chat.pinSuccess') : t('chat.unpinSuccess'))
  closeSwipe(chat.id)
}

const handleDelete = async (chat) => {
  closeSwipe(chat.id)

  try {
    await ElMessageBox.confirm(
      t('chat.confirmDeleteChat', { name: chat.name }),
      t('chat.deleteChat'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    // User confirmed, delete the chat
    const userId = userStore.currentUser?.id
    if (!userId) {
      ElMessage.error(t('common.notLoggedIn'))
      return
    }

    await chatStore.deleteChat(chat.id, userId)

    // Clear messages from message store
    messageStore.clearMessages(chat.id)

    ElMessage.success(t('chat.deleteChatSuccess'))
  } catch (error) {
    // User cancelled or error occurred
    if (error !== 'cancel') {
      console.error('Failed to delete chat:', error)
      ElMessage.error(t('chat.deleteChatFailed'))
    }
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm')
}

// Close swipe when clicking outside
const handleClickOutside = () => {
  if (swipedChatId.value) {
    closeSwipe(swipedChatId.value)
  }
}

// Prevent context menu on right click
const handleContextMenu = (event) => {
  event.preventDefault()
}
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-item-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  margin: 0 4px;
}

.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  z-index: 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn:active {
  opacity: 0.8;
}

.action-btn .material-icons-round {
  font-size: 22px;
}

.pin-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.chat-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: transform 0.2s ease-out, background 0.3s ease;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  background: white;
  z-index: 1;
}

.chat-item:hover {
  background: #f1f5f9;
}

.chat-item.swiped {
  transition: none;
}

.chat-item:active:not(.swiped) {
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

.pin-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #3b82f6;
  font-size: 14px;
  opacity: 0.7;
}

.pin-indicator .material-icons-round {
  font-size: 16px;
  transform: rotate(45deg);
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
[data-theme="dark"] .chat-item {
  background: #1e1e1e;
}

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

[data-theme="dark"] .pin-indicator {
  color: #60a5fa;
}

[data-theme="dark"] .pin-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

[data-theme="dark"] .delete-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}
</style>
