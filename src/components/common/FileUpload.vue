<template>
  <div class="file-upload-container">
    <input
      type="file"
      ref="fileInput"
      class="hidden-input"
      @change="handleFileSelect"
    />
    
    <el-dialog
      v-model="uploading"
      title="Uploading File"
      width="300px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="upload-progress">
        <div class="file-info">
          <span class="filename">{{ currentFile?.name }}</span>
          <span class="percentage">{{ progress }}%</span>
        </div>
        <el-progress :percentage="progress" :status="status" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['complete', 'error'])

const fileInput = ref(null)
const uploading = ref(false)
const progress = ref(0)
const currentFile = ref(null)
const status = ref('')

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

const trigger = () => {
  fileInput.value.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  currentFile.value = file
  uploading.value = true
  progress.value = 0
  status.value = ''

  try {
    await uploadFileInChunks(file)
    status.value = 'success'
    setTimeout(() => {
      uploading.value = false
      emit('complete', {
        name: file.name,
        size: file.size,
        type: file.type,
        url: 'mock_url_for_' + file.name // In real app, get from backend
      })
    }, 1000)
  } catch (error) {
    status.value = 'exception'
    ElMessage.error('Upload failed')
    emit('error', error)
    setTimeout(() => {
      uploading.value = false
    }, 2000)
  } finally {
    fileInput.value.value = '' // Reset input
  }
}

const uploadFileInChunks = async (file) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const fileId = Date.now().toString() // Unique ID for this upload session

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(file.size, start + CHUNK_SIZE)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('chunkIndex', i)
    formData.append('totalChunks', totalChunks)
    formData.append('fileId', fileId)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In real app:
    // await axios.post('/api/files/upload/chunk', formData)

    progress.value = Math.round(((i + 1) / totalChunks) * 100)
  }
}

defineExpose({
  trigger
})
</script>

<style scoped>
.hidden-input {
  display: none;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.filename {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
