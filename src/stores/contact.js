import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useContactStore = defineStore('contact', () => {
    const contacts = ref([])
    const onlineUsers = ref(new Set())

    function setContacts(contactList) {
        contacts.value = contactList
    }

    function addContact(contact) {
        const exists = contacts.value.some(c => c.id === contact.id)
        if (!exists) {
            contacts.value.push(contact)
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

    function isUserOnline(userId) {
        return onlineUsers.value.has(userId)
    }

    return {
        contacts,
        onlineUsers,
        setContacts,
        addContact,
        removeContact,
        updateContactStatus,
        isUserOnline
    }
})
