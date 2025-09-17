import { z } from 'zod';

interface CostLimits {
  MAX_COST_PER_REQUEST: number;
  MAX_DAILY_COST_FREE: number;
  MAX_DAILY_COST_PAID: number;
}

interface UserUsage {
  dailyCost: number;
  lastResetDate: string;
  requests: number;
  blocked: boolean;
  tier: 'free' | 'paid';
}

interface DegradationStage {
  threshold: number;
  action: 'prefer_cache' | 'force_mini_model' | 'summary_only' | 'cache_only' | 'block';
  message: string;
}

export class CostGuardian {
  private static instance: CostGuardian;
  private userUsage: Map<string, UserUsage> = new Map();
  
  // Cost limits
  private readonly limits: CostLimits = {
    MAX_COST_PER_REQUEST: 0.10, // $0.10 per request
    MAX_DAILY_COST_FREE: 0.50,   // $0.50 per day for free users
    MAX_DAILY_COST_PAID: 5.00,   // $5.00 per day for paid users
  };

  // Model costs per 1k tokens (approximate)
  private readonly modelCosts = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'o1-preview': { input: 0.015, output: 0.06 },
    'o1-mini': { input: 0.003, output: 0.012 },
  };

  // Progressive degradation stages
  private readonly degradationStages: DegradationStage[] = [
    { 
      threshold: 0.5, 
      action: 'prefer_cache',
      message: 'Using cached responses when available to conserve resources.'
    },
    { 
      threshold: 0.7, 
      action: 'force_mini_model',
      message: 'Switching to efficient model to maintain service availability.'
    },
    { 
      threshold: 0.85, 
      action: 'summary_only',
      message: 'Providing summarized responses due to high usage.'
    },
    { 
      threshold: 0.95, 
      action: 'cache_only',
      message: 'Only cached responses available. Daily limit nearly reached.'
    },
    { 
      threshold: 1.0, 
      action: 'block',
      message: 'Daily usage limit reached. Please upgrade or try again tomorrow.'
    },
  ];

  private constructor() {
    // Reset usage daily
    this.scheduleDailyReset();
  }

  static getInstance(): CostGuardian {
    if (!CostGuardian.instance) {
      CostGuardian.instance = new CostGuardian();
    }
    return CostGuardian.instance;
  }

  /**
   * Schedule daily usage reset
   */
  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyUsage();
      this.scheduleDailyReset(); // Schedule next reset
    }, msUntilReset);
  }

  /**
   * Reset daily usage for all users
   */
  private resetDailyUsage(): void {
    const today = new Date().toISOString().split('T')[0];
    
    for (const [userId, usage] of Array.from(this.userUsage.entries())) {
      if (usage.lastResetDate !== today) {
        usage.dailyCost = 0;
        usage.requests = 0;
        usage.blocked = false;
        usage.lastResetDate = today;
      }
    }
  }

  /**
   * Get or create user usage record
   */
  private getUserUsage(userId: string, tier: 'free' | 'paid' = 'free'): UserUsage {
    const today = new Date().toISOString().split('T')[0];
    let usage = this.userUsage.get(userId);
    
    if (!usage || usage.lastResetDate !== today) {
      usage = {
        dailyCost: 0,
        lastResetDate: today,
        requests: 0,
        blocked: false,
        tier,
      };
      this.userUsage.set(userId, usage);
    }
    
    return usage;
  }

  /**
   * Check if request should be allowed (circuit breaker)
   */
  async checkRequest(
    userId: string,
    estimatedTokens: number,
    model: string = 'gpt-4o-mini',
    userTier: 'free' | 'paid' = 'free'
  ): Promise<{
    allowed: boolean;
    reason?: string;
    suggestedAction?: DegradationStage['action'];
    remainingBudget: number;
  }> {
    const usage = this.getUserUsage(userId, userTier);
    
    // Check if user is blocked
    if (usage.blocked) {
      return {
        allowed: false,
        reason: 'Daily usage limit exceeded. Please try again tomorrow.',
        remainingBudget: 0,
      };
    }

    // Calculate estimated cost
    const estimatedCost = this.estimateCost(model, estimatedTokens);
    
    // Check per-request limit
    if (estimatedCost > this.limits.MAX_COST_PER_REQUEST) {
      return {
        allowed: false,
        reason: `Request too expensive. Estimated cost: $${estimatedCost.toFixed(4)}`,
        remainingBudget: this.getRemainingBudget(usage),
      };
    }

    // Check daily limit
    const dailyLimit = usage.tier === 'paid' 
      ? this.limits.MAX_DAILY_COST_PAID 
      : this.limits.MAX_DAILY_COST_FREE;
    
    if (usage.dailyCost + estimatedCost > dailyLimit) {
      usage.blocked = true;
      return {
        allowed: false,
        reason: 'Would exceed daily usage limit.',
        remainingBudget: 0,
      };
    }

    // Get degradation stage
    const usagePercentage = usage.dailyCost / dailyLimit;
    const degradation = this.getDegradationStage(usagePercentage);
    
    return {
      allowed: true,
      suggestedAction: degradation?.action,
      remainingBudget: this.getRemainingBudget(usage),
    };
  }

  /**
   * Record actual usage after request completion
   */
  async recordUsage(
    userId: string,
    actualTokens: {
      input: number;
      output: number;
    },
    model: string = 'gpt-4o-mini'
  ): Promise<void> {
    const usage = this.getUserUsage(userId);
    const cost = this.calculateActualCost(model, actualTokens);
    
    usage.dailyCost += cost;
    usage.requests += 1;
    
    // Check if we should block future requests
    const dailyLimit = usage.tier === 'paid' 
      ? this.limits.MAX_DAILY_COST_PAID 
      : this.limits.MAX_DAILY_COST_FREE;
    
    if (usage.dailyCost >= dailyLimit) {
      usage.blocked = true;
    }
  }

  /**
   * Estimate cost for a request
   */
  private estimateCost(model: string, estimatedTokens: number): number {
    const modelCost = this.modelCosts[model as keyof typeof this.modelCosts] || this.modelCosts['gpt-4o-mini'];
    
    // Assume 70% input, 30% output for estimation
    const inputTokens = estimatedTokens * 0.7;
    const outputTokens = estimatedTokens * 0.3;
    
    const cost = (inputTokens / 1000) * modelCost.input + 
                 (outputTokens / 1000) * modelCost.output;
    
    return cost;
  }

  /**
   * Calculate actual cost after completion
   */
  private calculateActualCost(
    model: string,
    tokens: { input: number; output: number }
  ): number {
    const modelCost = this.modelCosts[model as keyof typeof this.modelCosts] || this.modelCosts['gpt-4o-mini'];
    
    const cost = (tokens.input / 1000) * modelCost.input + 
                 (tokens.output / 1000) * modelCost.output;
    
    return cost;
  }

  /**
   * Get degradation stage based on usage percentage
   */
  private getDegradationStage(usagePercentage: number): DegradationStage | null {
    for (const stage of this.degradationStages) {
      if (usagePercentage >= stage.threshold && usagePercentage < 1.0) {
        return stage;
      }
    }
    
    if (usagePercentage >= 1.0) {
      return this.degradationStages[this.degradationStages.length - 1];
    }
    
    return null;
  }

  /**
   * Get remaining budget for user
   */
  private getRemainingBudget(usage: UserUsage): number {
    const dailyLimit = usage.tier === 'paid' 
      ? this.limits.MAX_DAILY_COST_PAID 
      : this.limits.MAX_DAILY_COST_FREE;
    
    return Math.max(0, dailyLimit - usage.dailyCost);
  }

  /**
   * Get user's current usage statistics
   */
  getUserStats(userId: string, tier: 'free' | 'paid' = 'free'): {
    dailyCost: number;
    dailyLimit: number;
    usagePercentage: number;
    requests: number;
    remainingBudget: number;
    degradationStage: DegradationStage['action'] | null;
    isBlocked: boolean;
  } {
    const usage = this.getUserUsage(userId, tier);
    const dailyLimit = tier === 'paid' 
      ? this.limits.MAX_DAILY_COST_PAID 
      : this.limits.MAX_DAILY_COST_FREE;
    
    const usagePercentage = usage.dailyCost / dailyLimit;
    const degradation = this.getDegradationStage(usagePercentage);
    
    return {
      dailyCost: usage.dailyCost,
      dailyLimit,
      usagePercentage: usagePercentage * 100,
      requests: usage.requests,
      remainingBudget: this.getRemainingBudget(usage),
      degradationStage: degradation?.action || null,
      isBlocked: usage.blocked,
    };
  }

  /**
   * Get recommended model based on budget and degradation
   */
  getRecommendedModel(
    userId: string,
    preferredModel: string = 'gpt-4o',
    tier: 'free' | 'paid' = 'free'
  ): {
    model: string;
    reason: string;
  } {
    const usage = this.getUserUsage(userId, tier);
    const dailyLimit = tier === 'paid' 
      ? this.limits.MAX_DAILY_COST_PAID 
      : this.limits.MAX_DAILY_COST_FREE;
    
    const usagePercentage = usage.dailyCost / dailyLimit;
    const degradation = this.getDegradationStage(usagePercentage);
    
    // Apply degradation rules
    if (degradation) {
      switch (degradation.action) {
        case 'force_mini_model':
        case 'summary_only':
        case 'cache_only':
          return {
            model: 'gpt-4o-mini',
            reason: degradation.message,
          };
        
        case 'block':
          return {
            model: 'none',
            reason: degradation.message,
          };
        
        case 'prefer_cache':
        default:
          // Allow preferred model but suggest caching
          return {
            model: preferredModel,
            reason: degradation.message,
          };
      }
    }
    
    // No degradation, use preferred model
    return {
      model: preferredModel,
      reason: 'Operating within normal limits.',
    };
  }

  /**
   * Emergency cost reset (admin only)
   */
  emergencyReset(userId: string): void {
    const usage = this.userUsage.get(userId);
    if (usage) {
      usage.dailyCost = 0;
      usage.requests = 0;
      usage.blocked = false;
    }
  }

  /**
   * Upgrade user tier
   */
  upgradeUser(userId: string): void {
    const usage = this.getUserUsage(userId);
    usage.tier = 'paid';
    // Reset block if they were blocked as free user
    if (usage.blocked && usage.dailyCost < this.limits.MAX_DAILY_COST_PAID) {
      usage.blocked = false;
    }
  }
}

// Export singleton instance
export const costGuardian = CostGuardian.getInstance();