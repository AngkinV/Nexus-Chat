<template>
  <div class="profile-page">
    <!-- Header / Hero Section -->
    <div 
      class="profile-hero" 
      :class="{ 'mesh-gradient': !heroBackground }"
      :style="heroStyle"
    >
      <div class="header-nav animate-entry" style="animation-delay: 0.1s">
        <el-button class="nav-btn glass-btn" circle @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-actions">
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            style="display: none" 
            @change="handleBackgroundUpload"
          >
          <el-tooltip content="Change Background" placement="bottom">
            <el-button class="nav-btn glass-btn" circle @click="triggerFileUpload">
              <el-icon><Camera /></el-icon>
            </el-button>
          </el-tooltip>

          <el-button class="nav-btn glass-btn" circle @click="showEditProfile = true">
            <el-icon><EditPen /></el-icon>
          </el-button>
          <el-dropdown trigger="click">
            <el-button class="nav-btn glass-btn" circle>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="custom-dropdown">
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

      <div class="hero-content animate-entry" style="animation-delay: 0.2s">
        <div class="avatar-wrapper">
          <el-avatar :size="110" :src="userStore.currentUser?.avatar || defaultAvatar" class="profile-avatar" />
          <div class="status-indicator" :class="{ online: isOnline }"></div>
        </div>
        <h1 class="user-name" :class="{ 'text-shadow': !!heroBackground }">{{ userStore.currentUser?.nickname || 'User' }}</h1>
        <p class="user-handle" :class="{ 'text-shadow': !!heroBackground }">@{{ userStore.currentUser?.username }}</p>
        <p v-if="userStore.currentUser?.bio" class="user-bio" :class="{ 'text-shadow': !!heroBackground }">{{ userStore.currentUser.bio }}</p>
      </div>
    </div>

    <!-- Main Content Area (Unchanged) -->
    <div class="content-container">
      
      <!-- Stats Cards -->
      <div class="stats-grid animate-entry" style="animation-delay: 0.3s">
        <div class="stat-card glass-card">
          <span class="stat-number">{{ contactCount }}</span>
          <span class="stat-label">{{ $t('profile.contacts') }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-number">{{ groupCount }}</span>
          <span class="stat-label">{{ $t('profile.groups') }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-number">{{ messageCount }}</span>
          <span class="stat-label">{{ $t('profile.messages') }}</span>
        </div>
      </div>

      <!-- Information Section -->
      <div class="section-card info-card glass-card animate-entry" style="animation-delay: 0.4s">
        <h3 class="section-title">{{ $t('profile.about') }}</h3>
        
        <div class="info-row" v-if="userStore.currentUser?.phone && userStore.currentUser?.showPhone">
          <div class="icon-box blue-gradient">
            <el-icon><Phone /></el-icon>
          </div>
          <div class="info-details">
            <span class="info-value">{{ userStore.currentUser.phone }}</span>
            <span class="info-label">{{ $t('auth.phone') }}</span>
          </div>
        </div>

        <div class="info-row" v-if="userStore.currentUser?.email && userStore.currentUser?.showEmail">
          <div class="icon-box purple-gradient">
            <el-icon><Message /></el-icon>
          </div>
          <div class="info-details">
            <span class="info-value">{{ userStore.currentUser.email }}</span>
            <span class="info-label">{{ $t('auth.email') }}</span>
          </div>
        </div>

        <div class="info-row" v-if="userStore.currentUser?.username">
          <div class="icon-box green-gradient">
            <el-icon><User /></el-icon>
          </div>
          <div class="info-details">
            <span class="info-value">@{{ userStore.currentUser.username }}</span>
            <span class="info-label">{{ $t('auth.username') }}</span>
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
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, EditPen, MoreFilled, Phone, Message,
  User, Share, Link, Camera
} from '@element-plus/icons-vue'
import EditProfileModal from '@/components/common/EditProfileModal.vue'

const router = useRouter()
const userStore = useUserStore()
const contactStore = useContactStore()
const chatStore = useChatStore()

const showEditProfile = ref(false)
const fileInput = ref(null)
const isOnline = ref(true)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const contactCount = computed(() => contactStore.contacts.length)
const groupCount = computed(() => chatStore.groupChats.length)
const messageCount = computed(() => chatStore.messages.length)

// Hero Background Logic
const heroBackground = computed(() => userStore.currentUser?.profileBackground)

const heroStyle = computed(() => {
  const bg = heroBackground.value
  if (bg) {
    // 如果是图片URL (以http开头或data:image开头)
    if (bg.startsWith('http') || bg.startsWith('data:image')) {
      return {
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    } else {
      // 如果是渐变色
      return {
        background: bg,
      }
    }
  }
  return {}
})

const goBack = () => {
  router.back()
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleBackgroundUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('Please upload an image file')
    return
  }

  // Max size 5MB
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('Image size should be less than 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      await userStore.updateBackground(e.target.result)
      ElMessage.success('Background updated successfully')
    } catch (error) {
      ElMessage.error('Failed to update background')
    }
  }
  reader.readAsDataURL(file)
}

const handleProfileUpdated = (updatedUser) => {
  // Profile was updated
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
  /* 隐藏垂直滚动条 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.profile-page::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Animations */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-entry {
  opacity: 0; /* Initially hidden */
  animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Hero Section with Mesh Gradient */
.profile-hero {
  padding: 20px 20px 40px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  overflow: hidden;
  transition: all 0.5s ease;
}

.mesh-gradient {
  background: radial-gradient(at 0% 0%, hsla(210,100%,96%,1) 0, transparent 50%),
              radial-gradient(at 50% 0%, hsla(220,100%,96%,1) 0, transparent 50%),
              radial-gradient(at 100% 0%, hsla(230,100%,96%,1) 0, transparent 50%);
  background-color: #fff;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  color: white !important;
}

.header-nav {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #1c1c1e;
  font-size: 18px;
  width: 40px;
  height: 40px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-btn:hover {
  transform: scale(1.1);
  background: white;
  color: #3390ec;
  box-shadow: 0 8px 20px rgba(51, 144, 236, 0.15);
}

.hero-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 18px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  box-shadow: 0 12px 32px rgba(51, 144, 236, 0.2);
  transition: transform 0.4s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.profile-avatar {
  border: 4px solid white;
}

.status-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #b0b0b0;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-indicator.online {
  background: #00c853;
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.2);
}

.user-name {
  font-size: 28px;
  font-weight: 800;
  color: #1c1c1e;
  margin: 0 0 6px;
  letter-spacing: -0.8px;
  transition: color 0.3s;
}

.user-handle {
  font-size: 16px;
  color: #3390ec;
  font-weight: 600;
  margin: 0 0 16px;
  opacity: 0.9;
  transition: color 0.3s;
}

.user-bio {
  font-size: 15px;
  color: #666;
  max-width: 80%;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
  transition: color 0.3s;
}

/* Content Container */
.content-container {
  max-width: 600px;
  margin: -20px auto 0; /* Overlap with hero */
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 20;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0,0,0,0.02);
  border-radius: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card {
  padding: 18px 12px;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(51, 144, 236, 0.12);
}

.stat-number {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #3390ec;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8e8e93;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Section Cards */
.section-card {
  padding: 8px 0;
  overflow: hidden;
}

.section-title {
  padding: 18px 24px 8px;
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: #8e8e93;
}

/* Info & Actions */
.info-row,
.action-row {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  transition: background 0.2s;
}

.info-row:last-child,
.action-row:last-child {
  border-bottom: none;
}

.action-row {
  cursor: pointer;
  justify-content: space-between;
}

.action-row:hover {
  background: rgba(51, 144, 236, 0.04);
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-value {
  font-size: 16px;
  color: #1c1c1e;
  font-weight: 600;
}

.info-label {
  font-size: 13px;
  color: #8e8e93;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.action-text {
  font-size: 16px;
  color: #1c1c1e;
  font-weight: 500;
}

.arrow-icon {
  color: #c7c7cc;
  font-size: 18px;
  transition: transform 0.2s;
}

.action-row:hover .arrow-icon {
  transform: translateX(4px);
  color: #3390ec;
}

/* Icons Gradients */
.icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-right: 4px;
}

.blue-gradient { background: linear-gradient(135deg, #3390ec, #007aff); }
.purple-gradient { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.green-gradient { background: linear-gradient(135deg, #22c55e, #16a34a); }
.red-gradient { background: linear-gradient(135deg, #ef4444, #dc2626); }

.logout-row .action-text {
  color: #ef4444;
  font-weight: 600;
}
</style>
