import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/services/api'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const token = ref(null)
    const isLoading = ref(false)

    // Computed: Check if user is logged in
    const isLoggedIn = computed(() => {
        return !!currentUser.value && !!token.value
    })

    const register = async (registerData) => {
        isLoading.value = true
        try {
            const response = await authAPI.register(registerData)
            const { token: authToken, userId, username, nickname, avatarUrl, email, phone } = response.data

            currentUser.value = {
                id: userId,
                username,
                nickname,
                avatar: avatarUrl,
                email,
                phone,
                bio: '',
                showOnlineStatus: true,
                showLastSeen: true,
                showEmail: false
            }
            token.value = authToken

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(currentUser.value))
            localStorage.setItem('token', token.value)

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Registration failed'
        } finally {
            isLoading.value = false
        }
    }

    const login = async (usernameOrEmail, password) => {
        isLoading.value = true
        try {
            const response = await authAPI.login(usernameOrEmail, password)
            const { token: authToken, userId, username, nickname, avatarUrl, email, phone } = response.data

            currentUser.value = {
                id: userId,
                username,
                nickname,
                avatar: avatarUrl,
                email,
                phone,
                bio: '',
                showOnlineStatus: true,
                showLastSeen: true,
                showEmail: false
            }
            token.value = authToken

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(currentUser.value))
            localStorage.setItem('token', token.value)

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Login failed'
        } finally {
            isLoading.value = false
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

    const updateProfile = async (profileData) => {
        isLoading.value = true
        try {
            // In real app, call API
            // await userAPI.updateProfile(currentUser.value.id, profileData.nickname, profileData.avatar)

            currentUser.value = {
                ...currentUser.value,
                ...profileData
            }

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(currentUser.value))

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Update failed'
        } finally {
            isLoading.value = false
        }
    }

    const updateAvatar = async (avatarData) => {
        try {
            // In real app, upload avatar and get URL
            // const response = await fileAPI.uploadFile(avatarFile)
            // const avatarUrl = response.data.url

            currentUser.value.avatar = avatarData
            localStorage.setItem('user', JSON.stringify(currentUser.value))

            return currentUser.value
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Avatar update failed'
        }
    }

    const updatePrivacySettings = (settings) => {
        currentUser.value = {
            ...currentUser.value,
            showOnlineStatus: settings.showOnlineStatus,
            showLastSeen: settings.showLastSeen,
            showEmail: settings.showEmail
        }
        localStorage.setItem('user', JSON.stringify(currentUser.value))
    }

    return {
        currentUser,
        token,
        isLoading,
        isLoggedIn,
        register,
        login,
        loadUserFromStorage,
        logout,
        updateProfile,
        updateAvatar,
        updatePrivacySettings
    }
})
