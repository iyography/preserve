import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authHelpers } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // First, try to get the existing session
        const existingSession = await authHelpers.getSession()
        
        if (existingSession?.user) {
          setUser(existingSession.user)
          setSession(existingSession)
          setLoading(false)
          return
        }
        
        // If no session, try to get current user
        const currentUser = await authHelpers.getCurrentUser()
        setUser(currentUser)
        setLoading(false)
        
      } catch (error) {
        console.log('No existing session found, user needs to sign in')
        setUser(null)
        setSession(null)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
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