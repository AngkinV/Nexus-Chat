import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useMessageStore } from '@/stores/message'
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { useUserStore } from '@/stores/user'

class WebSocketService {
    constructor() {
        this.client = null
        this.connected = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 3000
        this.onConnectCallback = null
    }

    connect(userId, onConnectCallback = null) {
        if (this.connected) {
            // Already connected, call callback immediately
            if (onConnectCallback) onConnectCallback()
            return
        }

        this.onConnectCallback = onConnectCallback
        const socket = new SockJS('http://localhost:8080/ws')

        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                userId: String(userId)
            },
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

                // Call the onConnect callback if provided
                if (this.onConnectCallback) {
                    this.onConnectCallback()
                }
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
        // Subscribe to user-specific messages topic (primary way to receive messages)
        this.client.subscribe(`/topic/user.${userId}.messages`, (message) => {
            const data = JSON.parse(message.body)
            console.log('Received message via personal topic:', data)
            if (data.type === 'CHAT_MESSAGE') {
                this.handleChatMessage(data)
            }
        })

        // Subscribe to user status updates
        this.client.subscribe('/topic/users', this.handleUserStatus.bind(this))

        // Subscribe to contact events (friend requests, etc.)
        this.client.subscribe('/user/queue/contacts', this.handleContactEvent.bind(this))

        // Subscribe to chat events (new chats created)
        this.client.subscribe('/user/queue/chats', this.handleChatEvent.bind(this))
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
        console.log('Received message via personal queue:', data)

        // Handle different message types
        if (data.type === 'CHAT_MESSAGE') {
            this.handleChatMessage(data)
        }
    }

    handleChatMessage(data) {
        const messageStore = useMessageStore()
        const chatStore = useChatStore()
        const userStore = useUserStore()

        if (data.type === 'CHAT_MESSAGE') {
            const payload = data.payload
            const currentUserId = userStore.currentUser?.id
            const isSelf = payload.senderId === currentUserId

            console.log('Processing chat message:', payload.chatId, 'isSelf:', isSelf)

            // Transform message to match frontend format
            const msg = {
                id: payload.id,
                chatId: payload.chatId,
                senderId: payload.senderId,
                senderName: payload.senderNickname,
                senderAvatar: payload.senderAvatar,
                content: payload.content,
                type: payload.messageType?.toUpperCase() || 'TEXT',
                fileUrl: payload.fileUrl,
                timestamp: payload.createdAt,
                createdAt: payload.createdAt,
                isRead: payload.isRead,
                isSelf: isSelf
            }

            // Check if chat exists in the list, if not, add it
            const chatExists = chatStore.chats.some(c => c.id === msg.chatId)
            if (!chatExists) {
                console.log('Chat not in list, adding:', msg.chatId)
                // Create a basic chat entry
                const newChat = {
                    id: msg.chatId,
                    name: msg.senderName || 'Unknown',
                    avatar: msg.senderAvatar || '',
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unreadCount: 1,
                    online: true,
                    type: 'DIRECT',
                    contactId: msg.senderId
                }
                chatStore.chats.unshift(newChat)

                // Subscribe to this chat room
                if (!chatStore.isChatSubscribed(msg.chatId)) {
                    this.subscribeToChatRoom(msg.chatId)
                    chatStore.markChatSubscribed(msg.chatId)
                }
            }

            // For own messages, replace the temporary message with real one
            // For others' messages, add normally
            if (isSelf) {
                const replaced = messageStore.replaceTemporaryMessage(msg.chatId, msg.senderId, msg)
                if (!replaced) {
                    // If no temp message found, add it (in case of page refresh etc)
                    messageStore.addMessage(msg.chatId, msg)
                }
            } else {
                messageStore.addMessage(msg.chatId, msg)
            }

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
                        msg.senderName,
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

    handleContactEvent(message) {
        const data = JSON.parse(message.body)
        const contactStore = useContactStore()

        console.log('Received contact event:', data)

        if (data.type === 'CONTACT_REQUEST') {
            // 收到新的好友申请
            contactStore.handleNewRequest(data.payload)
        } else if (data.type === 'CONTACT_REQUEST_ACCEPTED') {
            // 好友申请被接受
            contactStore.handleRequestAccepted(data.payload)
        } else if (data.type === 'CONTACT_REQUEST_REJECTED') {
            // 好友申请被拒绝
            contactStore.handleRequestRejected(data.payload)
        } else if (data.type === 'CONTACT_ADDED') {
            // 被直接添加为好友（对方设置为DIRECT模式）
            const contactData = data.payload
            contactStore.addContact({
                id: contactData.userId,
                username: contactData.username,
                nickname: contactData.nickname,
                avatarUrl: contactData.avatarUrl,
                avatar: contactData.avatarUrl,
                isOnline: contactData.isOnline,
                lastSeen: contactData.lastSeen
            })
        }
    }

    handleChatEvent(message) {
        const data = JSON.parse(message.body)
        const chatStore = useChatStore()

        console.log('Received chat event:', data)

        if (data.type === 'CHAT_CREATED') {
            // New chat created - add to chat list and subscribe
            const chatData = data.payload
            const newChat = {
                id: chatData.id,
                contactId: chatData.members?.find(m => m.id !== chatData.createdBy)?.id,
                name: chatData.name,
                avatar: chatData.members?.[0]?.avatarUrl || '',
                lastMessage: chatData.lastMessage?.content || '',
                lastMessageTime: chatData.lastMessageAt || new Date(),
                unreadCount: 0,
                online: chatData.members?.find(m => m.id !== chatData.createdBy)?.isOnline || false,
                type: chatData.type === 'direct' ? 'DIRECT' : 'GROUP',
                members: chatData.members
            }

            // Add to chat list if not exists
            const exists = chatStore.chats.some(c => c.id === newChat.id)
            if (!exists) {
                chatStore.chats.unshift(newChat)
            }

            // Subscribe to this chat room
            if (!chatStore.isChatSubscribed(newChat.id)) {
                this.subscribeToChatRoom(newChat.id)
                chatStore.markChatSubscribed(newChat.id)
                console.log('Auto-subscribed to new chat:', newChat.id)
            }
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
