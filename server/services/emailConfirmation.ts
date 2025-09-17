import { randomUUID } from "crypto";

interface ConfirmationToken {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface RateLimitEntry {
  email: string;
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
}

/**
 * In-memory storage for email confirmation tokens
 * For production, this should be replaced with Redis or database storage
 */
class EmailConfirmationService {
  private tokens = new Map<string, ConfirmationToken>();
  private rateLimits = new Map<string, RateLimitEntry>();
  
  // Security constants
  private readonly MAX_ATTEMPTS_PER_HOUR = 10; // Temporarily increased for testing
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private readonly TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Validate email format with basic security checks
   */
  private validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    // Sanitize email
    email = email.toLowerCase().trim();
    
    if (email.length > 320) { // RFC 5321 limit
      return { valid: false, error: 'Email too long' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }

  /**
   * Check and update rate limiting for an email address
   */
  private checkRateLimit(email: string): { allowed: boolean; waitTime?: number } {
    const now = new Date();
    const sanitizedEmail = email.toLowerCase().trim();
    const rateLimitEntry = this.rateLimits.get(sanitizedEmail);

    if (!rateLimitEntry) {
      // First request - allow and record
      this.rateLimits.set(sanitizedEmail, {
        email: sanitizedEmail,
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return { allowed: true };
    }

    // Check if rate limit window has expired
    const windowExpired = now.getTime() - rateLimitEntry.firstAttempt.getTime() > this.RATE_LIMIT_WINDOW_MS;
    
    if (windowExpired) {
      // Reset the rate limit window
      this.rateLimits.set(sanitizedEmail, {
        email: sanitizedEmail,
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return { allowed: true };
    }

    // Check if within rate limit
    if (rateLimitEntry.attempts >= this.MAX_ATTEMPTS_PER_HOUR) {
      const remainingTime = this.RATE_LIMIT_WINDOW_MS - (now.getTime() - rateLimitEntry.firstAttempt.getTime());
      const waitMinutes = Math.ceil(remainingTime / (1000 * 60));
      return { allowed: false, waitTime: waitMinutes };
    }

    // Increment attempts
    rateLimitEntry.attempts++;
    rateLimitEntry.lastAttempt = now;
    this.rateLimits.set(sanitizedEmail, rateLimitEntry);
    
    return { allowed: true };
  }

  /**
   * Generate a new confirmation token for an email address
   */
  generateToken(email: string): { success: boolean; token?: string; error?: string } {
    // Validate email format
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: 'Invalid request' }; // Generic error to prevent enumeration
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(sanitizedEmail);
    if (!rateLimitCheck.allowed) {
      return { 
        success: false, 
        error: `Too many requests. Please wait ${rateLimitCheck.waitTime} minutes before trying again.` 
      };
    }

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MS);
    
    this.tokens.set(token, {
      email: sanitizedEmail,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    return { success: true, token };
  }

  /**
   * Verify and consume a confirmation token
   */
  verifyToken(token: string): { valid: boolean; email?: string; error?: string } {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return { valid: false, error: 'Invalid confirmation token' };
    }

    if (new Date() > tokenData.expiresAt) {
      this.tokens.delete(token);
      return { valid: false, error: 'Confirmation token has expired' };
    }

    const email = tokenData.email;
    
    // Remove the token after successful verification (one-time use)
    this.tokens.delete(token);

    return { valid: true, email };
  }

  /**
   * Check if an email has a pending confirmation token
   * Returns generic response to prevent email enumeration
   */
  hasPendingToken(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const now = new Date();
    
    let hasPending = false;
    this.tokens.forEach((tokenData) => {
      if (tokenData.email === sanitizedEmail && now <= tokenData.expiresAt) {
        hasPending = true;
      }
    });
    
    return hasPending;
  }

  /**
   * Clean up expired tokens and rate limits to prevent memory leaks
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    const expiredTokens: string[] = [];
    const expiredRateLimits: string[] = [];
    
    // Clean up expired tokens
    this.tokens.forEach((tokenData, token) => {
      if (now > tokenData.expiresAt) {
        expiredTokens.push(token);
      }
    });
    
    expiredTokens.forEach(token => this.tokens.delete(token));

    // Clean up expired rate limits
    this.rateLimits.forEach((rateLimitData, email) => {
      const entryAge = now.getTime() - rateLimitData.firstAttempt.getTime();
      if (entryAge > this.RATE_LIMIT_WINDOW_MS * 2) { // Keep for 2x window to prevent reset abuse
        expiredRateLimits.push(email);
      }
    });

    expiredRateLimits.forEach(email => this.rateLimits.delete(email));
  }

  /**
   * Get token statistics (for debugging/monitoring)
   */
  getStats(): { totalTokens: number; expiredTokens: number } {
    const now = new Date();
    let totalTokens = this.tokens.size;
    let expiredTokens = 0;

    this.tokens.forEach((tokenData) => {
      if (now > tokenData.expiresAt) {
        expiredTokens++;
      }
    });

    return { totalTokens, expiredTokens };
  }
  
  /**
   * Reset rate limits for testing (development only)
   */
  public resetRateLimits() {
    console.log('Resetting all rate limits for testing...');
    this.rateLimits.clear();
    this.tokens.clear();
  }
}

// Export singleton instance
export const emailConfirmationService = new EmailConfirmationService();