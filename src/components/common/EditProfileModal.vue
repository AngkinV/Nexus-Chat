<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('settings.editProfile')"
    width="400px"
    class="custom-dialog"
    :before-close="handleClose"
  >
    <div class="edit-profile-form">
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Camera /></el-icon>
        </el-upload>
      </div>

      <el-form label-position="top">
        <el-form-item :label="$t('auth.nickname')">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="$t('auth.phone')">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item :label="$t('auth.email')">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveProfile">
          {{ $t('common.save') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])
const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = ref({
  avatar: '',
  nickname: '',
  phone: '',
  email: ''
})

watch(() => props.visible, (val) => {
  if (val && userStore.currentUser) {
    form.value = {
      avatar: userStore.currentUser.avatar || '',
      nickname: userStore.currentUser.nickname || '',
      phone: userStore.currentUser.phone || '',
      email: userStore.currentUser.email || ''
    }
  }
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const saveProfile = () => {
  // Mock save logic
  // In real app, this would call an API
  userStore.currentUser = {
    ...userStore.currentUser,
    ...form.value
  }
  ElMessage.success('Profile updated successfully')
  handleClose()
}
</script>

<style scoped>
.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-upload {
  align-self: center;
  width: 100px;
  height: 100px;
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
  font-size: 32px;
  color: #8c939d;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
