import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('message', () => {
    const messages = ref({}) // chatId -> messages array
    const typingUsers = ref({}) // chatId -> userId array

    function getMessages(chatId) {
        return messages.value[chatId] || []
    }

    function setMessages(chatId, messageList) {
        messages.value[chatId] = messageList
    }

    function addMessage(chatId, message) {
        if (!messages.value[chatId]) {
            messages.value[chatId] = []
        }

        // Check if message already exists (prevent duplicates)
        const exists = messages.value[chatId].some(m => m.id === message.id)
        if (!exists) {
            messages.value[chatId].push(message)
        }
    }

    function prependMessages(chatId, messageList) {
        if (!messages.value[chatId]) {
            messages.value[chatId] = []
        }
        messages.value[chatId] = [...messageList, ...messages.value[chatId]]
    }

    function markMessageAsRead(chatId, messageId) {
        const chatMessages = messages.value[chatId]
        if (chatMessages) {
            const message = chatMessages.find(m => m.id === messageId)
            if (message) {
                message.isRead = true
            }
        }
    }

    function addTypingUser(chatId, userId) {
        if (!typingUsers.value[chatId]) {
            typingUsers.value[chatId] = []
        }
        if (!typingUsers.value[chatId].includes(userId)) {
            typingUsers.value[chatId].push(userId)
        }
    }

    function removeTypingUser(chatId, userId) {
        if (typingUsers.value[chatId]) {
            typingUsers.value[chatId] = typingUsers.value[chatId].filter(id => id !== userId)
        }
    }

    function getTypingUsers(chatId) {
        return typingUsers.value[chatId] || []
    }

    return {
        messages,
        getMessages,
        setMessages,
        addMessage,
        prependMessages,
        markMessageAsRead,
        addTypingUser,
        removeTypingUser,
        getTypingUsers
    }
})
