<template>
  <div class="settings-container">
    <div class="settings-header">
      <el-button circle @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>{{ $t('settings.settings') }}</h2>
    </div>

    <div class="settings-content">
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
        <div class="setting-item" @click="showPrivacyDialog = true">
          <div class="setting-icon" style="background: #8774e1">
            <el-icon color="white"><Lock /></el-icon>
          </div>
          <span>{{ $t('profile.privacySettings') }}</span>
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

    <!-- Privacy Settings Dialog -->
    <el-dialog
      v-model="showPrivacyDialog"
      :title="$t('profile.privacySettings')"
      width="90%"
      :style="{ maxWidth: '500px' }"
    >
      <div class="privacy-settings">
        <div class="privacy-item">
          <div class="privacy-info">
            <h4>{{ $t('profile.showOnlineStatus') }}</h4>
            <p>{{ $t('profile.showOnlineStatusDesc') }}</p>
          </div>
          <el-switch v-model="privacySettings.showOnlineStatus" />
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <h4>{{ $t('profile.showLastSeen') }}</h4>
            <p>{{ $t('profile.showLastSeenDesc') }}</p>
          </div>
          <el-switch v-model="privacySettings.showLastSeen" />
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <h4>{{ $t('profile.showPhone') }}</h4>
            <p>{{ $t('profile.showPhoneDesc') }}</p>
          </div>
          <el-switch v-model="privacySettings.showPhone" />
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <h4>{{ $t('profile.showEmail') }}</h4>
            <p>{{ $t('profile.showEmailDesc') }}</p>
          </div>
          <el-switch v-model="privacySettings.showEmail" />
        </div>
      </div>

      <template #footer>
        <el-button @click="showPrivacyDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="savePrivacySettings">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, h, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Bell, Lock, SwitchButton } from '@element-plus/icons-vue'

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
const notifications = ref(true)
const showPrivacyDialog = ref(false)

// Initialize current locale from localStorage or default
const currentLocale = ref(localStorage.getItem('locale') || 'en')

// Privacy settings
const privacySettings = reactive({
  showOnlineStatus: userStore.currentUser?.showOnlineStatus ?? true,
  showLastSeen: userStore.currentUser?.showLastSeen ?? true,
  showPhone: userStore.currentUser?.showPhone ?? false,
  showEmail: userStore.currentUser?.showEmail ?? false
})

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

const savePrivacySettings = () => {
  try {
    userStore.updatePrivacySettings(privacySettings)
    ElMessage.success('Privacy settings updated successfully')
    showPrivacyDialog.value = false
  } catch (error) {
    ElMessage.error('Failed to update privacy settings')
  }
}
</script>

<style scoped>
.settings-container {
  height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止整个容器滚动 */
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
  overflow-y: auto; /* 允许内容滚动 */
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.settings-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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

.privacy-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f5f7;
  border-radius: 8px;
}

.privacy-info {
  flex: 1;
}

.privacy-info h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1c1c1e;
}

.privacy-info p {
  margin: 0;
  font-size: 13px;
  color: #8e8e93;
}

/* 隐藏隐私设置对话框的滚动条 */
.privacy-settings {
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.privacy-settings::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
