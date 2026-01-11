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

    // Replace temporary message with real message from server
    function replaceTemporaryMessage(chatId, senderId, realMessage) {
        if (!messages.value[chatId]) return false

        // Find the latest temporary message from this sender with matching content
        const tempIndex = messages.value[chatId].findIndex(m =>
            String(m.id).startsWith('temp-') &&
            m.senderId === senderId &&
            m.content === realMessage.content
        )

        if (tempIndex !== -1) {
            // Replace temporary message with real one
            messages.value[chatId][tempIndex] = realMessage
            return true
        }
        return false
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

    // Mark the last temporary message as failed (for send error handling)
    function markLastMessageFailed(chatId) {
        if (!messages.value[chatId]) return

        // Find the last temporary message (id starts with 'temp-')
        for (let i = messages.value[chatId].length - 1; i >= 0; i--) {
            const msg = messages.value[chatId][i]
            if (String(msg.id).startsWith('temp-')) {
                msg.failed = true
                break
            }
        }
    }

    // Clear all messages for a chat (used when deleting chat)
    function clearMessages(chatId) {
        delete messages.value[chatId]
    }

    return {
        messages,
        getMessages,
        setMessages,
        addMessage,
        replaceTemporaryMessage,
        prependMessages,
        markMessageAsRead,
        markLastMessageFailed,
        clearMessages,
        addTypingUser,
        removeTypingUser,
        getTypingUsers
    }
})
