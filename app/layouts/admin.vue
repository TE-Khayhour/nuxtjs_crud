<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-8">
            <span class="flex items-center gap-2 text-xl font-bold text-gray-900">
              <img src="/assests/images/favicon-32x32.png" alt="Logo" class="w-7 h-7" />
              Finance Tracker
            </span>
            <div class="flex gap-1">
              <NuxtLink
                to="/admin"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="route.path === '/admin' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100'"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/admin/users"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="route.path.startsWith('/admin/users') ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100'"
              >
                Users
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user?.username }}</span>
            <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Admin</span>
            <button
              @click="logout"
              class="text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
