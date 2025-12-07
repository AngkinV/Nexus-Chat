<template>
  <div class="message-input-container">
    <el-button text circle class="action-btn" @click="triggerUpload">
      <el-icon :size="24" color="#707579"><Paperclip /></el-icon>
    </el-button>
    
    <div class="input-wrapper">
      <el-input
        v-model="content"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        placeholder="Write a message..."
        resize="none"
        class="custom-textarea"
        @keydown.enter.prevent="handleEnter"
      />
      <el-button text circle class="emoji-btn">
        <el-icon :size="24" color="#707579"><Sunny /></el-icon> <!-- Placeholder for Emoji -->
      </el-button>
    </div>

    <el-button 
      v-if="content.trim()" 
      circle 
      type="primary" 
      class="send-btn"
      @click="sendMessage"
    >
      <el-icon><Promotion /></el-icon>
    </el-button>
    <el-button v-else circle class="mic-btn">
      <el-icon :size="24" color="#707579"><Microphone /></el-icon>
    </el-button>

    <FileUpload
      ref="fileUploadRef"
      @complete="handleUploadComplete"
      @error="handleUploadError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Paperclip, Sunny, Microphone, Promotion } from '@element-plus/icons-vue'
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
.message-input-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 0;
}

.action-btn {
  margin-bottom: 4px;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #f1f1f1;
  border-radius: 20px;
  padding: 2px 10px;
  display: flex;
  align-items: center;
}

.custom-textarea :deep(.el-textarea__inner) {
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 10px 30px 10px 0; /* Space for emoji btn */
  max-height: 150px;
}

.emoji-btn {
  position: absolute;
  right: 5px;
  bottom: 2px;
}

.send-btn {
  margin-bottom: 4px;
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.mic-btn {
  margin-bottom: 4px;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
}

.mic-btn:hover {
  background: #f1f1f1;
}
</style>
