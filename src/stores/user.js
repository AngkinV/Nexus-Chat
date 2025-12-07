import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authAPI } from '@/services/api'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const token = ref(null)

    const register = async (registerData) => {
        try {
            const response = await authAPI.register(registerData)
            const { token: authToken, id, username, nickname, avatarUrl } = response.data

            currentUser.value = {
                id,
                username,
                nickname,
                avatar: avatarUrl
            }
            token.value = authToken

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(currentUser.value))
            localStorage.setItem('token', token.value)

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Registration failed'
        }
    }

    const login = async (usernameOrEmail, password) => {
        try {
            const response = await authAPI.login(usernameOrEmail, password)
            const { token: authToken, id, username, nickname, avatarUrl } = response.data

            currentUser.value = {
                id,
                username,
                nickname,
                avatar: avatarUrl
            }
            token.value = authToken

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(currentUser.value))
            localStorage.setItem('token', token.value)

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Login failed'
        }
    }

    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (storedUser && storedToken) {
            currentUser.value = JSON.parse(storedUser)
            token.value = storedToken
        }
    }

    const logout = async () => {
        try {
            if (currentUser.value?.id) {
                await authAPI.logout(currentUser.value.id)
            }
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            currentUser.value = null
            token.value = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }

    return {
        currentUser,
        token,
        register,
        login,
        loadUserFromStorage,
        logout
    }
})
