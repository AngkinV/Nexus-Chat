import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatAPI } from '@/services/api'

export const useChatStore = defineStore('chat', () => {
    const activeChat = ref(null)
    const chats = ref([])
    const isLoading = ref(false)

    const messages = ref([])

    // Computed: Get all group chats
    const groupChats = computed(() => {
        return chats.value.filter(chat => chat.type === 'GROUP')
    })

    // Computed: Get all direct chats
    const directChats = computed(() => {
        return chats.value.filter(chat => chat.type === 'DIRECT')
    })

    // Computed: Total unread count
    const totalUnreadCount = computed(() => {
        return chats.value.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
    })

    // Fetch chats from backend
    const fetchChats = async (userId) => {
        isLoading.value = true
        try {
            const response = await chatAPI.getUserChats(userId)
            const chatList = response.data || []

            // Transform backend data to frontend format
            chats.value = chatList.map(chat => ({
                id: chat.id,
                name: chat.name,
                avatar: chat.members?.find(m => m.id !== userId)?.avatarUrl || '',
                lastMessage: chat.lastMessage?.content || '',
                lastMessageTime: chat.lastMessage?.createdAt || chat.lastMessageAt,
                unreadCount: chat.unreadCount || 0,
                online: chat.members?.find(m => m.id !== userId)?.isOnline || false,
                type: chat.type === 'direct' ? 'DIRECT' : 'GROUP',
                members: chat.members,
                memberCount: chat.members?.length || 0,
                contactId: chat.type === 'direct' ? chat.members?.find(m => m.id !== userId)?.id : null
            }))
        } catch (error) {
            console.error('Failed to fetch chats:', error)
        } finally {
            isLoading.value = false
        }
    }

    const setActiveChat = (chat) => {
        activeChat.value = chat
        // Mark as read when opening chat
        if (chat) {
            const chatIndex = chats.value.findIndex(c => c.id === chat.id)
            if (chatIndex !== -1) {
                chats.value[chatIndex].unreadCount = 0
            }
        }
    }

    // Toggle chat: if same chat is clicked, close it; otherwise open the new chat
    const toggleActiveChat = (chat) => {
        if (activeChat.value?.id === chat.id) {
            // Same chat clicked, close it
            activeChat.value = null
        } else {
            // Different chat or no chat open, set as active and clear unread
            setActiveChat(chat)
        }
    }

    const sendMessage = (messageData) => {
        const newMessage = {
            id: Date.now(),
            chatId: messageData.chatId,
            senderName: 'Me',
            content: messageData.content,
            timestamp: new Date(),
            type: messageData.type,
            isSelf: true,
            read: false
        }
        messages.value.push(newMessage)

        // Update last message in chat list
        const chatIndex = chats.value.findIndex(c => c.id === messageData.chatId)
        if (chatIndex !== -1) {
            chats.value[chatIndex].lastMessage = messageData.type === 'TEXT' ? messageData.content : '[Image]'
            chats.value[chatIndex].lastMessageTime = new Date()
            // Move to top
            const chat = chats.value.splice(chatIndex, 1)[0]
            chats.value.unshift(chat)
        }
    }

    const createGroup = async (groupData) => {
        try {
            // In real app, call API
            // const response = await chatAPI.createGroupChat(userId, groupData.name, groupData.memberIds)

            const newGroup = {
                id: Date.now(),
                name: groupData.name,
                description: groupData.description || '',
                avatar: groupData.avatar || '',
                lastMessage: 'Group created',
                lastMessageTime: new Date(),
                unreadCount: 0,
                online: true,
                type: 'GROUP',
                isPrivate: groupData.isPrivate || false,
                members: groupData.members || [],
                memberCount: (groupData.members?.length || 0) + 1
            }

            chats.value.unshift(newGroup)
            return newGroup
        } catch (error) {
            console.error('Failed to create group:', error)
            throw error
        }
    }

    const createDirectChat = async (contact) => {
        // Check if chat already exists
        const existingChat = chats.value.find(
            c => c.type === 'DIRECT' && c.contactId === contact.id
        )

        if (existingChat) {
            setActiveChat(existingChat)
            return existingChat
        }

        try {
            const newChat = {
                id: Date.now(),
                contactId: contact.id,
                name: contact.nickname,
                avatar: contact.avatar || '',
                lastMessage: '',
                lastMessageTime: new Date(),
                unreadCount: 0,
                online: contact.isOnline || false,
                type: 'DIRECT'
            }

            chats.value.unshift(newChat)
            setActiveChat(newChat)
            return newChat
        } catch (error) {
            console.error('Failed to create direct chat:', error)
            throw error
        }
    }

    const updateGroupInfo = (groupId, updates) => {
        const chatIndex = chats.value.findIndex(c => c.id === groupId)
        if (chatIndex !== -1) {
            chats.value[chatIndex] = {
                ...chats.value[chatIndex],
                ...updates
            }
            // Update activeChat if it's the same
            if (activeChat.value?.id === groupId) {
                activeChat.value = chats.value[chatIndex]
            }
        }
    }

    const leaveGroup = (groupId) => {
        const chatIndex = chats.value.findIndex(c => c.id === groupId)
        if (chatIndex !== -1) {
            chats.value.splice(chatIndex, 1)
            if (activeChat.value?.id === groupId) {
                activeChat.value = null
            }
        }
    }

    const deleteChat = (chatId) => {
        const chatIndex = chats.value.findIndex(c => c.id === chatId)
        if (chatIndex !== -1) {
            chats.value.splice(chatIndex, 1)
            if (activeChat.value?.id === chatId) {
                activeChat.value = null
            }
        }
    }

    const getMessagesForChat = (chatId) => {
        return messages.value.filter(m => m.chatId === chatId)
    }

    return {
        activeChat,
        chats,
        messages,
        isLoading,
        groupChats,
        directChats,
        totalUnreadCount,
        fetchChats,
        setActiveChat,
        toggleActiveChat,
        sendMessage,
        createGroup,
        createDirectChat,
        updateGroupInfo,
        leaveGroup,
        deleteChat,
        getMessagesForChat
    }
})
