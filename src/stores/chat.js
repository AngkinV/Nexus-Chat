import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatAPI } from '@/services/api'

export const useChatStore = defineStore('chat', () => {
    const activeChat = ref(null)
    const chats = ref([
        {
            id: 1,
            name: 'Nexus Team',
            avatar: '',
            lastMessage: 'Welcome to Nexus Chat!',
            lastMessageTime: new Date(),
            unreadCount: 2,
            online: true,
            type: 'GROUP',
            memberCount: 5,
            description: 'Official Nexus Chat team group'
        },
        {
            id: 2,
            name: 'Alice Smith',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            lastMessage: 'Hey, how are you?',
            lastMessageTime: new Date(Date.now() - 3600000),
            unreadCount: 0,
            online: false,
            type: 'DIRECT'
        }
    ])

    const messages = ref([
        {
            id: 1,
            chatId: 1,
            senderName: 'System',
            content: 'Welcome to Nexus Chat!',
            timestamp: new Date(Date.now() - 86400000),
            type: 'TEXT',
            isSelf: false,
            read: true
        },
        {
            id: 2,
            chatId: 1,
            senderName: 'Me',
            content: 'Thanks! Looks great.',
            timestamp: new Date(Date.now() - 86300000),
            type: 'TEXT',
            isSelf: true,
            read: true
        }
    ])

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
        groupChats,
        directChats,
        totalUnreadCount,
        setActiveChat,
        sendMessage,
        createGroup,
        createDirectChat,
        updateGroupInfo,
        leaveGroup,
        deleteChat,
        getMessagesForChat
    }
})
