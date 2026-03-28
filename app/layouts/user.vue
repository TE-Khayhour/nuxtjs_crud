<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/user', icon: 'dashboard' },
  { label: 'Income', to: '/user/income', icon: 'income' },
  { label: 'Expense', to: '/user/expenses', icon: 'expense' },
]

const isActive = (path: string) => {
  if (path === '/user') return route.path === '/user'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed">
      <!-- Logo -->
      <div class="flex items-center gap-2 px-6 h-16 border-b border-gray-200">
        <img src="/assests/images/favicon-32x32.png" alt="Logo" class="w-7 h-7" />
        <span class="text-lg font-bold text-gray-900">Finance Tracker</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition"
          :class="isActive(item.to)
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'"
        >
          <!-- Dashboard icon -->
          <svg v-if="item.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <!-- Income icon (wallet with plus) -->
          <svg v-if="item.icon === 'income'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a2 2 0 100-4 2 2 0 000 4z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2 7l7-3 7 3" />
          </svg>
          <!-- Expense icon (receipt) -->
          <svg v-if="item.icon === 'expense'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2-2 4 4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 2l1.5 1.5L7 2l1.5 1.5L10 2l1.5 1.5L13 2l1.5 1.5L16 2l1.5 1.5L19 2l1 1v18l-1.5-1.5L17 21l-1.5-1.5L14 21l-1.5-1.5L11 21l-1.5-1.5L8 21l-1.5-1.5L5 21l-1-1V3z" />
            <path stroke-linecap="round" d="M8 7h8M8 11h5" />
          </svg>
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex-1 ml-60">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-6">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.username }}</span>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">User</span>
          <button
            @click="logout"
            class="text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
