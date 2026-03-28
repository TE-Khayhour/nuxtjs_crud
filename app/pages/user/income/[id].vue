<script setup lang="ts">
import { api } from '../../../../convex/_generated/api'

definePageMeta({
  layout: 'user',
  middleware: 'auth',
})

const route = useRoute()
const incomeId = route.params.id as string

const { data: income } = useConvexQuery(api.incomes.getById, () => ({
  id: incomeId as any,
}))

const { mutate: updateMutate } = useConvexMutation(api.incomes.update)

const form = reactive({
  title: '',
  amount: '',
  category: 'Salary',
  paymentMethod: 'Cash',
  date: '',
  note: '',
})

const categories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Refund', 'Other']
const paymentMethods = ['Cash', 'Visa Card']
const loading = ref(false)
const error = ref('')
const loaded = ref(false)

watch(income, (val) => {
  if (val && !loaded.value) {
    form.title = val.title
    form.amount = String(val.amount)
    form.category = val.category
    form.paymentMethod = val.paymentMethod || 'Cash'
    form.date = val.date
    form.note = val.note || ''
    loaded.value = true
  }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await updateMutate({
      id: incomeId as any,
      title: form.title,
      amount: parseFloat(form.amount),
      category: form.category,
      paymentMethod: form.paymentMethod,
      date: form.date,
      note: form.note || undefined,
    })
    navigateTo('/user/income')
  } catch (e: any) {
    error.value = e.message || 'Failed to update income.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/user/income" class="text-sm text-blue-600 hover:underline">&larr; Back to Income</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-2">Edit Income</h1>
    </div>

    <div v-if="!income && !loaded" class="text-gray-400 italic text-center py-12">
      Loading income...
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            v-model="form.title"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            v-model="form.amount"
            step="0.01"
            min="0"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="form.category"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            v-model="form.paymentMethod"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
          >
            <option v-for="pm in paymentMethods" :key="pm" :value="pm">{{ pm }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            v-model="form.date"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea
            v-model="form.note"
            rows="3"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
          ></textarea>
        </div>
        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Updating...' : 'Update Income' }}
          </button>
          <NuxtLink
            to="/user/income"
            class="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
