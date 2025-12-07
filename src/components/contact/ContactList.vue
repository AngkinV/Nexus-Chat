<template>
  <div class="contact-list">
    <div v-if="filteredContacts.length === 0" class="empty-state">
      <div class="empty-icon">
        <el-icon :size="48"><User /></el-icon>
      </div>
      <p class="empty-text">{{ $t('contact.noContacts') }}</p>
      <el-button type="primary" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        {{ $t('contact.addContact') }}
      </el-button>
    </div>

    <template v-else>
      <!-- Online Contacts -->
      <div v-if="onlineContacts.length > 0" class="contact-section">
        <div class="section-header">
          <span class="online-dot"></span>
          {{ $t('chat.online') }} ({{ onlineContacts.length }})
        </div>
        <div
          v-for="contact in onlineContacts"
          :key="contact.id"
          class="contact-item"
          @click="selectContact(contact)"
        >
          <div class="contact-avatar">
            <el-avatar :size="45" :src="contact.avatar || defaultAvatar" />
            <span class="online-indicator"></span>
          </div>
          <div class="contact-info">
            <span class="contact-name">{{ contact.nickname }}</span>
            <span class="contact-username">@{{ contact.username }}</span>
          </div>
          <div class="contact-actions">
            <el-button circle text @click.stop="startChat(contact)">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Offline Contacts -->
      <div v-if="offlineContacts.length > 0" class="contact-section">
        <div class="section-header">
          {{ $t('chat.offline') }} ({{ offlineContacts.length }})
        </div>
        <div
          v-for="contact in offlineContacts"
          :key="contact.id"
          class="contact-item offline"
          @click="selectContact(contact)"
        >
          <el-avatar :size="45" :src="contact.avatar || defaultAvatar" />
          <div class="contact-info">
            <span class="contact-name">{{ contact.nickname }}</span>
            <span class="contact-status">{{ formatLastSeen(contact.lastSeen) }}</span>
          </div>
          <div class="contact-actions">
            <el-button circle text @click.stop="startChat(contact)">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { User, Plus, ChatDotRound } from '@element-plus/icons-vue'
import { useContactStore } from '@/stores/contact'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { t } = useI18n()

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'add'])

const contactStore = useContactStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Mock contacts if empty
if (contactStore.contacts.length === 0) {
  contactStore.setContacts([
    { id: 201, nickname: 'John Doe', username: 'johnd', avatar: '', isOnline: true },
    { id: 202, nickname: 'Jane Smith', username: 'janes', avatar: '', isOnline: true },
    { id: 203, nickname: 'Mike Wilson', username: 'mikew', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 3600000).toISOString() },
    { id: 204, nickname: 'Emily Chen', username: 'emilyc', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 86400000).toISOString() }
  ])
}

const filteredContacts = computed(() => {
  if (!props.searchQuery) {
    return contactStore.contacts
  }
  const query = props.searchQuery.toLowerCase()
  return contactStore.contacts.filter(contact => 
    contact.nickname.toLowerCase().includes(query) ||
    contact.username.toLowerCase().includes(query)
  )
})

const onlineContacts = computed(() => {
  return filteredContacts.value.filter(c => c.isOnline)
})

const offlineContacts = computed(() => {
  return filteredContacts.value.filter(c => !c.isOnline)
})

const selectContact = (contact) => {
  emit('select', contact)
}

const startChat = (contact) => {
  emit('select', contact)
}

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return ''
  return `${t('chat.lastSeen')} ${dayjs(lastSeen).fromNow()}`
}
</script>

<style scoped>
.contact-list {
  padding: 10px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  gap: 15px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.contact-section {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.contact-item:hover {
  background: #f5f5f5;
}

.contact-avatar {
  position: relative;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4caf50;
  border: 2px solid white;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.contact-username {
  font-size: 13px;
  color: #3390ec;
}

.contact-status {
  font-size: 12px;
  color: #999;
}

.contact-item.offline .contact-name {
  color: #666;
}

.contact-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.contact-item:hover .contact-actions {
  opacity: 1;
}
</style>
