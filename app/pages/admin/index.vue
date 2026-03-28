<script setup lang="ts">
import { api } from '../../../convex/_generated/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { data: users } = useConvexQuery(api.users.listAll, {})
const { data: allExpenses } = useConvexQuery(api.expenses.listAll, {})
const { data: allIncomes } = useConvexQuery(api.incomes.listAll, {})

const totalUsers = computed(() => users.value?.length ?? 0)
const totalExpense = computed(() =>
  (allExpenses.value ?? []).reduce((s: number, e: any) => s + e.amount, 0)
)
const totalIncome = computed(() =>
  (allIncomes.value ?? []).reduce((s: number, e: any) => s + e.amount, 0)
)
const net = computed(() => totalIncome.value - totalExpense.value)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
    <p class="text-gray-500 text-sm mb-8">Overview of all users and platform activity</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500 mb-1">Total Users</p>
        <p class="text-3xl font-bold text-purple-600">{{ totalUsers }}</p>
        <NuxtLink to="/admin/users" class="text-xs text-purple-600 hover:underline mt-2 inline-block">Manage users →</NuxtLink>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500 mb-1">Platform Income</p>
        <p class="text-3xl font-bold text-green-600">${{ totalIncome.toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-2">{{ allIncomes?.length ?? 0 }} transactions</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500 mb-1">Platform Expenses</p>
        <p class="text-3xl font-bold text-red-600">${{ totalExpense.toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-2">{{ allExpenses?.length ?? 0 }} transactions</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500 mb-1">Net Balance</p>
        <p class="text-3xl font-bold" :class="net >= 0 ? 'text-blue-600' : 'text-orange-600'">
          {{ net >= 0 ? '' : '-' }}${{ Math.abs(net).toFixed(2) }}
        </p>
        <p class="text-xs mt-2" :class="net >= 0 ? 'text-green-500' : 'text-orange-500'">
          {{ net >= 0 ? 'Platform positive' : 'Platform negative' }}
        </p>
      </div>
    </div>
  </div>
</template>
