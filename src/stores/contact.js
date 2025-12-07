import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { contactAPI, userAPI } from '@/services/api'

export const useContactStore = defineStore('contact', () => {
    const contacts = ref([])
    const onlineUsers = ref(new Set())
    const pendingRequests = ref([])
    const isLoading = ref(false)

    // Computed: Online contacts
    const onlineContacts = computed(() => {
        return contacts.value.filter(c => c.isOnline)
    })

    // Computed: Offline contacts
    const offlineContacts = computed(() => {
        return contacts.value.filter(c => !c.isOnline)
    })

    // Computed: Sorted contacts (online first, then alphabetically)
    const sortedContacts = computed(() => {
        return [...contacts.value].sort((a, b) => {
            if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1
            }
            return a.nickname.localeCompare(b.nickname)
        })
    })

    function setContacts(contactList) {
        contacts.value = contactList
    }

    function addContact(contact) {
        const exists = contacts.value.some(c => c.id === contact.id)
        if (!exists) {
            contacts.value.push({
                ...contact,
                addedAt: new Date().toISOString()
            })
        }
    }

    function removeContact(contactId) {
        contacts.value = contacts.value.filter(c => c.id !== contactId)
    }

    function updateContactStatus(userId, isOnline) {
        if (isOnline) {
            onlineUsers.value.add(userId)
        } else {
            onlineUsers.value.delete(userId)
        }

        // Update contact in list
        const contact = contacts.value.find(c => c.id === userId)
        if (contact) {
            contact.isOnline = isOnline
            if (!isOnline) {
                contact.lastSeen = new Date().toISOString()
            }
        }
    }

    function updateContactInfo(contactId, updates) {
        const contact = contacts.value.find(c => c.id === contactId)
        if (contact) {
            Object.assign(contact, updates)
        }
    }

    function isUserOnline(userId) {
        return onlineUsers.value.has(userId)
    }

    function isContact(userId) {
        return contacts.value.some(c => c.id === userId)
    }

    async function fetchContacts(userId) {
        isLoading.value = true
        try {
            const response = await contactAPI.getContacts(userId)
            contacts.value = response.data || []
        } catch (error) {
            console.error('Failed to fetch contacts:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function searchUsers(query) {
        try {
            // In real app, implement search API
            // const response = await userAPI.searchUsers(query)
            // return response.data
            return []
        } catch (error) {
            console.error('Failed to search users:', error)
            throw error
        }
    }

    async function addContactRequest(userId, contactUserId) {
        try {
            const response = await contactAPI.addContact(userId, contactUserId)
            if (response.data) {
                addContact(response.data)
            }
            return response.data
        } catch (error) {
            console.error('Failed to add contact:', error)
            throw error
        }
    }

    async function removeContactRequest(userId, contactUserId) {
        try {
            await contactAPI.removeContact(userId, contactUserId)
            removeContact(contactUserId)
        } catch (error) {
            console.error('Failed to remove contact:', error)
            throw error
        }
    }

    function getContactById(contactId) {
        return contacts.value.find(c => c.id === contactId)
    }

    return {
        contacts,
        onlineUsers,
        pendingRequests,
        isLoading,
        onlineContacts,
        offlineContacts,
        sortedContacts,
        setContacts,
        addContact,
        removeContact,
        updateContactStatus,
        updateContactInfo,
        isUserOnline,
        isContact,
        fetchContacts,
        searchUsers,
        addContactRequest,
        removeContactRequest,
        getContactById
    }
})
