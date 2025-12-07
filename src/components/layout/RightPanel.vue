<template>
  <div class="right-panel" v-if="chatStore.activeChat">
    <div class="panel-header">
      <h3>{{ $t('settings.profile') }}</h3>
      <el-button text circle @click="closePanel"><el-icon><Close /></el-icon></el-button>
    </div>

    <div class="profile-content">
      <div class="profile-header">
        <el-avatar :size="80" :src="chatStore.activeChat.avatar || defaultAvatar" />
        <h2 class="profile-name">{{ chatStore.activeChat.name }}</h2>
        <span class="profile-status">{{ $t('chat.' + (chatStore.activeChat.status || 'online')) }}</span>
      </div>

      <div class="profile-actions">
        <div class="action-item">
          <el-icon><InfoFilled /></el-icon>
          <div class="action-text">
            <span class="label">Mobile</span>
            <span class="value">+1 234 567 890</span>
          </div>
        </div>
        <div class="action-item">
          <el-icon><Bell /></el-icon>
          <div class="action-text">
            <span class="label">{{ $t('settings.notifications') }}</span>
            <span class="value">{{ notificationsEnabled ? $t('common.enabled') : $t('common.disabled') }}</span>
          </div>
          <el-switch v-model="notificationsEnabled" />
        </div>
      </div>

      <div class="shared-media">
        <!-- Placeholder for shared media -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Close, InfoFilled, Bell } from '@element-plus/icons-vue'

const chatStore = useChatStore()
const toggleRightPanel = inject('toggleRightPanel')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const notificationsEnabled = ref(true)

const closePanel = () => {
  toggleRightPanel()
}
</script>

<style scoped>
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.panel-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
}

.profile-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.profile-name {
  margin-top: 15px;
  font-size: 20px;
  font-weight: 600;
  color: #1c1c1e;
}

.profile-status {
  margin-top: 5px;
  color: #707579;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s;
  cursor: pointer;
}

.action-item:hover {
  background: #f5f5f5;
}

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #1c1c1e;
}

.value {
  font-size: 13px;
  color: #707579;
}
</style>
