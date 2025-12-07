import { defineStore } from 'pinia'
import { ref } from 'vue'

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
            type: 'GROUP'
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

    const setActiveChat = (chat) => {
        activeChat.value = chat
        // In real app, fetch messages for this chat
    }

    const sendMessage = (messageData) => {
        // Simulate sending
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

    return {
        activeChat,
        chats,
        messages,
        setActiveChat,
        sendMessage
    }
})
