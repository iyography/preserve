import type { Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';

// Extend Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Initialize Supabase client for server-side JWT verification
// Use VITE_ prefixed environment variables since those are available
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

// For JWT verification, we can use the anon key to create a client that can verify tokens
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Middleware to verify Supabase JWT tokens and extract user information
 * Replaces the insecure x-user-id header dependency
 */
export async function verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Missing authorization header',
        details: 'Please provide a valid Bearer token' 
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid authorization format',
        details: 'Authorization header must start with "Bearer "' 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({ 
        error: 'Missing token',
        details: 'Bearer token is required' 
      });
    }

    // Validate JWT structure before sending to Supabase
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('JWT verification failed: Malformed token - invalid number of segments:', tokenParts.length);
      return res.status(401).json({ 
        error: 'Invalid token format',
        details: 'Please sign in again - token is malformed' 
      });
    }

    // Check for empty or invalid token segments
    if (tokenParts.some(part => !part || part.trim() === '')) {
      console.error('JWT verification failed: Token contains empty segments');
      return res.status(401).json({ 
        error: 'Invalid token format',
        details: 'Please sign in again - token contains empty segments' 
      });
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('JWT verification failed:', error?.message || 'Unknown error', {
        errorCode: error?.status,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: 'Please sign in again' 
      });
    }

    // Add verified user information to request object
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'Unable to verify token' 
    });
  }
}

/**
 * Middleware for optional authentication (doesn't fail if no token provided)
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export async function optionalJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = undefined;
      return next();
    }

    // Try to verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Invalid token, but don't fail - just continue without user info
      req.user = undefined;
    } else {
      req.user = {
        id: user.id,
        email: user.email,
      };
    }

    next();
  } catch (error) {
    console.error('Optional JWT verification error:', error);
    // Don't fail on errors in optional auth - just continue without user info
    req.user = undefined;
    next();
  }
}