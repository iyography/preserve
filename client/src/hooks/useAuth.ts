import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authHelpers } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authHelpers.getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    }).catch(() => {
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { first_name: string; last_name: string }) => {
    setLoading(true)
    try {
      const result = await authHelpers.signUp(email, password, userData)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    setLoading(true)
    try {
      const result = await authHelpers.signIn(email, password, rememberMe)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authHelpers.signOut()
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  }
}