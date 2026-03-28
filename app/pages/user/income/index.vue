<script setup lang="ts">
import { api } from '../../../../convex/_generated/api'

definePageMeta({
  layout: 'user',
  middleware: 'auth',
})

const { user } = useAuth()

const { data: incomes } = useConvexQuery(api.incomes.list, computed(() => ({
  userId: user.value?._id,
})))

const { mutate: removeMutate } = useConvexMutation(api.incomes.remove)

const search = ref('')
const filterCategory = ref('')
const filterPayment = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('date-desc')

const categories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Refund', 'Other']
const paymentMethods = ['Cash', 'Visa Card']

const filteredIncomes = computed(() => {
  if (!incomes.value) return []
  let result = [...incomes.value]

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((e: any) =>
      e.title.toLowerCase().includes(q) || (e.note && e.note.toLowerCase().includes(q))
    )
  }
  if (filterCategory.value) {
    result = result.filter((e: any) => e.category === filterCategory.value)
  }
  if (filterPayment.value) {
    result = result.filter((e: any) => e.paymentMethod === filterPayment.value)
  }
  if (dateFrom.value) {
    result = result.filter((e: any) => e.date >= dateFrom.value)
  }
  if (dateTo.value) {
    result = result.filter((e: any) => e.date <= dateTo.value)
  }

  if (sortBy.value === 'date-desc') result.sort((a: any, b: any) => b.date.localeCompare(a.date))
  else if (sortBy.value === 'date-asc') result.sort((a: any, b: any) => a.date.localeCompare(b.date))
  else if (sortBy.value === 'amount-desc') result.sort((a: any, b: any) => b.amount - a.amount)
  else if (sortBy.value === 'amount-asc') result.sort((a: any, b: any) => a.amount - b.amount)

  return result
})

const filteredTotal = computed(() =>
  filteredIncomes.value.reduce((sum: number, e: any) => sum + e.amount, 0)
)

const hasFilters = computed(() =>
  search.value || filterCategory.value || filterPayment.value || dateFrom.value || dateTo.value
)

const clearFilters = () => {
  search.value = ''
  filterCategory.value = ''
  filterPayment.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

const deleteLoading = ref<string | null>(null)

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this income?')) return
  deleteLoading.value = id
  try {
    await removeMutate({ id: id as any })
  } catch (e: any) {
    alert('Failed to delete: ' + e.message)
  } finally {
    deleteLoading.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Income</h1>
        <p class="text-gray-500 text-sm">
          Showing {{ filteredIncomes.length }} {{ filteredIncomes.length === 1 ? 'item' : 'items' }}
          &middot; Total: ${{ filteredTotal.toFixed(2) }}
        </p>
      </div>
      <NuxtLink
        to="/user/income/create"
        class="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm"
      >
        + New Income
      </NuxtLink>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          v-model="search"
          placeholder="Search title or note..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          v-model="filterCategory"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select
          v-model="filterPayment"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Payments</option>
          <option v-for="pm in paymentMethods" :key="pm" :value="pm">{{ pm }}</option>
        </select>
        <select
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="amount-desc">Amount (High → Low)</option>
          <option value="amount-asc">Amount (Low → High)</option>
        </select>
      </div>
      <div class="flex gap-3 mt-3">
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-500">From</label>
          <input
            type="date"
            v-model="dateFrom"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-500">To</label>
          <input
            type="date"
            v-model="dateTo"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          v-if="hasFilters"
          @click="clearFilters"
          class="text-xs text-red-600 hover:text-red-800 font-medium ml-auto"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div v-if="filteredIncomes.length === 0" class="text-gray-400 italic text-center py-12">
        {{ hasFilters ? 'No income matches your filters.' : 'No income yet. Click "+ New Income" to add one.' }}
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="text-left text-sm text-gray-500 border-b">
            <th class="p-4 font-medium">Title</th>
            <th class="p-4 font-medium">Category</th>
            <th class="p-4 font-medium">Payment</th>
            <th class="p-4 font-medium">Date</th>
            <th class="p-4 font-medium">Note</th>
            <th class="p-4 font-medium text-right">Amount</th>
            <th class="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="inc in filteredIncomes"
            :key="inc._id"
            class="border-b last:border-0 hover:bg-gray-50 transition"
          >
            <td class="p-4 text-sm font-medium text-gray-900">{{ inc.title }}</td>
            <td class="p-4">
              <span class="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{{ inc.category }}</span>
            </td>
            <td class="p-4">
              <span class="text-xs px-2 py-1 rounded-full" :class="inc.paymentMethod === 'Cash' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'">{{ inc.paymentMethod }}</span>
            </td>
            <td class="p-4 text-sm text-gray-600">{{ inc.date }}</td>
            <td class="p-4 text-sm text-gray-500 max-w-[200px] truncate">{{ inc.note || '-' }}</td>
            <td class="p-4 text-sm font-semibold text-green-600 text-right">${{ inc.amount.toFixed(2) }}</td>
            <td class="p-4 text-right">
              <div class="flex gap-2 justify-end">
                <NuxtLink
                  :to="`/user/income/${inc._id}`"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </NuxtLink>
                <button
                  @click="handleDelete(inc._id)"
                  :disabled="deleteLoading === inc._id"
                  class="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  {{ deleteLoading === inc._id ? '...' : 'Delete' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
