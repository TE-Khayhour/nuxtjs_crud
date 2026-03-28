export const useAuth = () => {
  const user = useState<any | null>('auth_user', () => null)

  const login = async (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      user.value = { username: 'admin', role: 'admin' }
      navigateTo('/admin')
      return
    }
    throw new Error('Use Convex login for regular users')
  }

  const loginAsUser = (userData: any) => {
    user.value = userData
    navigateTo('/user')
  }

  const logout = () => {
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    login,
    loginAsUser,
    logout,
    isAdmin: computed(() => user.value?.role === 'admin'),
    isUser: computed(() => user.value?.role === 'user'),
  }
}
