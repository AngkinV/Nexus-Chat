<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('settings.editProfile')"
    width="500px"
    class="edit-profile-dialog"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div class="edit-profile-content">
      <!-- Avatar Section with Custom Background -->
      <div
        class="avatar-section"
        :style="avatarSectionStyle"
      >
        <!-- Background Change Button -->
        <div class="background-change-btn" @click="showBackgroundOptions = true">
          <el-icon><Picture /></el-icon>
          <span>更换背景</span>
        </div>

        <div class="avatar-container">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
          >
            <div class="avatar-wrapper">
              <el-avatar :size="120" :src="form.avatar || defaultAvatar" />
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>{{ $t('profile.changePhoto') }}</span>
              </div>
            </div>
          </el-upload>
          <div v-if="form.avatar" class="remove-avatar" @click="removeAvatar">
            <el-icon><Delete /></el-icon>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        class="profile-form"
      >
        <el-form-item :label="$t('auth.nickname')" prop="nickname">
          <el-input 
            v-model="form.nickname" 
            :placeholder="$t('profile.enterNickname')"
            maxlength="30"
            show-word-limit
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('profile.bio')" prop="bio">
          <el-input 
            v-model="form.bio" 
            type="textarea"
            :placeholder="$t('profile.enterBio')"
            :rows="3"
            maxlength="150"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('auth.username')" prop="username">
          <el-input 
            v-model="form.username" 
            :placeholder="$t('profile.enterUsername')"
            disabled
          >
            <template #prefix>
              <span class="at-symbol">@</span>
            </template>
          </el-input>
          <div class="field-hint">{{ $t('profile.usernameHint') }}</div>
        </el-form-item>

        <el-form-item :label="$t('auth.email')" prop="email">
          <el-input 
            v-model="form.email" 
            :placeholder="$t('profile.enterEmail')"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('auth.phone')" prop="phone">
          <el-input 
            v-model="form.phone" 
            :placeholder="$t('profile.enterPhone')"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- Privacy Settings in Profile -->
      <div class="privacy-section">
        <div class="section-header">
          <el-icon><Lock /></el-icon>
          <span>{{ $t('profile.privacySettings') }}</span>
        </div>
        <div class="privacy-options">
          <div class="privacy-item">
            <div class="privacy-left">
              <span class="privacy-label">{{ $t('profile.showOnlineStatus') }}</span>
              <span class="privacy-desc">{{ $t('profile.showOnlineStatusDesc') }}</span>
            </div>
            <el-switch v-model="form.showOnlineStatus" />
          </div>
          <div class="privacy-item">
            <div class="privacy-left">
              <span class="privacy-label">{{ $t('profile.showLastSeen') }}</span>
              <span class="privacy-desc">{{ $t('profile.showLastSeenDesc') }}</span>
            </div>
            <el-switch v-model="form.showLastSeen" />
          </div>
          <div class="privacy-item">
            <div class="privacy-left">
              <span class="privacy-label">{{ $t('profile.showPhone') }}</span>
              <span class="privacy-desc">{{ $t('profile.showPhoneDesc') }}</span>
            </div>
            <el-switch v-model="form.showPhone" />
          </div>
          <div class="privacy-item">
            <div class="privacy-left">
              <span class="privacy-label">{{ $t('profile.showEmail') }}</span>
              <span class="privacy-desc">{{ $t('profile.showEmailDesc') }}</span>
            </div>
            <el-switch v-model="form.showEmail" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveProfile" :loading="isSaving">
          {{ $t('common.save') }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Background Options Dialog -->
  <el-dialog
    v-model="showBackgroundOptions"
    title="选择背景"
    width="90%"
    :style="{ maxWidth: '500px' }"
    append-to-body
  >
    <div class="background-options">
      <!-- Upload Custom Background -->
      <div class="option-section">
        <h4>上传自定义背景</h4>
        <input
          type="file"
          ref="bgFileInput"
          accept="image/*"
          style="display: none"
          @change="handleBackgroundImageUpload"
        >
        <el-button @click="$refs.bgFileInput.click()" class="upload-btn">
          <el-icon><Upload /></el-icon>
          选择图片
        </el-button>
      </div>

      <!-- Preset Gradients -->
      <div class="option-section">
        <h4>预设渐变背景</h4>
        <div class="gradient-grid">
          <div
            v-for="(gradient, index) in presetGradients"
            :key="index"
            class="gradient-item"
            :style="{ background: gradient.style }"
            @click="selectGradient(gradient.style)"
          >
            <div v-if="form.profileBackground === gradient.style" class="selected-check">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="showBackgroundOptions = false">取消</el-button>
      <el-button type="primary" @click="showBackgroundOptions = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { Camera, Delete, User, Message, Phone, Lock, Picture, Upload, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'updated'])
const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref(null)
const isSaving = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const showBackgroundOptions = ref(false)
const bgFileInput = ref(null)

// 预设渐变背景
const presetGradients = [
  { style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, // 原紫色
  { style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }, // 粉红
  { style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }, // 蓝色
  { style: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }, // 绿色
  { style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }, // 橙粉
  { style: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }, // 青紫
  { style: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }, // 淡蓝粉
  { style: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }, // 浅粉
  { style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }, // 橙色
  { style: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)' }, // 红蓝
  { style: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }, // 紫蓝
  { style: 'linear-gradient(135deg, #f8b500 0%, #fceabb 100%)' }, // 金黄
]

const form = ref({
  avatar: '',
  nickname: '',
  username: '',
  bio: '',
  phone: '',
  email: '',
  showOnlineStatus: true,
  showLastSeen: true,
  showPhone: false,
  showEmail: false,
  profileBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // 默认背景
})

const rules = reactive({
  nickname: [
    { required: true, message: t('profile.nicknameRequired'), trigger: 'blur' },
    { min: 2, max: 30, message: t('profile.nicknameLength'), trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: t('auth.invalidEmail'), trigger: 'blur' }
  ]
})

// 计算头像区域背景样式
const avatarSectionStyle = computed(() => {
  const bg = form.value.profileBackground
  if (bg && (bg.startsWith('http') || bg.startsWith('data:image'))) {
    // 如果是图片URL或base64图片
    return {
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  } else if (bg) {
    // 如果是渐变
    return {
      background: bg
    }
  }
  return {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
})

watch(() => props.visible, (val) => {
  if (val && userStore.currentUser) {
    form.value = {
      avatar: userStore.currentUser.avatar || '',
      nickname: userStore.currentUser.nickname || '',
      username: userStore.currentUser.username || '',
      bio: userStore.currentUser.bio || '',
      phone: userStore.currentUser.phone || '',
      email: userStore.currentUser.email || '',
      showOnlineStatus: userStore.currentUser.showOnlineStatus ?? true,
      showLastSeen: userStore.currentUser.showLastSeen ?? true,
      showPhone: userStore.currentUser.showPhone ?? false,
      showEmail: userStore.currentUser.showEmail ?? false,
      profileBackground: userStore.currentUser.profileBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleAvatarChange = (file) => {
  if (file.raw.size > 2 * 1024 * 1024) {
    ElMessage.warning(t('auth.imageSizeWarning'))
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const removeAvatar = () => {
  form.value.avatar = ''
}

// 选择预设渐变
const selectGradient = (gradientStyle) => {
  form.value.profileBackground = gradientStyle
}

// 处理背景图片上传
const handleBackgroundImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  // 最大5MB
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.profileBackground = e.target.result
    showBackgroundOptions.value = false
    ElMessage.success('背景已更新')
  }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    isSaving.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update user store
      userStore.currentUser = {
        ...userStore.currentUser,
        avatar: form.value.avatar,
        nickname: form.value.nickname,
        bio: form.value.bio,
        phone: form.value.phone,
        email: form.value.email,
        showOnlineStatus: form.value.showOnlineStatus,
        showLastSeen: form.value.showLastSeen,
        showPhone: form.value.showPhone,
        showEmail: form.value.showEmail,
        profileBackground: form.value.profileBackground
      }

      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(userStore.currentUser))
      
      emit('updated', userStore.currentUser)
      ElMessage.success(t('profile.updateSuccess'))
      handleClose()
    } catch (error) {
      ElMessage.error(t('profile.updateFailed'))
    } finally {
      isSaving.value = false
    }
  })
}
</script>

<style>
/* 全局样式 - 确保对话框本身固定 */
.edit-profile-dialog {
  /* 对话框固定不动 */
}

.edit-profile-dialog .el-dialog {
  margin: 0 !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.edit-profile-dialog .el-dialog__body {
  padding: 0 !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
  /* 隐藏滚动条 */
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.edit-profile-dialog .el-dialog__body::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
</style>

<style scoped>
/* 对话框主体样式 - 只有内容滚动 */

.edit-profile-content {
  display: flex;
  flex-direction: column;
}

.avatar-section {
  padding: 30px;
  display: flex;
  justify-content: center;
  position: relative;
  min-height: 200px;
  transition: background 0.3s ease;
}

.background-change-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 10;
}

.background-change-btn:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.background-change-btn .el-icon {
  font-size: 16px;
}

.avatar-container {
  position: relative;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  gap: 5px;
}

.avatar-overlay .el-icon {
  font-size: 28px;
}

.avatar-overlay span {
  font-size: 12px;
}

.remove-avatar {
  position: absolute;
  top: 0;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
  transition: transform 0.2s;
}

.remove-avatar:hover {
  transform: scale(1.1);
}

.profile-form {
  padding: 24px;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.profile-form :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.at-symbol {
  color: #999;
  font-weight: 500;
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.privacy-section {
  padding: 0 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
  padding-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin-bottom: 15px;
}

.section-header .el-icon {
  color: #8774e1;
}

.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.privacy-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.privacy-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.privacy-desc {
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 背景选择样式 */
.background-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.option-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.upload-btn {
  width: 100%;
}

.gradient-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.gradient-item {
  aspect-ratio: 1;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gradient-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selected-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #67c23a;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .gradient-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
