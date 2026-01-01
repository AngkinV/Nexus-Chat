<template>
  <div class="input-container">
    <div class="input-wrapper">
      <button class="input-btn attach-btn" @click="triggerUpload" title="Attach file">
        <el-icon :size="24"><Plus /></el-icon>
      </button>

      <div class="input-field">
        <el-input
          v-model="content"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="Type a message..."
          resize="none"
          class="custom-textarea"
          @keydown.enter.prevent="handleEnter"
        />
      </div>

      <div class="input-actions">
        <button class="input-btn emoji-btn" title="Emoji">
          <el-icon :size="22"><Sunny /></el-icon>
        </button>
        <button v-if="!content.trim()" class="input-btn mic-btn" title="Voice message">
          <el-icon :size="22"><Microphone /></el-icon>
        </button>
        <button
          v-else
          class="send-btn"
          @click="sendMessage"
          title="Send message"
        >
          <el-icon :size="22"><Promotion /></el-icon>
        </button>
      </div>
    </div>

    <div class="input-hint">
      <span>Press <strong>Enter</strong> to send</span>
    </div>

    <FileUpload
      ref="fileUploadRef"
      @complete="handleUploadComplete"
      @error="handleUploadError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Sunny, Microphone, Promotion } from '@element-plus/icons-vue'
import FileUpload from '@/components/common/FileUpload.vue'

const emit = defineEmits(['send'])
const content = ref('')
const fileUploadRef = ref(null)

const handleEnter = (e) => {
  if (e.shiftKey) {
    // Allow new line
    return
  }
  sendMessage()
}

const sendMessage = () => {
  if (!content.value.trim()) return
  emit('send', content.value)
  content.value = ''
}

const triggerUpload = () => {
  fileUploadRef.value?.trigger()
}

const handleUploadComplete = (fileData) => {
  // Send message with file type
  // Determine type based on mime type
  let type = 'FILE'
  if (fileData.type.startsWith('image/')) {
    type = 'IMAGE'
  }

  // For now, we just emit the URL (or mock URL)
  // In a real app, we might want to send a structured object
  emit('send', fileData.url, type)
}

const handleUploadError = (error) => {
  console.error('Upload error:', error)
}
</script>

<style scoped>
.input-container {
  padding: 8px 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  background: var(--tg-surface);
  border-radius: 9999px;
  box-shadow: var(--tg-shadow-lg);
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: var(--tg-transition-slow);
}

.input-wrapper:focus-within {
  box-shadow: var(--tg-shadow-lg), 0 0 0 4px rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
}

[data-theme="dark"] .input-wrapper {
  border: 1px solid rgba(51, 65, 85, 0.5);
}

.input-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--tg-text-secondary);
  cursor: pointer;
  transition: var(--tg-transition);
  flex-shrink: 0;
}

.attach-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  color: var(--tg-secondary);
}

.emoji-btn:hover {
  background: rgba(251, 191, 36, 0.1);
  color: #F59E0B;
}

.mic-btn:hover {
  background: rgba(6, 182, 212, 0.1);
  color: var(--tg-primary);
}

.input-field {
  flex: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.custom-textarea :deep(.el-textarea__inner) {
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 10px 0;
  max-height: 150px;
  font-size: 15px;
  font-weight: 500;
  color: var(--tg-text-primary);
  line-height: 1.5;
}

.custom-textarea :deep(.el-textarea__inner)::placeholder {
  color: var(--tg-text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.send-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--tg-gradient-primary);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: var(--tg-transition);
  box-shadow: 0 4px 15px -3px rgba(6, 182, 212, 0.4);
  flex-shrink: 0;
}

.send-btn:hover {
  opacity: 0.9;
  transform: scale(1.05);
  box-shadow: 0 6px 20px -3px rgba(6, 182, 212, 0.5);
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn .el-icon {
  margin-left: 2px;
}

.input-hint {
  text-align: center;
  margin-top: 12px;
}

.input-hint span {
  font-size: 11px;
  color: var(--tg-text-tertiary);
  font-weight: 500;
}

.input-hint strong {
  color: var(--tg-text-secondary);
  font-weight: 700;
}
</style>
