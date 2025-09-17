import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable since we're not using email confirmation
  }
})

// Auth helper functions
export const authHelpers = {
  // Sign up new user (no email confirmation required)
  async signUp(email: string, password: string, userData: { first_name: string; last_name: string }) {
    console.log('Supabase signUp called with:', { email, userData });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation redirect
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`
        }
      }
    })
    
    console.log('Supabase signUp response:', { data, error });
    
    if (error) {
      console.error('Supabase signUp error:', error);
      throw new Error(error.message)
    }
    
    return data
  },

  // Sign in user
  async signIn(email: string, password: string, rememberMe?: boolean) {
    console.log('Supabase signIn called with:', { email, rememberMe });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('Supabase signIn response:', { data, error });
    
    if (error) {
      console.error('Supabase signIn error:', error);
      throw new Error(error.message)
    }
    
    // Store remember me preference for future reference
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        // Supabase sessions are persistent by default, lasting 1 hour with auto-refresh
        // For "remember me", we'll rely on the persistent session configuration
      } else {
        localStorage.removeItem('remember_me');
      }
    }
    
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return user
  },

  // Listen for auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}