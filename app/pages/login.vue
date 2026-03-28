<script setup lang="ts">
import { api } from '../../convex/_generated/api'

const { login: adminLogin, loginAsUser } = useAuth()

const { mutate: loginMutate } = useConvexMutation(api.users.login)

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    if (username.value === 'admin' && password.value === 'admin123') {
      await adminLogin(username.value, password.value)
      return
    }

    const userData = await loginMutate({
      username: username.value,
      password: password.value,
    })
    loginAsUser({
      _id: userData._id,
      username: userData.username,
      role: userData.role,
    })
  } catch (e: any) {
    error.value = e.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
      <div class="text-center mb-6">
        <img src="/assests/images/android-chrome-192x192.png" alt="Finance Tracker" class="w-14 h-14 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p class="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            v-model="username"
            placeholder="Enter your username"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="Enter your password"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an account?
        <NuxtLink to="/register" class="text-blue-600 hover:underline font-medium">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>
