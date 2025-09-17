import { z } from 'zod';

interface AbusePattern {
  type: 'repetition' | 'token_stuffing' | 'jailbreak' | 'prompt_injection' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'allow' | 'throttle' | 'truncate' | 'compress' | 'block';
  reason: string;
}

interface RateLimitData {
  count: number;
  resetAt: number;
}

export class AbuseDetector {
  private static instance: AbuseDetector;
  private userRateLimits: Map<string, RateLimitData> = new Map();
  
  // Patterns for detecting jailbreak attempts
  private readonly jailbreakPatterns = [
    /ignore\s+previous\s+instructions?/i,
    /disregard\s+(all\s+)?instructions?/i,
    /forget\s+everything/i,
    /you\s+are\s+now/i,
    /act\s+as\s+(if|though)/i,
    /pretend\s+to\s+be/i,
    /new\s+instructions?\s*:/i,
    /system\s*:\s*you/i,
    /override\s+rules?/i,
    /bypass\s+restrictions?/i,
  ];

  // Patterns for detecting prompt injection
  private readonly injectionPatterns = [
    /\{\{[\s\S]+\}\}/,  // Template injection
    /<script[\s\S]*?>/i,  // Script tags
    /javascript:/i,  // JS protocol
    /on\w+\s*=/i,  // Event handlers
    /eval\s*\(/i,  // Eval attempts
    /\.\.\/|\.\.\\/, // Path traversal
    /DROP\s+TABLE/i, // SQL injection
    /SELECT\s+\*\s+FROM/i,
    /UNION\s+SELECT/i,
    /\x00|\x1a/, // Null bytes
  ];

  private constructor() {}

  static getInstance(): AbuseDetector {
    if (!AbuseDetector.instance) {
      AbuseDetector.instance = new AbuseDetector();
    }
    return AbuseDetector.instance;
  }

  /**
   * Main detection method that checks for all abuse patterns
   */
  async detectAbuse(
    userId: string,
    message: string,
    conversationHistory?: string[]
  ): Promise<AbusePattern | null> {
    // Check rate limiting first (highest priority)
    const rateLimitViolation = this.checkRateLimit(userId);
    if (rateLimitViolation) return rateLimitViolation;

    // Check for repetition
    const repetitionViolation = this.checkRepetition(message, conversationHistory);
    if (repetitionViolation) return repetitionViolation;

    // Check for token stuffing
    const tokenStuffingViolation = this.checkTokenStuffing(message);
    if (tokenStuffingViolation) return tokenStuffingViolation;

    // Check for jailbreak attempts
    const jailbreakViolation = this.checkJailbreak(message);
    if (jailbreakViolation) return jailbreakViolation;

    // Check for prompt injection
    const injectionViolation = this.checkPromptInjection(message);
    if (injectionViolation) return injectionViolation;

    return null; // No abuse detected
  }

  /**
   * Check rate limits (max 10 messages per minute)
   */
  private checkRateLimit(userId: string): AbusePattern | null {
    const now = Date.now();
    const userLimits = this.userRateLimits.get(userId);

    if (!userLimits || userLimits.resetAt < now) {
      // Initialize or reset rate limit
      this.userRateLimits.set(userId, {
        count: 1,
        resetAt: now + 60000, // 1 minute from now
      });
      return null;
    }

    userLimits.count++;
    
    if (userLimits.count > 10) {
      const waitTime = Math.ceil((userLimits.resetAt - now) / 1000);
      return {
        type: 'rate_limit',
        severity: userLimits.count > 20 ? 'critical' : 'high',
        action: userLimits.count > 20 ? 'block' : 'throttle',
        reason: `Rate limit exceeded. Please wait ${waitTime} seconds before sending another message.`,
      };
    }

    return null;
  }

  /**
   * Check for repetition (same text 5+ times in recent history)
   */
  private checkRepetition(
    message: string,
    history?: string[]
  ): AbusePattern | null {
    if (!history || history.length < 5) return null;

    const normalizedMessage = message.toLowerCase().trim();
    const recentMessages = history.slice(-10); // Check last 10 messages
    
    let repetitionCount = 0;
    for (const historyMessage of recentMessages) {
      if (historyMessage.toLowerCase().trim() === normalizedMessage) {
        repetitionCount++;
      }
    }

    if (repetitionCount >= 5) {
      return {
        type: 'repetition',
        severity: 'medium',
        action: 'compress',
        reason: 'Message repeated too many times. Please vary your input.',
      };
    }

    return null;
  }

  /**
   * Check for token stuffing (excessive unicode, special chars)
   */
  private checkTokenStuffing(message: string): AbusePattern | null {
    // Count unicode characters outside basic ASCII
    const unicodeCount = (message.match(/[^\x00-\x7F]/g) || []).length;
    const totalLength = message.length;
    const unicodeRatio = unicodeCount / totalLength;

    // Check for excessive special characters
    const specialChars = (message.match(/[^a-zA-Z0-9\s,.!?;:'"()-]/g) || []).length;
    const specialRatio = specialChars / totalLength;

    // Check for zero-width characters
    const zeroWidthCount = (message.match(/[\u200B-\u200F\u2028-\u202F\u205F-\u206F]/g) || []).length;

    // Check for excessive whitespace
    const whitespaceCount = (message.match(/\s{5,}/g) || []).length;

    if (unicodeRatio > 0.7 || specialRatio > 0.5 || zeroWidthCount > 0 || whitespaceCount > 3) {
      return {
        type: 'token_stuffing',
        severity: zeroWidthCount > 0 ? 'high' : 'medium',
        action: 'truncate',
        reason: 'Message contains excessive special characters or formatting.',
      };
    }

    // Check message length
    if (message.length > 10000) {
      return {
        type: 'token_stuffing',
        severity: 'high',
        action: 'truncate',
        reason: 'Message is too long. Please keep messages under 10,000 characters.',
      };
    }

    return null;
  }

  /**
   * Check for jailbreak attempts
   */
  private checkJailbreak(message: string): AbusePattern | null {
    for (const pattern of this.jailbreakPatterns) {
      if (pattern.test(message)) {
        return {
          type: 'jailbreak',
          severity: 'critical',
          action: 'block',
          reason: 'Message contains prohibited instructions.',
        };
      }
    }

    // Check for suspicious role-playing attempts
    const rolePlayPatterns = [
      /you\s+must\s+(now\s+)?act/i,
      /from\s+now\s+on/i,
      /new\s+persona/i,
    ];

    for (const pattern of rolePlayPatterns) {
      if (pattern.test(message)) {
        return {
          type: 'jailbreak',
          severity: 'medium',
          action: 'truncate',
          reason: 'Role-playing instructions detected.',
        };
      }
    }

    return null;
  }

  /**
   * Check for prompt injection attempts
   */
  private checkPromptInjection(message: string): AbusePattern | null {
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(message)) {
        return {
          type: 'prompt_injection',
          severity: 'critical',
          action: 'block',
          reason: 'Message contains potential security threats.',
        };
      }
    }

    // Check for encoded content that might be malicious
    if (/base64|atob|btoa|eval|Function|constructor/i.test(message)) {
      return {
        type: 'prompt_injection',
        severity: 'high',
        action: 'truncate',
        reason: 'Message contains suspicious encoded content.',
      };
    }

    return null;
  }

  /**
   * Apply the detected abuse pattern's action to the message
   */
  applyAction(message: string, pattern: AbusePattern): string | null {
    switch (pattern.action) {
      case 'block':
        return null; // Completely block the message

      case 'truncate':
        // Truncate to first 500 characters
        return message.substring(0, 500) + '... (truncated for safety)';

      case 'compress':
        // Remove repetitions and compress
        return this.compressMessage(message);

      case 'throttle':
        // Return a rate limit message
        return null; // Let the endpoint handle throttling

      case 'allow':
      default:
        return message;
    }
  }

  /**
   * Compress a message by removing repetitions
   */
  private compressMessage(message: string): string {
    const words = message.split(/\s+/);
    const compressed: string[] = [];
    let lastWord = '';
    let repetitionCount = 0;

    for (const word of words) {
      if (word === lastWord) {
        repetitionCount++;
        if (repetitionCount > 2) continue; // Skip after 2 repetitions
      } else {
        repetitionCount = 0;
      }
      compressed.push(word);
      lastWord = word;
    }

    return compressed.join(' ');
  }

  /**
   * Reset rate limits for a user (for testing or admin purposes)
   */
  resetUserLimits(userId: string): void {
    this.userRateLimits.delete(userId);
  }

  /**
   * Get current rate limit status for a user
   */
  getUserRateLimitStatus(userId: string): {
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const userLimits = this.userRateLimits.get(userId);

    if (!userLimits || userLimits.resetAt < now) {
      return { remaining: 10, resetAt: now + 60000 };
    }

    return {
      remaining: Math.max(0, 10 - userLimits.count),
      resetAt: userLimits.resetAt,
    };
  }
}

// Export singleton instance
export const abuseDetector = AbuseDetector.getInstance();