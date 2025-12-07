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
      <!-- Avatar Section -->
      <div class="avatar-section">
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
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { Camera, Delete, User, Message, Phone, Lock } from '@element-plus/icons-vue'
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

const form = ref({
  avatar: '',
  nickname: '',
  username: '',
  bio: '',
  phone: '',
  email: '',
  showOnlineStatus: true,
  showLastSeen: true,
  showEmail: false
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
      showEmail: userStore.currentUser.showEmail ?? false
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
        showEmail: form.value.showEmail
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

<style scoped>
.edit-profile-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.edit-profile-content {
  display: flex;
  flex-direction: column;
}

.avatar-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  display: flex;
  justify-content: center;
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
</style>
