<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('chat.newGroup')"
    width="400px"
    class="custom-dialog"
    :before-close="handleClose"
  >
    <div class="group-form">
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
        >
          <img v-if="groupAvatar" :src="groupAvatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Camera /></el-icon>
        </el-upload>
      </div>
      
      <el-input
        v-model="groupName"
        :placeholder="$t('chat.groupName')"
        class="group-name-input"
      />

      <div class="user-selection">
        <h4>{{ $t('chat.addMembers') }}</h4>
        <el-input
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          class="member-search"
          prefix-icon="Search"
        />
        <div class="user-list">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-item"
            :class="{ selected: selectedUsers.includes(user.id) }"
            @click="toggleUser(user.id)"
          >
            <el-avatar :size="32" :src="user.avatar || defaultAvatar" />
            <span class="username">{{ user.nickname }}</span>
            <el-icon v-if="selectedUsers.includes(user.id)" class="check-icon"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="createGroup" :disabled="!groupName || selectedUsers.length === 0">
          {{ $t('common.create') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Camera, Check, Search } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'created'])

const chatStore = useChatStore()
const groupName = ref('')
const groupAvatar = ref('')
const selectedUsers = ref([])
const searchQuery = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Mock available users
const availableUsers = ref([
  { id: 101, nickname: 'Alice', avatar: '' },
  { id: 102, nickname: 'Bob', avatar: '' },
  { id: 103, nickname: 'Charlie', avatar: '' },
  { id: 104, nickname: 'David', avatar: '' },
  { id: 105, nickname: 'Eve', avatar: '' }
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return availableUsers.value
  const query = searchQuery.value.toLowerCase()
  return availableUsers.value.filter(user => 
    user.nickname.toLowerCase().includes(query)
  )
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  groupName.value = ''
  groupAvatar.value = ''
  selectedUsers.value = []
  searchQuery.value = ''
}

const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    groupAvatar.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const toggleUser = (userId) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index === -1) {
    selectedUsers.value.push(userId)
  } else {
    selectedUsers.value.splice(index, 1)
  }
}

const createGroup = () => {
  const newGroup = {
    id: Date.now(),
    name: groupName.value,
    avatar: groupAvatar.value,
    lastMessage: 'Group created',
    lastMessageTime: new Date(),
    unreadCount: 0,
    online: true,
    type: 'GROUP',
    members: selectedUsers.value
  }
  
  chatStore.chats.unshift(newGroup)
  emit('created', newGroup)
  handleClose()
}
</script>

<style scoped>
.group-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-upload {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-name-input {
  width: 100%;
}

.user-selection {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-search {
  margin-bottom: 5px;
}

.user-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f5f5;
}

.user-item.selected {
  background: #e3f2fd;
}

.username {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  color: #3390ec;
}
</style>
