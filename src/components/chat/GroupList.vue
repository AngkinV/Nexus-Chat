<template>
  <div class="group-list">
    <div v-if="filteredGroups.length === 0" class="empty-state">
      <div class="empty-icon">
        <el-icon :size="48"><User /></el-icon>
      </div>
      <p class="empty-text">{{ $t('group.noGroups') }}</p>
      <el-button type="primary" @click="$emit('create')">
        <el-icon><Plus /></el-icon>
        {{ $t('group.createGroup') }}
      </el-button>
    </div>

    <template v-else>
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="group-item"
        :class="{ active: chatStore.activeChat?.id === group.id }"
        @click="selectGroup(group)"
      >
        <div class="group-avatar">
          <el-avatar :size="50" :src="group.avatar || defaultGroupAvatar">
            <template v-if="!group.avatar">
              {{ getGroupInitials(group.name) }}
            </template>
          </el-avatar>
          <span v-if="group.isPrivate" class="private-badge">
            <el-icon :size="12"><Lock /></el-icon>
          </span>
        </div>
        
        <div class="group-content">
          <div class="group-header">
            <span class="group-name">{{ group.name }}</span>
            <span class="group-time">{{ formatTime(group.lastMessageTime) }}</span>
          </div>
          <div class="group-footer">
            <span class="group-message">{{ group.lastMessage || $t('group.noMessages') }}</span>
            <span v-if="group.unreadCount > 0" class="unread-badge">{{ group.unreadCount }}</span>
          </div>
          <div class="group-meta">
            <el-icon><User /></el-icon>
            <span>{{ group.memberCount || 0 }} {{ $t('group.members') }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { User, Plus, Lock } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import dayjs from 'dayjs'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'create'])

const chatStore = useChatStore()
const defaultGroupAvatar = ''

const filteredGroups = computed(() => {
  const groups = chatStore.groupChats
  if (!props.searchQuery) {
    return groups
  }
  const query = props.searchQuery.toLowerCase()
  return groups.filter(group => 
    group.name.toLowerCase().includes(query)
  )
})

const selectGroup = (group) => {
  chatStore.setActiveChat(group)
  emit('select', group)
}

const getGroupInitials = (name) => {
  if (!name) return 'G'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = dayjs(time)
  const now = dayjs()
  
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm')
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday'
  } else if (date.isSame(now, 'week')) {
    return date.format('ddd')
  } else {
    return date.format('MMM D')
  }
}
</script>

<style scoped>
.group-list {
  padding: 5px 0;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.group-item {
  display: flex;
  gap: 12px;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.group-item:hover {
  background: #f5f5f5;
}

.group-item.active {
  background: #e3f2fd;
}

.group-avatar {
  position: relative;
}

.group-avatar .el-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.private-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8774e1;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
}

.group-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-weight: 600;
  font-size: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.group-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-message {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.unread-badge {
  background: #3390ec;
  color: white;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #aaa;
}

.group-meta .el-icon {
  font-size: 14px;
}
</style>
