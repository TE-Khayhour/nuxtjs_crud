<script setup lang="ts">
import { api } from '../../convex/_generated/api'

const { loginAsUser } = useAuth()

const { mutate: registerMutate } = useConvexMutation(api.users.register)
const { mutate: loginMutate } = useConvexMutation(api.users.login)

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 4) {
    error.value = 'Password must be at least 4 characters.'
    return
  }

  loading.value = true

  try {
    await registerMutate({
      username: username.value,
      password: password.value,
    })

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
    error.value = e.message || 'Registration failed. Please try again.'
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
        <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
        <p class="text-gray-500 text-sm mt-1">Start tracking your finances</p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            v-model="username"
            placeholder="Choose a username"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="Create a password"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium">Sign In</NuxtLink>
      </p>
    </div>
  </div>
</template>
