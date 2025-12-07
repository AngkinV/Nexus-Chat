<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('contact.addContact')"
    width="400px"
    class="custom-dialog"
    :before-close="handleClose"
  >
    <div class="add-contact-form">
      <el-input
        v-model="searchQuery"
        :placeholder="$t('contact.searchPlaceholder')"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">{{ $t('common.search') }}</el-button>
        </template>
      </el-input>

      <div v-if="searchResult" class="search-result">
        <div class="user-info">
          <el-avatar :size="40" :src="searchResult.avatar || defaultAvatar" />
          <div class="user-details">
            <span class="nickname">{{ searchResult.nickname }}</span>
            <span class="username">@{{ searchResult.username }}</span>
          </div>
        </div>
        <el-button type="primary" size="small" @click="addContact">
          {{ $t('contact.add') }}
        </el-button>
      </div>

      <div v-if="hasSearched && !searchResult" class="no-result">
        <el-empty :description="$t('contact.notFound')" :image-size="60" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'added'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const searchQuery = ref('')
const searchResult = ref(null)
const hasSearched = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  searchQuery.value = ''
  searchResult.value = null
  hasSearched.value = false
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  hasSearched.value = true
  // Mock search logic
  // In real app, this would call an API
  if (searchQuery.value.toLowerCase() === 'test' || searchQuery.value === '123') {
    searchResult.value = {
      id: 999,
      nickname: 'Test User',
      username: 'testuser',
      avatar: ''
    }
  } else {
    searchResult.value = null
  }
}

const addContact = () => {
  if (!searchResult.value) return
  
  // Mock add contact logic
  emit('added', searchResult.value)
  ElMessage.success('Contact added successfully')
  handleClose()
}
</script>

<style scoped>
.add-contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: 600;
  font-size: 14px;
  color: #1c1c1e;
}

.username {
  font-size: 12px;
  color: #707579;
}

.no-result {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
