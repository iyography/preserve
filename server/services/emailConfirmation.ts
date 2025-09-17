import { randomUUID } from "crypto";

interface ConfirmationToken {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * In-memory storage for email confirmation tokens
 * For production, this should be replaced with Redis or database storage
 */
class EmailConfirmationService {
  private tokens = new Map<string, ConfirmationToken>();

  /**
   * Generate a new confirmation token for an email address
   */
  generateToken(email: string): string {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.tokens.set(token, {
      email,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return token;
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
   */
  hasPendingToken(email: string): boolean {
    let hasPending = false;
    this.tokens.forEach((tokenData) => {
      if (tokenData.email === email && new Date() <= tokenData.expiresAt) {
        hasPending = true;
      }
    });
    return hasPending;
  }

  /**
   * Clean up expired tokens to prevent memory leaks
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    const expiredTokens: string[] = [];
    
    this.tokens.forEach((tokenData, token) => {
      if (now > tokenData.expiresAt) {
        expiredTokens.push(token);
      }
    });
    
    expiredTokens.forEach(token => this.tokens.delete(token));
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
}

// Export singleton instance
export const emailConfirmationService = new EmailConfirmationService();