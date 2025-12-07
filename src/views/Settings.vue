<template>
  <div class="settings-container">
    <div class="settings-header">
      <el-button circle @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>{{ $t('settings.settings') }}</h2>
    </div>

    <div class="settings-content">
      <div class="profile-section">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src="userStore.currentUser?.avatar || defaultAvatar" />
          <div class="edit-btn" @click="openEditProfile">
            <el-icon><EditPen /></el-icon>
          </div>
        </div>
        <h3>{{ userStore.currentUser?.nickname }}</h3>
        <p class="status">{{ $t('chat.online') }}</p>
      </div>

      <div class="settings-list">
        <!-- Language Setting -->
        <div class="setting-item">
          <div class="setting-icon" style="background: #00c853">
            <el-icon color="white"><Globe /></el-icon>
          </div>
          <span>{{ $t('settings.language') }}</span>
          <el-select 
            v-model="currentLocale" 
            @change="handleLanguageChange"
            class="language-select"
            size="small"
          >
            <el-option value="zh" label="中文" />
            <el-option value="en" label="English" />
          </el-select>
        </div>

        <!-- Notifications -->
        <div class="setting-item">
          <div class="setting-icon" style="background: #3390ec">
            <el-icon color="white"><Bell /></el-icon>
          </div>
          <span>{{ $t('settings.notifications') }}</span>
          <el-switch v-model="notifications" />
        </div>

        <!-- Privacy and Security -->
        <div class="setting-item">
          <div class="setting-icon" style="background: #8774e1">
            <el-icon color="white"><Lock /></el-icon>
          </div>
          <span>Privacy and Security</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>

        <!-- Logout -->
        <div class="setting-item logout" @click="handleLogout">
          <div class="setting-icon" style="background: #ff3b30">
            <el-icon color="white"><SwitchButton /></el-icon>
          </div>
          <span>{{ $t('auth.logout') }}</span>
        </div>
      </div>
    </div>
    
    <EditProfileModal v-model:visible="showEditProfile" />
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, ArrowRight, Bell, Lock, SwitchButton, EditPen } from '@element-plus/icons-vue'
import EditProfileModal from '@/components/common/EditProfileModal.vue'

// Globe icon for language using Vue's h() function
const Globe = {
  name: 'Globe',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '16',
      height: '16'
    }, [
      h('path', {
        d: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.93 9h-3.98c-.08-2.34-.58-4.53-1.42-6.35A8.02 8.02 0 0117.93 11zM12 4c.04 0 .08.01.12.01C13.2 6.01 13.88 8.43 13.95 11h-3.9c.07-2.57.75-4.99 1.83-6.99.04 0 .08-.01.12-.01zM4.07 11c.4-2.77 2.02-5.14 4.28-6.35C7.51 6.47 7.01 8.66 6.93 11H4.07zm-1 2h3.98c.08 2.34.58 4.53 1.42 6.35A8.02 8.02 0 014.07 13zM12 20c-.04 0-.08-.01-.12-.01-1.08-2-1.76-4.42-1.83-6.99h3.9c-.07 2.57-.75 4.99-1.83 6.99-.04 0-.08.01-.12.01zm2.35-.65c.84-1.82 1.34-4.01 1.42-6.35h3.98a8.02 8.02 0 01-5.4 6.35z'
      })
    ])
  }
}

const router = useRouter()
const { locale } = useI18n()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const notifications = ref(true)
const showEditProfile = ref(false)

// Initialize current locale from localStorage or default
const currentLocale = ref(localStorage.getItem('locale') || 'en')

const goBack = () => {
  router.back()
}

const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const openEditProfile = () => {
  showEditProfile.value = true
}
</script>

<style scoped>
.settings-container {
  height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.settings-header {
  background: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.settings-content {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
}

.profile-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #3390ec;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
}

.profile-section h3 {
  margin-top: 15px;
  font-size: 20px;
}

.status {
  color: #3390ec;
  font-size: 14px;
  margin-top: 5px;
}

.settings-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: #f9f9f9;
}

.setting-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.setting-item span {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

.arrow {
  color: #c7c7cc;
}

.logout span {
  color: #ff3b30;
}

.language-select {
  width: 100px;
}

.language-select :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border-radius: 8px;
  box-shadow: none;
}

.language-select :deep(.el-input__wrapper:hover) {
  box-shadow: none;
}

.language-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3390ec inset;
}
</style>
