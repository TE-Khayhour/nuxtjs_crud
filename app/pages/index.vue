<script setup lang="ts">
const { user } = useAuth()

watchEffect(() => {
  if (user.value) {
    navigateTo(user.value.role === 'admin' ? '/admin' : '/user')
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md w-full">
      <img src="/assests/images/android-chrome-192x192.png" alt="Finance Tracker" class="w-16 h-16 mx-auto mb-2" />
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Finance Tracker</h1>
      <p class="text-gray-500 mb-8">Track your expenses, manage your finances</p>
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/login"
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Login
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-semibold"
        >
          Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
