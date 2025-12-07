<template>
  <div class="message-list" ref="listRef">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message-wrapper"
      :class="{ 'sent': msg.isSelf }"
    >
      <div class="message-bubble">
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

        <div class="message-meta">
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          <el-icon v-if="msg.isSelf" class="read-status" :size="14">
            <Check v-if="!msg.read" />
            <span v-else class="double-check">✓✓</span>
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const listRef = ref(null)

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
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  display: flex;
  margin-bottom: 5px;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  background: #ffffff;
}

.message-wrapper.sent .message-bubble {
  background: #e3f2fd; /* Light blue for sent */
  border-bottom-right-radius: 2px;
}

.message-wrapper:not(.sent) .message-bubble {
  background: #ffffff;
  border-bottom-left-radius: 2px;
}

.sender-name {
  font-size: 13px;
  color: #e65100; /* Distinct color for names */
  font-weight: 600;
  margin-bottom: 4px;
}

.message-text {
  font-size: 15px;
  line-height: 1.4;
  color: #1c1c1e;
  word-wrap: break-word;
}

.message-image {
  max-width: 300px;
  border-radius: 8px;
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
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  color: #aeb5bc;
}

.read-status {
  color: #3390ec;
}

.double-check {
  font-size: 10px;
  letter-spacing: -3px;
  font-weight: bold;
}
</style>
