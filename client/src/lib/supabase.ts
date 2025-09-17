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
    detectSessionInUrl: false, // Disable magic link detection since we're not using email confirmation
    storageKey: 'preserving-connections-auth',
    flowType: 'pkce'
  }
})

// Auth helper functions
export const authHelpers = {
  // Sign up new user (no email confirmation required)
  async signUp(email: string, password: string, userData: { first_name: string; last_name: string }) {
    console.log('Supabase signUp called with:', { email, userData });
    
    // First, check if user already exists to avoid duplicate signups
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (existingUser?.user && !checkError) {
      console.log('User already exists, signing in instead of signing up');
      return existingUser;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: undefined,
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          email_confirmed: true // Mark as confirmed since we're not using email confirmation
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
  },

  // Handle session from URL (for magic links)
  async handleAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error);
        throw new Error(error.message)
      }
      
      return data.session
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error
    }
  },

  // Get session directly
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return data.session
    } catch (error) {
      console.error('Get session error:', error);
      throw error
    }
  }
}