<template>
  <div class="left-panel">
    <!-- Header: Search & Settings -->
    <div class="panel-header">
      <div class="menu-btn" @click="goToSettings" :title="$t('settings.settings')">
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

    <!-- Tabs -->
    <div class="tabs-container">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'chats' }"
        @click="activeTab = 'chats'"
      >
        <span>{{ $t('chat.recentChats') }}</span>
        <span v-if="chatStore.totalUnreadCount > 0" class="tab-badge">{{ chatStore.totalUnreadCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'contacts' }"
        @click="activeTab = 'contacts'"
      >
        <span>{{ $t('chat.contacts') }}</span>
        <span v-if="contactStore.contacts.length > 0" class="tab-count">{{ contactStore.contacts.length }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        <span>{{ $t('chat.groups') }}</span>
        <span v-if="chatStore.groupChats.length > 0" class="tab-count">{{ chatStore.groupChats.length }}</span>
      </div>
    </div>

    <!-- Content based on active tab -->
    <div class="list-container">
      <!-- Chats Tab -->
      <template v-if="activeTab === 'chats'">
        <ChatList :search-query="searchQuery" />
      </template>

      <!-- Contacts Tab -->
      <template v-else-if="activeTab === 'contacts'">
        <ContactList :search-query="searchQuery" @select="handleContactSelect" />
      </template>

      <!-- Groups Tab -->
      <template v-else>
        <GroupList :search-query="searchQuery" @select="handleGroupSelect" />
      </template>
    </div>

    <!-- Bottom: New Chat & Profile -->
    <div class="panel-footer">
      <div class="user-profile" @click="goToProfile">
        <el-avatar :size="40" :src="userStore.currentUser?.avatar || defaultAvatar" />
        <div class="user-info">
          <span class="username">{{ userStore.currentUser?.nickname || 'User' }}</span>
          <span class="user-status">{{ $t('chat.online') }}</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button circle class="icon-btn" @click="openAddContact" :title="$t('contact.addContact')">
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-button circle type="primary" class="new-chat-btn" @click="openNewChat" :title="$t('group.createGroup')">
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
import { useContactStore } from '@/stores/contact'
import ChatList from '@/components/chat/ChatList.vue'
import ContactList from '@/components/contact/ContactList.vue'
import GroupList from '@/components/chat/GroupList.vue'
import CreateGroupModal from '@/components/chat/CreateGroupModal.vue'
import AddContactModal from '@/components/contact/AddContactModal.vue'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const contactStore = useContactStore()

const searchQuery = ref('')
const activeTab = ref('chats')
const showCreateGroup = ref(false)
const showAddContact = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const goToSettings = () => {
  router.push('/settings')
}

const goToProfile = () => {
  router.push('/profile')
}

const openNewChat = () => {
  showCreateGroup.value = true
}

const openAddContact = () => {
  showAddContact.value = true
}

const handleGroupCreated = (group) => {
  chatStore.setActiveChat(group)
  activeTab.value = 'chats'
}

const handleContactAdded = (contact) => {
  console.log('Contact added:', contact)
}

const handleContactSelect = async (contact) => {
  // Create or open direct chat with contact
  await chatStore.createDirectChat(userStore.currentUser?.id, contact)
  activeTab.value = 'chats'
}

const handleGroupSelect = (group) => {
  chatStore.setActiveChat(group)
  activeTab.value = 'chats'
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

.tabs-container {
  display: flex;
  border-bottom: 1px solid #f1f1f1;
  padding: 0 15px;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #707579;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.tab-item:hover {
  color: #3390ec;
}

.tab-item.active {
  color: #3390ec;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #3390ec;
  border-radius: 3px 3px 0 0;
}

.tab-badge {
  background: #ff3b30;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
}

.tab-count {
  font-size: 11px;
  color: #999;
}

.list-container {
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
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #f5f5f5;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #1c1c1e;
}

.user-status {
  font-size: 12px;
  color: #3390ec;
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
