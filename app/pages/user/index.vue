<script setup lang="ts">
import { api } from '../../../convex/_generated/api'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

definePageMeta({
  layout: 'user',
  middleware: 'auth',
})

const { user } = useAuth()

const { data: expenses } = useConvexQuery(api.expenses.list, computed(() => ({
  userId: user.value?._id,
})))
const { data: incomes } = useConvexQuery(api.incomes.list, computed(() => ({
  userId: user.value?._id,
})))

const totalIncome = computed(() => {
  if (!incomes.value) return 0
  return incomes.value.reduce((sum: number, e: any) => sum + e.amount, 0)
})

const totalExpense = computed(() => {
  if (!expenses.value) return 0
  return expenses.value.reduce((sum: number, e: any) => sum + e.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

// --- 1. Recent Activity (mixed income + expense, sorted by date) ---
const recentActivity = computed(() => {
  const items: any[] = []
  if (incomes.value) {
    incomes.value.forEach((i: any) => items.push({ ...i, type: 'income' }))
  }
  if (expenses.value) {
    expenses.value.forEach((e: any) => items.push({ ...e, type: 'expense' }))
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
})

// --- 3. Income vs Expense by month (bar chart) ---
const monthlyData = computed(() => {
  const map: Record<string, { income: number; expense: number }> = {}

  if (incomes.value) {
    incomes.value.forEach((i: any) => {
      const month = i.date.substring(0, 7)
      if (!map[month]) map[month] = { income: 0, expense: 0 }
      map[month].income += i.amount
    })
  }
  if (expenses.value) {
    expenses.value.forEach((e: any) => {
      const month = e.date.substring(0, 7)
      if (!map[month]) map[month] = { income: 0, expense: 0 }
      map[month].expense += e.amount
    })
  }

  const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  return {
    labels: sorted.map(([m]) => m),
    incomes: sorted.map(([, v]) => v.income),
    expenses: sorted.map(([, v]) => v.expense),
  }
})

const monthlyChartData = computed(() => ({
  labels: monthlyData.value.labels,
  datasets: [
    {
      label: 'Income',
      data: monthlyData.value.incomes,
      backgroundColor: '#22c55e',
      borderRadius: 6,
    },
    {
      label: 'Expense',
      data: monthlyData.value.expenses,
      backgroundColor: '#ef4444',
      borderRadius: 6,
    },
  ],
}))

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v: any) => `$${v}` },
    },
  },
}

// --- 4. Expense by category (doughnut) ---
const categoryData = computed(() => {
  const map: Record<string, number> = {}
  if (expenses.value) {
    expenses.value.forEach((e: any) => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
  }
  const entries = Object.entries(map).sort(([, a], [, b]) => b - a)
  return {
    labels: entries.map(([k]) => k),
    amounts: entries.map(([, v]) => v),
  }
})

const categoryColors = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280']

const categoryChartData = computed(() => ({
  labels: categoryData.value.labels,
  datasets: [
    {
      data: categoryData.value.amounts,
      backgroundColor: categoryColors.slice(0, categoryData.value.labels.length),
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const, labels: { boxWidth: 12, padding: 16 } },
  },
}

// --- 5. Payment method split ---
const paymentSplit = computed(() => {
  let expCash = 0, expVisa = 0, incCash = 0, incVisa = 0
  if (expenses.value) {
    expenses.value.forEach((e: any) => {
      if (e.paymentMethod === 'Cash') expCash += e.amount
      else expVisa += e.amount
    })
  }
  if (incomes.value) {
    incomes.value.forEach((i: any) => {
      if (i.paymentMethod === 'Cash') incCash += i.amount
      else incVisa += i.amount
    })
  }
  const expTotal = expCash + expVisa
  const incTotal = incCash + incVisa
  return {
    expense: {
      cash: expCash,
      visa: expVisa,
      cashPct: expTotal > 0 ? (expCash / expTotal) * 100 : 0,
      visaPct: expTotal > 0 ? (expVisa / expTotal) * 100 : 0,
    },
    income: {
      cash: incCash,
      visa: incVisa,
      cashPct: incTotal > 0 ? (incCash / incTotal) * 100 : 0,
      visaPct: incTotal > 0 ? (incVisa / incTotal) * 100 : 0,
    },
  }
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Welcome back, {{ user?.username }}</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full opacity-80"></div>
        <div class="relative">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-500">Total Income</span>
          </div>
          <p class="text-3xl font-bold text-green-600">${{ totalIncome.toFixed(2) }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ incomes?.length ?? 0 }} transactions</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full opacity-80"></div>
        <div class="relative">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-500">Total Expense</span>
          </div>
          <p class="text-3xl font-bold text-red-600">${{ totalExpense.toFixed(2) }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ expenses?.length ?? 0 }} transactions</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-80" :class="balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'"></div>
        <div class="relative">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="balance >= 0 ? 'text-blue-600' : 'text-orange-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                <circle cx="17" cy="12" r="3" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-500">Balance</span>
          </div>
          <p class="text-3xl font-bold" :class="balance >= 0 ? 'text-blue-600' : 'text-orange-600'">
            {{ balance >= 0 ? '' : '-' }}${{ Math.abs(balance).toFixed(2) }}
          </p>
          <p class="text-xs mt-2" :class="balance >= 0 ? 'text-green-500' : 'text-orange-500'">
            {{ balance >= 0 ? 'You\'re in good shape!' : 'Spending exceeds income' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Row: Monthly Bar + Category Doughnut -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 3. Income vs Expense by Month -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Income vs Expense by Month</h2>
        <div v-if="monthlyData.labels.length === 0" class="text-gray-400 italic text-center py-12 text-sm">
          No data yet.
        </div>
        <div v-else class="h-64">
          <Bar :data="monthlyChartData" :options="monthlyChartOptions" />
        </div>
      </div>

      <!-- 4. Expense by Category -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h2>
        <div v-if="categoryData.labels.length === 0" class="text-gray-400 italic text-center py-12 text-sm">
          No expenses yet.
        </div>
        <div v-else class="h-64 flex items-center justify-center">
          <Doughnut :data="categoryChartData" :options="categoryChartOptions" />
        </div>
      </div>
    </div>

    <!-- 5. Payment Method Split -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Expense by Payment Method</h2>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Cash</span>
              <span class="font-medium text-gray-900">${{ paymentSplit.expense.cash.toFixed(2) }} ({{ paymentSplit.expense.cashPct.toFixed(0) }}%)</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
              <div class="bg-yellow-400 h-3 rounded-full transition-all" :style="{ width: paymentSplit.expense.cashPct + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Visa Card</span>
              <span class="font-medium text-gray-900">${{ paymentSplit.expense.visa.toFixed(2) }} ({{ paymentSplit.expense.visaPct.toFixed(0) }}%)</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
              <div class="bg-blue-500 h-3 rounded-full transition-all" :style="{ width: paymentSplit.expense.visaPct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Income by Payment Method</h2>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Cash</span>
              <span class="font-medium text-gray-900">${{ paymentSplit.income.cash.toFixed(2) }} ({{ paymentSplit.income.cashPct.toFixed(0) }}%)</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
              <div class="bg-yellow-400 h-3 rounded-full transition-all" :style="{ width: paymentSplit.income.cashPct + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Visa Card</span>
              <span class="font-medium text-gray-900">${{ paymentSplit.income.visa.toFixed(2) }} ({{ paymentSplit.income.visaPct.toFixed(0) }}%)</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
              <div class="bg-blue-500 h-3 rounded-full transition-all" :style="{ width: paymentSplit.income.visaPct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Recent Activity Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div v-if="recentActivity.length === 0" class="text-gray-400 italic text-center py-8 text-sm">
        No transactions yet. Add some income or expenses to get started.
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="text-left text-sm text-gray-500 border-b">
            <th class="pb-3 font-medium">Date</th>
            <th class="pb-3 font-medium">Type</th>
            <th class="pb-3 font-medium">Title</th>
            <th class="pb-3 font-medium">Category</th>
            <th class="pb-3 font-medium">Payment</th>
            <th class="pb-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in recentActivity" :key="item._id" class="border-b last:border-0">
            <td class="py-3 text-sm text-gray-600">{{ item.date }}</td>
            <td class="py-3">
              <span
                class="text-xs px-2 py-1 rounded-full font-medium"
                :class="item.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
              >
                {{ item.type === 'income' ? 'Income' : 'Expense' }}
              </span>
            </td>
            <td class="py-3 text-sm text-gray-900">{{ item.title }}</td>
            <td class="py-3">
              <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{{ item.category }}</span>
            </td>
            <td class="py-3">
              <span class="text-xs px-2 py-1 rounded-full" :class="item.paymentMethod === 'Cash' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'">{{ item.paymentMethod }}</span>
            </td>
            <td class="py-3 text-sm font-semibold text-right" :class="item.type === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ item.type === 'income' ? '+' : '-' }}${{ item.amount.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
