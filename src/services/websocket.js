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
        this.groupSubscriptions = new Set() // Track subscribed group topics
    }

    connect(userId, onConnectCallback = null) {
        if (this.connected) {
            // Already connected, call callback immediately
            if (onConnectCallback) onConnectCallback()
            return
        }

        this.onConnectCallback = onConnectCallback
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'
        const socket = new SockJS(wsUrl)

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
        this.client.subscribe(`/topic/user.${userId}.contacts`, this.handleContactEvent.bind(this))

        // Subscribe to chat events (new chats created)
        this.client.subscribe('/user/queue/chats', this.handleChatEvent.bind(this))
    }

    subscribeToChatRoom(chatId, isGroup = false) {
        if (!this.connected) return

        this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
            const data = JSON.parse(message.body)
            this.handleChatMessage(data)
        })

        // If it's a group chat, also subscribe to group events topic
        if (isGroup) {
            this.subscribeToGroupTopic(chatId)
        }
    }

    subscribeToGroupTopic(groupId) {
        if (!this.connected) return

        const subscriptionKey = `group_${groupId}`
        if (this.groupSubscriptions.has(subscriptionKey)) return

        this.client.subscribe(`/topic/group/${groupId}`, (message) => {
            const data = JSON.parse(message.body)
            console.log('Received group event:', data)
            // Reuse handleChatEvent to process group events
            this.handleChatEvent({ body: JSON.stringify(data) })
        })

        this.groupSubscriptions.add(subscriptionKey)
        console.log('Subscribed to group topic:', groupId)
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
                    status: 'online',
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
        } else if (data.type === 'ERROR') {
            // 消息发送失败
            const { chatId, error } = data.payload
            console.error('Message send failed:', error, 'chatId:', chatId)
            messageStore.markLastMessageFailed(chatId)
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
        const chatStore = useChatStore()

        if (data.type === 'USER_ONLINE') {
            contactStore.updateContactStatus(data.payload.userId, true)
            chatStore.updateMemberOnlineStatus(data.payload.userId, true)
        } else if (data.type === 'USER_OFFLINE') {
            contactStore.updateContactStatus(data.payload.userId, false)
            chatStore.updateMemberOnlineStatus(data.payload.userId, false)
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
        } else if (data.type === 'CONTACT_REMOVED') {
            // 被对方删除好友
            contactStore.removeContact(data.payload.contactId)
        } else if (data.type === 'CHAT_DISABLED') {
            // 聊天被禁用（联系人被删除）
            const chatStore = useChatStore()
            chatStore.handleChatDisabled(data.payload.chatId)
        }
    }

    handleChatEvent(message) {
        const data = JSON.parse(message.body)
        const chatStore = useChatStore()

        console.log('Received chat event:', data)

        if (data.type === 'CHAT_CREATED') {
            // New chat created - add to chat list and subscribe
            const chatData = data.payload
            const isGroup = chatData.type === 'group'
            const memberOnline = chatData.members?.find(m => m.id !== chatData.createdBy)?.isOnline || false

            const newChat = {
                id: chatData.id,
                contactId: isGroup ? null : chatData.members?.find(m => m.id !== chatData.createdBy)?.id,
                name: chatData.name,
                description: chatData.description || '',
                avatar: chatData.avatar || chatData.members?.[0]?.avatarUrl || '',
                isPrivate: chatData.isPrivate || false,
                lastMessage: chatData.lastMessage?.content || '',
                lastMessageTime: chatData.lastMessageAt || new Date(),
                unreadCount: 0,
                online: memberOnline,
                status: memberOnline ? 'online' : 'offline',
                type: isGroup ? 'GROUP' : 'DIRECT',
                members: chatData.members,
                memberCount: chatData.memberCount || chatData.members?.length || 1
            }

            // Add to chat list if not exists
            const exists = chatStore.chats.some(c => c.id === newChat.id)
            if (!exists) {
                chatStore.chats.unshift(newChat)
            }

            // Subscribe to this chat room
            if (!chatStore.isChatSubscribed(newChat.id)) {
                this.subscribeToChatRoom(newChat.id, isGroup)
                chatStore.markChatSubscribed(newChat.id)
                console.log('Auto-subscribed to new chat:', newChat.id, isGroup ? '(group)' : '(direct)')
            }
        } else if (data.type === 'GROUP_UPDATED') {
            // Group info updated
            const groupData = data.payload
            chatStore.updateChat(groupData.id, {
                name: groupData.name,
                description: groupData.description,
                avatar: groupData.avatar,
                isPrivate: groupData.isPrivate
            })
        } else if (data.type === 'GROUP_MEMBER_JOINED') {
            // New member joined group
            const { groupId, member, memberCount } = data.payload
            chatStore.addGroupMember(groupId, member)
            // Update memberCount from server if provided
            if (memberCount !== undefined) {
                chatStore.updateChat(groupId, { memberCount })
            }
        } else if (data.type === 'GROUP_MEMBER_LEFT') {
            // Member left group
            const { groupId, memberId, memberCount } = data.payload
            chatStore.removeGroupMember(groupId, memberId)
            // Update memberCount from server if provided
            if (memberCount !== undefined) {
                chatStore.updateChat(groupId, { memberCount })
            }
        } else if (data.type === 'GROUP_DELETED') {
            // Group deleted
            const { groupId } = data.payload
            chatStore.removeChat(groupId)
        } else if (data.type === 'GROUP_ADMIN_CHANGED') {
            // Member admin status changed
            const { groupId, memberId, isAdmin } = data.payload
            chatStore.updateGroupMemberRole(groupId, memberId, isAdmin ? 'admin' : 'member', isAdmin)
        } else if (data.type === 'GROUP_OWNERSHIP_TRANSFERRED') {
            // Group ownership transferred
            const { groupId, oldOwnerId, newOwnerId } = data.payload
            chatStore.transferGroupOwnership(groupId, oldOwnerId, newOwnerId)
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
            this.groupSubscriptions.clear()
        }
    }
}

export default new WebSocketService()
