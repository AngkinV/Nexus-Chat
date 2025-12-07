<template>
  <div class="profile-page">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="header-background"></div>
      <div class="header-content">
        <el-button class="back-btn" circle @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-actions">
          <el-button class="edit-btn" circle @click="showEditProfile = true">
            <el-icon><EditPen /></el-icon>
          </el-button>
          <el-dropdown trigger="click">
            <el-button circle>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><Share /></el-icon>
                  {{ $t('profile.shareProfile') }}
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Link /></el-icon>
                  {{ $t('profile.copyLink') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="avatar-container">
        <el-avatar :size="120" :src="userStore.currentUser?.avatar || defaultAvatar" />
        <div class="online-status" :class="{ online: isOnline }"></div>
      </div>
    </div>

    <!-- Profile Info -->
    <div class="profile-info">
      <h1 class="profile-name">{{ userStore.currentUser?.nickname || 'User' }}</h1>
      <p class="profile-username">@{{ userStore.currentUser?.username }}</p>
      <p v-if="userStore.currentUser?.bio" class="profile-bio">{{ userStore.currentUser.bio }}</p>
      <p class="profile-status">{{ isOnline ? $t('chat.online') : $t('chat.offline') }}</p>
    </div>

    <!-- Info Cards -->
    <div class="info-section">
      <div class="info-card">
        <div class="info-item" v-if="userStore.currentUser?.phone">
          <el-icon class="info-icon" style="color: #3390ec"><Phone /></el-icon>
          <div class="info-content">
            <span class="info-label">{{ $t('auth.phone') }}</span>
            <span class="info-value">{{ userStore.currentUser.phone }}</span>
          </div>
        </div>

        <div class="info-item" v-if="userStore.currentUser?.email && userStore.currentUser?.showEmail">
          <el-icon class="info-icon" style="color: #8774e1"><Message /></el-icon>
          <div class="info-content">
            <span class="info-label">{{ $t('auth.email') }}</span>
            <span class="info-value">{{ userStore.currentUser.email }}</span>
          </div>
        </div>

        <div class="info-item" v-if="userStore.currentUser?.username">
          <el-icon class="info-icon" style="color: #00c853"><User /></el-icon>
          <div class="info-content">
            <span class="info-label">{{ $t('auth.username') }}</span>
            <span class="info-value">@{{ userStore.currentUser.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-value">{{ contactCount }}</span>
        <span class="stat-label">{{ $t('profile.contacts') }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ groupCount }}</span>
        <span class="stat-label">{{ $t('profile.groups') }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ messageCount }}</span>
        <span class="stat-label">{{ $t('profile.messages') }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-section">
      <div class="action-card">
        <div class="action-item" @click="router.push('/settings')">
          <div class="action-left">
            <div class="action-icon" style="background: #3390ec">
              <el-icon color="white"><Setting /></el-icon>
            </div>
            <span>{{ $t('settings.settings') }}</span>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>

        <div class="action-item" @click="showEditProfile = true">
          <div class="action-left">
            <div class="action-icon" style="background: #8774e1">
              <el-icon color="white"><EditPen /></el-icon>
            </div>
            <span>{{ $t('settings.editProfile') }}</span>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>

        <div class="action-item" @click="showPrivacySettings = true">
          <div class="action-left">
            <div class="action-icon" style="background: #00c853">
              <el-icon color="white"><Lock /></el-icon>
            </div>
            <span>{{ $t('profile.privacySettings') }}</span>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="action-card">
        <div class="action-item logout" @click="handleLogout">
          <div class="action-left">
            <div class="action-icon" style="background: #ff3b30">
              <el-icon color="white"><SwitchButton /></el-icon>
            </div>
            <span>{{ $t('auth.logout') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <EditProfileModal v-model:visible="showEditProfile" @updated="handleProfileUpdated" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useContactStore } from '@/stores/contact'
import { useChatStore } from '@/stores/chat'
import { 
  ArrowLeft, ArrowRight, EditPen, MoreFilled, Phone, Message, 
  User, Setting, Lock, SwitchButton, Share, Link 
} from '@element-plus/icons-vue'
import EditProfileModal from '@/components/common/EditProfileModal.vue'

const router = useRouter()
const userStore = useUserStore()
const contactStore = useContactStore()
const chatStore = useChatStore()

const showEditProfile = ref(false)
const showPrivacySettings = ref(false)
const isOnline = ref(true)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const contactCount = computed(() => contactStore.contacts.length)
const groupCount = computed(() => chatStore.groupChats.length)
const messageCount = computed(() => chatStore.messages.length)

const goBack = () => {
  router.back()
}

const handleProfileUpdated = (updatedUser) => {
  // Profile was updated, could add additional logic here
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.profile-header {
  position: relative;
  height: 200px;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.back-btn,
.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  backdrop-filter: blur(10px);
}

.back-btn:hover,
.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.avatar-container {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.avatar-container .el-avatar {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.online-status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9e9e9e;
  border: 3px solid white;
}

.online-status.online {
  background: #4caf50;
}

.profile-info {
  text-align: center;
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #1c1c1e;
}

.profile-username {
  font-size: 15px;
  color: #3390ec;
  margin: 5px 0 10px;
}

.profile-bio {
  font-size: 14px;
  color: #666;
  max-width: 400px;
  margin: 0 auto 10px;
  line-height: 1.5;
}

.profile-status {
  font-size: 13px;
  color: #4caf50;
}

.info-section {
  padding: 0 15px;
  margin-bottom: 10px;
}

.info-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 22px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 15px;
  color: #333;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 25px;
  background: white;
  margin: 0 15px 10px;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3390ec;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.stat-divider {
  width: 1px;
  background: #e5e5e5;
}

.actions-section {
  padding: 0 15px 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background: #f9f9f9;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-arrow {
  color: #c7c7cc;
}

.action-item.logout .action-left span {
  color: #ff3b30;
}
</style>
