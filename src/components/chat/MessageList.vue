<template>
  <div class="message-list" ref="listRef">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message-wrapper"
      :class="{ 'sent': msg.isSelf }"
    >
      <!-- Avatar for received messages -->
      <div v-if="!msg.isSelf" class="message-avatar">
        <el-avatar :size="36" :src="msg.senderAvatar || defaultAvatar" />
      </div>

      <div class="message-content">
        <div class="message-bubble" :class="msg.isSelf ? 'bubble-out' : 'bubble-in'">
          <div v-if="!msg.isSelf" class="sender-name">{{ msg.senderName }}</div>

          <!-- Text Message -->
          <div v-if="msg.type === 'TEXT'" class="message-text">
            {{ msg.content }}
          </div>

          <!-- Image Message -->
          <div v-else-if="msg.type === 'IMAGE'" class="message-image">
            <el-image
              :src="msg.content"
              :preview-src-list="[msg.content]"
              fit="cover"
              class="image-content"
            />
          </div>
        </div>

        <div class="message-meta" :class="{ 'meta-sent': msg.isSelf }">
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          <!-- Failed indicator -->
          <span v-if="msg.isSelf && msg.failed" class="failed-status" :title="$t('chat.sendFailed')">
            <el-icon color="#ef4444" :size="16"><WarningFilled /></el-icon>
          </span>
          <!-- Read status -->
          <span v-else-if="msg.isSelf" class="read-status">
            <svg v-if="msg.read" class="check-icon read" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M2 12l5 5L20 4M7 12l5 5L22 4" />
            </svg>
            <svg v-else class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const listRef = ref(null)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const scrollToBottom = () => {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

onUpdated(() => {
  scrollToBottom()
})

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

const formatTime = (time) => {
  return dayjs(time).format('HH:mm')
}
</script>

<style scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  max-width: 70%;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.sent {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 20px;
}

.message-avatar .el-avatar {
  border: 2px solid var(--tg-surface);
  box-shadow: var(--tg-shadow-sm);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-wrapper.sent .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 16px 20px;
  position: relative;
  box-shadow: var(--tg-shadow-soft);
  transition: transform 0.2s ease;
}

.message-bubble:hover {
  transform: scale(1.01);
}

/* Received message bubble */
.bubble-in {
  background: var(--tg-message-in);
  border-radius: 24px 24px 24px 4px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.bubble-in .message-text {
  color: var(--tg-text-primary);
}

.bubble-in .sender-name {
  color: var(--tg-primary);
}

[data-theme="dark"] .bubble-in {
  border: 1px solid rgba(51, 65, 85, 0.5);
}

/* Sent message bubble */
.bubble-out {
  background: linear-gradient(135deg, #0891B2 0%, #059669 100%);
  border-radius: 24px 24px 4px 24px;
  box-shadow: var(--tg-shadow-float);
}

.bubble-out .message-text {
  color: #FFFFFF !important;
}

.sender-name {
  font-size: 13px;
  color: var(--tg-primary);
  font-weight: 700;
  margin-bottom: 6px;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  color: var(--tg-text-primary);
  word-wrap: break-word;
}

.message-image {
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.image-content {
  width: 100%;
  height: auto;
  display: block;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 4px;
}

.message-meta.meta-sent {
  padding-right: 4px;
  padding-left: 0;
}

.message-time {
  font-size: 11px;
  color: var(--tg-text-tertiary);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.read-status {
  display: flex;
  align-items: center;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--tg-text-tertiary);
}

.check-icon.read {
  color: var(--tg-primary);
}

.failed-status {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
