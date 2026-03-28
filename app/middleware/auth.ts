export default defineNuxtRouteMiddleware((to, _from) => {
  const { user } = useAuth()

  if (!user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/') {
    return navigateTo('/login')
  }

  if (to.path.startsWith('/admin') && user.value?.role !== 'admin') {
    return navigateTo('/user')
  }

  if (to.path.startsWith('/user') && user.value?.role !== 'user') {
    if (user.value?.role === 'admin') {
      return navigateTo('/admin')
    }
  }
})
