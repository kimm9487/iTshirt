import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  checkAccount,
  fetchMyAccount,
  loginAccount,
  logoutAccount,
  signupAccount,
} from '../api/client'

const LOCAL_USERS_KEY = 'local_shop_users'
const LOCAL_SESSION_KEY = 'local_shop_session'
const AuthContext = createContext(null)

function readLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

function readLocalSession() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function writeLocalSession(session) {
  if (!session) {
    localStorage.removeItem(LOCAL_SESSION_KEY)
    return
  }
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        const serverUserId = await checkAccount()
        if (!mounted) return

        if (serverUserId) {
          try {
            const me = await fetchMyAccount()
            if (!mounted) return
            setUser({
              id: Number(me.id || serverUserId),
              email: me.email,
              name: me.name,
              role: me.role || 'USER',
              source: 'server',
            })
          } catch {
            setUser({ id: Number(serverUserId), source: 'server' })
          }
          writeLocalSession(null)
          return
        }
      } catch {
        // backend unavailable or not logged in
      }

      if (!mounted) return
      const localSession = readLocalSession()
      if (localSession) {
        setUser({ ...localSession, source: 'local' })
      }
      setLoading(false)
    }

    bootstrap().finally(() => {
      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  async function login(email, password) {
    try {
      const id = await loginAccount(email, password)
      try {
        const me = await fetchMyAccount()
        setUser({
          id: Number(me.id || id),
          email: me.email || email,
          name: me.name || '',
          role: me.role || 'USER',
          source: 'server',
        })
      } catch {
        setUser({ id: Number(id), email, source: 'server' })
      }
      writeLocalSession(null)
      return
    } catch {
      const users = readLocalUsers()
      const found = users.find((entry) => entry.email === email && entry.password === password)
      if (!found) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
      const localUser = { id: found.id, email: found.email, name: found.name, source: 'local' }
      setUser(localUser)
      writeLocalSession(localUser)
    }
  }

  async function signup(payload) {
    const body = {
      email: payload.email,
      password: payload.password,
      name: payload.name,
    }

    try {
      await signupAccount(body)
      await login(payload.email, payload.password)
      return
    } catch {
      const users = readLocalUsers()
      const hasEmail = users.some((entry) => entry.email === payload.email)
      if (hasEmail) {
        throw new Error('이미 가입된 이메일입니다.')
      }

      const localUser = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        password: payload.password,
      }
      const nextUsers = [...users, localUser]
      saveLocalUsers(nextUsers)

      const session = { id: localUser.id, email: localUser.email, name: localUser.name, source: 'local' }
      writeLocalSession(session)
      setUser(session)
    }
  }

  async function logout() {
    try {
      await logoutAccount()
    } catch {
      // fallback to local signout
    }
    setUser(null)
    writeLocalSession(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: String(user?.role || '').toUpperCase() === 'ADMIN',
      login,
      signup,
      logout,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
