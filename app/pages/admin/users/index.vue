<script setup lang="ts">
import { api } from '../../../../convex/_generated/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { data: users } = useConvexQuery(api.users.listAll, {})
const { data: allExpenses } = useConvexQuery(api.expenses.listAll, {})
const { data: allIncomes } = useConvexQuery(api.incomes.listAll, {})

const search = ref('')
const filterRole = ref('')
const sortBy = ref('username-asc')

const selectedUserId = ref<string | null>(null)
const detailTab = ref<'expense' | 'income'>('expense')
const detailSort = ref('date-desc')

const getUserExpenseTotal = (uid: string) =>
  (allExpenses.value ?? []).filter((e: any) => e.userId === uid).reduce((s: number, e: any) => s + e.amount, 0)

const getUserIncomeTotal = (uid: string) =>
  (allIncomes.value ?? []).filter((e: any) => e.userId === uid).reduce((s: number, e: any) => s + e.amount, 0)

const getUserExpenseCount = (uid: string) =>
  (allExpenses.value ?? []).filter((e: any) => e.userId === uid).length

const getUserIncomeCount = (uid: string) =>
  (allIncomes.value ?? []).filter((e: any) => e.userId === uid).length

const filteredUsers = computed(() => {
  if (!users.value) return []
  let result = [...users.value]

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((u: any) => u.username.toLowerCase().includes(q))
  }
  if (filterRole.value) {
    result = result.filter((u: any) => u.role === filterRole.value)
  }

  if (sortBy.value === 'username-asc') result.sort((a: any, b: any) => a.username.localeCompare(b.username))
  else if (sortBy.value === 'username-desc') result.sort((a: any, b: any) => b.username.localeCompare(a.username))
  else if (sortBy.value === 'expense-desc') result.sort((a: any, b: any) => getUserExpenseTotal(b._id) - getUserExpenseTotal(a._id))
  else if (sortBy.value === 'expense-asc') result.sort((a: any, b: any) => getUserExpenseTotal(a._id) - getUserExpenseTotal(b._id))
  else if (sortBy.value === 'income-desc') result.sort((a: any, b: any) => getUserIncomeTotal(b._id) - getUserIncomeTotal(a._id))
  else if (sortBy.value === 'income-asc') result.sort((a: any, b: any) => getUserIncomeTotal(a._id) - getUserIncomeTotal(b._id))

  return result
})

const selectedUser = computed(() => {
  if (!selectedUserId.value || !users.value) return null
  return users.value.find((u: any) => u._id === selectedUserId.value)
})

const selectedExpenseTotal = computed(() => selectedUserId.value ? getUserExpenseTotal(selectedUserId.value) : 0)
const selectedIncomeTotal = computed(() => selectedUserId.value ? getUserIncomeTotal(selectedUserId.value) : 0)
const selectedBalance = computed(() => selectedIncomeTotal.value - selectedExpenseTotal.value)

const detailList = computed(() => {
  if (!selectedUserId.value) return []
  let items: any[] = []

  if (detailTab.value === 'expense') {
    items = (allExpenses.value ?? []).filter((e: any) => e.userId === selectedUserId.value)
  } else {
    items = (allIncomes.value ?? []).filter((e: any) => e.userId === selectedUserId.value)
  }

  if (detailSort.value === 'date-desc') items.sort((a: any, b: any) => b.date.localeCompare(a.date))
  else if (detailSort.value === 'date-asc') items.sort((a: any, b: any) => a.date.localeCompare(b.date))
  else if (detailSort.value === 'amount-desc') items.sort((a: any, b: any) => b.amount - a.amount)
  else if (detailSort.value === 'amount-asc') items.sort((a: any, b: any) => a.amount - b.amount)

  return items
})

const selectUser = (uid: string) => {
  selectedUserId.value = selectedUserId.value === uid ? null : uid
  detailTab.value = 'expense'
  detailSort.value = 'date-desc'
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">All Users</h1>
    <p class="text-gray-500 text-sm mb-6">
      {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'user' : 'users' }} found
    </p>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          v-model="search"
          placeholder="Search by username..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <select
          v-model="filterRole"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="username-asc">Username A → Z</option>
          <option value="username-desc">Username Z → A</option>
          <option value="expense-desc">Expense (High → Low)</option>
          <option value="expense-asc">Expense (Low → High)</option>
          <option value="income-desc">Income (High → Low)</option>
          <option value="income-asc">Income (Low → High)</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- User List (left, wider) -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div v-if="filteredUsers.length === 0" class="text-gray-400 italic text-center py-12">
            {{ search || filterRole ? 'No users match your filters.' : 'No users registered yet.' }}
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="text-left text-sm text-gray-500 border-b">
                <th class="p-4 font-medium">Username</th>
                <th class="p-4 font-medium">Role</th>
                <th class="p-4 font-medium text-right">Income</th>
                <th class="p-4 font-medium text-right">Expense</th>
                <th class="p-4 font-medium text-right">Balance</th>
                <th class="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="u in filteredUsers"
                :key="u._id"
                class="border-b last:border-0 hover:bg-gray-50 transition cursor-pointer"
                :class="selectedUserId === u._id ? 'bg-purple-50' : ''"
                @click="selectUser(u._id)"
              >
                <td class="p-4 text-sm font-medium text-gray-900">{{ u.username }}</td>
                <td class="p-4">
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="p-4 text-sm text-green-600 font-medium text-right">${{ getUserIncomeTotal(u._id).toFixed(2) }}</td>
                <td class="p-4 text-sm text-red-600 font-medium text-right">${{ getUserExpenseTotal(u._id).toFixed(2) }}</td>
                <td class="p-4 text-sm font-semibold text-right" :class="getUserIncomeTotal(u._id) - getUserExpenseTotal(u._id) >= 0 ? 'text-blue-600' : 'text-orange-600'">
                  ${{ (getUserIncomeTotal(u._id) - getUserExpenseTotal(u._id)).toFixed(2) }}
                </td>
                <td class="p-4 text-right">
                  <button class="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    {{ selectedUserId === u._id ? 'Hide' : 'View' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Panel (right) -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
          <!-- No selection -->
          <div v-if="!selectedUser" class="text-center py-12">
            <p class="text-gray-400 italic text-sm">Click a user to view their details</p>
          </div>

          <!-- Selected user -->
          <div v-else>
            <!-- User header -->
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-700 font-bold text-sm">{{ selectedUser.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ selectedUser.username }}</p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
                >
                  {{ selectedUser.role }}
                </span>
              </div>
            </div>

            <!-- Summary chips -->
            <div class="grid grid-cols-3 gap-3 mb-5">
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <p class="text-xs text-green-600 font-medium">Income</p>
                <p class="text-sm font-bold text-green-700">${{ selectedIncomeTotal.toFixed(2) }}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-3 text-center">
                <p class="text-xs text-red-600 font-medium">Expense</p>
                <p class="text-sm font-bold text-red-700">${{ selectedExpenseTotal.toFixed(2) }}</p>
              </div>
              <div class="rounded-lg p-3 text-center" :class="selectedBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'">
                <p class="text-xs font-medium" :class="selectedBalance >= 0 ? 'text-blue-600' : 'text-orange-600'">Balance</p>
                <p class="text-sm font-bold" :class="selectedBalance >= 0 ? 'text-blue-700' : 'text-orange-700'">${{ selectedBalance.toFixed(2) }}</p>
              </div>
            </div>

            <!-- Tabs + Sort -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  @click="detailTab = 'expense'"
                  class="px-4 py-1.5 text-xs font-medium transition"
                  :class="detailTab === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                >
                  Expenses ({{ getUserExpenseCount(selectedUserId!) }})
                </button>
                <button
                  @click="detailTab = 'income'"
                  class="px-4 py-1.5 text-xs font-medium transition"
                  :class="detailTab === 'income' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                >
                  Income ({{ getUserIncomeCount(selectedUserId!) }})
                </button>
              </div>
              <select
                v-model="detailSort"
                class="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="date-desc">Date ↓</option>
                <option value="date-asc">Date ↑</option>
                <option value="amount-desc">Amount ↓</option>
                <option value="amount-asc">Amount ↑</option>
              </select>
            </div>

            <!-- Transaction list -->
            <div v-if="detailList.length === 0" class="text-gray-400 italic text-sm text-center py-8">
              No {{ detailTab === 'expense' ? 'expenses' : 'income' }} for this user.
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="item in detailList"
                :key="item._id"
                class="border border-gray-100 rounded-lg p-3"
              >
                <div class="flex justify-between items-start">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-gray-900 text-sm truncate">{{ item.title }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ item.category }}</span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full"
                        :class="item.paymentMethod === 'Cash' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'"
                      >
                        {{ item.paymentMethod }}
                      </span>
                      <span class="text-xs text-gray-400">{{ item.date }}</span>
                    </div>
                  </div>
                  <span
                    class="text-sm font-semibold ml-3 whitespace-nowrap"
                    :class="detailTab === 'income' ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ detailTab === 'income' ? '+' : '-' }}${{ item.amount.toFixed(2) }}
                  </span>
                </div>
                <p v-if="item.note" class="text-xs text-gray-400 mt-1.5 truncate">{{ item.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
