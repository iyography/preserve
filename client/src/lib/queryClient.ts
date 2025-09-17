import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function getValidSession(retryCount = 0): Promise<any> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Error getting session:', error);
      return null;
    }
    
    // If no session, return null (user not logged in)
    if (!session) {
      return null;
    }
    
    // Check if token is expired (with 60 second buffer)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    if (expiresAt && (expiresAt - 60) <= now) {
      console.log('Token is expired or expiring soon, attempting refresh...');
      
      // Try to refresh the token
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.warn('Failed to refresh session:', refreshError);
        // Don't throw error - let the request proceed without auth
        // The server will return 401 and we'll handle it gracefully
        return null;
      }
      
      console.log('Session refreshed successfully');
      return refreshData.session;
    }
    
    return session;
  } catch (error) {
    console.warn('Error in getValidSession:', error);
    // If we can't get session info, return null and let request proceed without auth
    return null;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get a valid session (with automatic refresh if needed)
  const session = await getValidSession();
  
  // Prepare headers
  const headers: HeadersInit = {};
  
  // Add Content-Type for requests with data
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add Authorization header if user is authenticated
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Special handling for 401 errors - don't immediately throw, let the caller handle it
  if (res.status === 401) {
    console.log(`401 response from ${url} - this may be expected for optional auth endpoints`);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  userId?: string;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, userId }) =>
  async ({ queryKey }) => {
    try {
      // Get a valid session (with automatic refresh if needed)
      const session = await getValidSession();
      
      const headers: HeadersInit = {};
      
      // Add Authorization header if user is authenticated
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      // Add user ID header if available (legacy support)
      if (userId) {
        headers['X-User-Id'] = userId;
      }
      
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
        headers,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Query to ${queryKey.join("/")} returned 401, returning null as requested`);
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // If getting the session failed but we should return null on 401, 
      // and this looks like an auth error, return null
      if (unauthorizedBehavior === "returnNull" && error instanceof Error) {
        if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
          console.log(`Query to ${queryKey.join("/")} failed with auth error, returning null as requested:`, error.message);
          return null;
        }
      }
      // Re-throw the error for other cases
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
