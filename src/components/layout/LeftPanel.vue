<template>
  <div class="left-panel">
    <!-- Header: Search & Settings -->
    <div class="panel-header">
      <div class="menu-btn" @click="goToSettings" title="设置">
        <el-icon :size="24" color="#707579"><Setting /></el-icon>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('chat.search')"
          class="custom-search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Chat List -->
    <div class="chat-list-container">
      <ChatList :search-query="searchQuery" />
    </div>

    <!-- Bottom: New Chat & Profile -->
    <div class="panel-footer">
      <div class="user-profile">
        <el-avatar :size="40" :src="userStore.currentUser?.avatar || defaultAvatar" />
        <div class="user-info">
          <span class="username">{{ userStore.currentUser?.nickname || 'User' }}</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button circle class="icon-btn" @click="openAddContact" title="Add Contact">
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-button circle type="primary" class="new-chat-btn" @click="openNewChat" title="New Group">
          <el-icon><EditPen /></el-icon>
        </el-button>
      </div>
    </div>

    <CreateGroupModal
      v-model:visible="showCreateGroup"
      @created="handleGroupCreated"
    />
    
    <AddContactModal
      v-model:visible="showAddContact"
      @added="handleContactAdded"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Setting, EditPen, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import ChatList from '@/components/chat/ChatList.vue'
import CreateGroupModal from '@/components/chat/CreateGroupModal.vue'
import AddContactModal from '@/components/contact/AddContactModal.vue'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const searchQuery = ref('')
const showCreateGroup = ref(false)
const showAddContact = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const goToSettings = () => {
  router.push('/settings')
}

const openNewChat = () => {
  showCreateGroup.value = true
}

const openAddContact = () => {
  showAddContact.value = true
}

const handleGroupCreated = (group) => {
  chatStore.setActiveChat(group)
}

const handleContactAdded = (contact) => {
  // Logic to handle added contact, e.g., open chat with them
  console.log('Contact added:', contact)
}
</script>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.panel-header {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-btn {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: #f1f1f1;
}

.search-bar {
  flex: 1;
}

.custom-search :deep(.el-input__wrapper) {
  background-color: #f1f1f1;
  box-shadow: none;
  border-radius: 20px;
}

.custom-search :deep(.el-input__wrapper.is-focus) {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px #3390ec inset;
}

.chat-list-container {
  flex: 1;
  overflow-y: auto;
}

.panel-footer {
  padding: 10px 15px;
  border-top: 1px solid #f1f1f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #1c1c1e;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  font-size: 18px;
  border: none;
  background: #f5f5f5;
  color: #707579;
}

.icon-btn:hover {
  background: #e4e4e4;
  color: #3390ec;
}

.new-chat-btn {
  width: 50px;
  height: 50px;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(51, 144, 236, 0.4);
}
</style>
