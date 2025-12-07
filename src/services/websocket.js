import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useMessageStore } from '@/stores/message'
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'

class WebSocketService {
    constructor() {
        this.client = null
        this.connected = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 3000
    }

    connect(userId) {
        if (this.connected) return

        const socket = new SockJS('http://localhost:8080/ws')

        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: this.reconnectDelay,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                console.log('WebSocket connected')
                this.connected = true
                this.reconnectAttempts = 0

                // Subscribe to topics
                this.subscribeToTopics(userId)

                // Send online status
                this.updateUserStatus(userId, true)
            },

            onStompError: (frame) => {
                console.error('STOMP error:', frame)
                this.connected = false
            },

            onWebSocketClose: () => {
                console.log('WebSocket closed')
                this.connected = false
                this.attemptReconnect(userId)
            }
        })

        this.client.activate()
    }

    subscribeToTopics(userId) {
        // Subscribe to user-specific messages
        this.client.subscribe(`/user/queue/messages`, this.handleMessage.bind(this))

        // Subscribe to user status updates
        this.client.subscribe('/topic/users', this.handleUserStatus.bind(this))
    }

    subscribeToChatRoom(chatId) {
        if (!this.connected) return

        this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
            const data = JSON.parse(message.body)
            this.handleChatMessage(data)
        })
    }

    handleMessage(message) {
        const data = JSON.parse(message.body)
        console.log('Received message:', data)
    }

    handleChatMessage(data) {
        const messageStore = useMessageStore()
        const chatStore = useChatStore()

        if (data.type === 'CHAT_MESSAGE') {
            const msg = data.payload
            messageStore.addMessage(msg.chatId, msg)

            // Update last message in chat list
            chatStore.updateChat(msg.chatId, {
                lastMessage: msg,
                lastMessageAt: msg.createdAt
            })

            // Increment unread count if not current chat
            if (chatStore.selectedChatId !== msg.chatId) {
                chatStore.incrementUnreadCount(msg.chatId)

                // Show notification
                if (window.electronAPI) {
                    window.electronAPI.showNotification(
                        msg.senderNickname,
                        msg.content
                    )
                }
            }
        } else if (data.type === 'TYPING') {
            const { userId, isTyping } = data.payload
            if (isTyping) {
                messageStore.addTypingUser(data.chatId, userId)
            } else {
                messageStore.removeTypingUser(data.chatId, userId)
            }
        }
    }

    handleUserStatus(message) {
        const data = JSON.parse(message.body)
        const contactStore = useContactStore()

        if (data.type === 'USER_ONLINE') {
            contactStore.updateContactStatus(data.payload.userId, true)
        } else if (data.type === 'USER_OFFLINE') {
            contactStore.updateContactStatus(data.payload.userId, false)
        }
    }

    sendMessage(chatId, senderId, content, messageType = 'text', fileUrl = null) {
        if (!this.connected) {
            console.error('WebSocket not connected')
            return
        }

        this.client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify({
                chatId,
                senderId,
                content,
                messageType,
                fileUrl
            })
        })
    }

    sendTypingIndicator(chatId, userId, isTyping) {
        if (!this.connected) return

        this.client.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({
                chatId,
                userId,
                isTyping
            })
        })
    }

    updateUserStatus(userId, isOnline) {
        if (!this.connected) return

        this.client.publish({
            destination: '/app/user.status',
            body: JSON.stringify({
                userId,
                isOnline
            })
        })
    }

    attemptReconnect(userId) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached')
            return
        }

        this.reconnectAttempts++
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)

        setTimeout(() => {
            this.connect(userId)
        }, this.reconnectDelay * this.reconnectAttempts)
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate()
            this.connected = false
        }
    }
}

export default new WebSocketService()
