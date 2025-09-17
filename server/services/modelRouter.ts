import { z } from 'zod';

type QueryType = 'coding' | 'creative' | 'analysis' | 'simple_chat' | 'reasoning' | 'unknown';

interface ModelCapabilities {
  model: string;
  strengths: QueryType[];
  maxTokens: number;
  costTier: 'low' | 'medium' | 'high' | 'premium';
  speed: 'fast' | 'medium' | 'slow';
  reasoning: boolean;
}

interface RoutingDecision {
  model: string;
  reason: string;
  estimatedTokens: number;
  optimized: boolean;
}

export class ModelRouter {
  private static instance: ModelRouter;
  private queryHistory: Map<string, QueryType[]> = new Map();
  
  // Model capabilities matrix
  private readonly models: ModelCapabilities[] = [
    {
      model: 'o1-preview',
      strengths: ['reasoning', 'coding', 'analysis'],
      maxTokens: 128000,
      costTier: 'premium',
      speed: 'slow',
      reasoning: true,
    },
    {
      model: 'o1-mini',
      strengths: ['reasoning', 'coding'],
      maxTokens: 128000,
      costTier: 'high',
      speed: 'medium',
      reasoning: true,
    },
    {
      model: 'gpt-4',
      strengths: ['coding', 'analysis', 'creative'],
      maxTokens: 8192,
      costTier: 'premium',
      speed: 'medium',
      reasoning: false,
    },
    {
      model: 'gpt-4-turbo',
      strengths: ['coding', 'analysis', 'creative'],
      maxTokens: 128000,
      costTier: 'high',
      speed: 'medium',
      reasoning: false,
    },
    {
      model: 'gpt-4o',
      strengths: ['coding', 'creative', 'analysis'],
      maxTokens: 128000,
      costTier: 'medium',
      speed: 'fast',
      reasoning: false,
    },
    {
      model: 'gpt-4o-mini',
      strengths: ['simple_chat', 'creative'],
      maxTokens: 128000,
      costTier: 'low',
      speed: 'fast',
      reasoning: false,
    },
    {
      model: 'gpt-3.5-turbo',
      strengths: ['simple_chat'],
      maxTokens: 16385,
      costTier: 'low',
      speed: 'fast',
      reasoning: false,
    },
  ];

  // Keywords for query classification
  private readonly classificationKeywords = {
    coding: [
      'code', 'function', 'debug', 'error', 'implement', 'algorithm',
      'class', 'method', 'variable', 'syntax', 'program', 'script',
      'api', 'database', 'sql', 'javascript', 'python', 'typescript',
      'fix', 'bug', 'compile', 'runtime', 'package', 'import', 'module',
    ],
    creative: [
      'write', 'story', 'poem', 'creative', 'imagine', 'describe',
      'narrative', 'character', 'plot', 'dialogue', 'scene', 'draft',
      'brainstorm', 'idea', 'concept', 'design', 'art', 'music',
    ],
    analysis: [
      'analyze', 'compare', 'evaluate', 'assess', 'review', 'examine',
      'investigate', 'research', 'study', 'data', 'statistics', 'trend',
      'pattern', 'insight', 'conclusion', 'summary', 'report', 'metrics',
    ],
    reasoning: [
      'solve', 'reason', 'logic', 'proof', 'theorem', 'mathematical',
      'calculate', 'derive', 'deduce', 'infer', 'puzzle', 'problem',
      'step-by-step', 'systematic', 'complex', 'multi-step',
    ],
    simple_chat: [
      'hello', 'hi', 'how', 'what', 'when', 'where', 'who', 'thanks',
      'please', 'help', 'tell', 'explain', 'simple', 'basic', 'quick',
    ],
  };

  private constructor() {}

  static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  /**
   * Main routing method that selects optimal model
   */
  async routeQuery(
    userId: string,
    query: string,
    preferredModel?: string,
    forcedModel?: string,
    conversationContext?: string
  ): Promise<RoutingDecision> {
    // If model is forced (by degradation or user), use it
    if (forcedModel) {
      return {
        model: forcedModel,
        reason: 'Model selected by cost protection or user preference.',
        estimatedTokens: this.estimateTokens(query, conversationContext),
        optimized: false,
      };
    }

    // Classify the query
    const queryType = this.classifyQuery(query);
    
    // Learn from user patterns
    this.updateUserPatterns(userId, queryType);
    
    // Get optimal model based on query type and user history
    const optimalModel = this.selectOptimalModel(
      queryType,
      this.getUserPatterns(userId),
      preferredModel
    );
    
    // Estimate tokens for cost calculation
    const estimatedTokens = this.estimateTokens(query, conversationContext);
    
    return {
      model: optimalModel.model,
      reason: `Optimized for ${queryType} query. ${optimalModel.reason}`,
      estimatedTokens,
      optimized: true,
    };
  }

  /**
   * Classify query type based on content
   */
  private classifyQuery(query: string): QueryType {
    const lowerQuery = query.toLowerCase();
    const scores: Record<QueryType, number> = {
      coding: 0,
      creative: 0,
      analysis: 0,
      reasoning: 0,
      simple_chat: 0,
      unknown: 0,
    };

    // Score based on keyword matches
    for (const [type, keywords] of Object.entries(this.classificationKeywords)) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          scores[type as QueryType] += 1;
        }
      }
    }

    // Check for code blocks
    if (/```[\s\S]*```/.test(query) || /`[^`]+`/.test(query)) {
      scores.coding += 5;
    }

    // Check for mathematical notation
    if (/[∀∃∈∉⊂⊃∩∪]/.test(query) || /\b(theorem|proof|equation)\b/i.test(query)) {
      scores.reasoning += 5;
    }

    // Check query length and complexity
    const wordCount = query.split(/\s+/).length;
    if (wordCount < 10) {
      scores.simple_chat += 2;
    } else if (wordCount > 100) {
      scores.analysis += 2;
    }

    // Find the highest scoring type
    let maxScore = 0;
    let selectedType: QueryType = 'unknown';
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore && type !== 'unknown') {
        maxScore = score;
        selectedType = type as QueryType;
      }
    }

    // Default to simple_chat if no clear classification
    if (maxScore === 0) {
      selectedType = 'simple_chat';
    }

    return selectedType;
  }

  /**
   * Select optimal model based on query type and patterns
   */
  private selectOptimalModel(
    queryType: QueryType,
    userPatterns: QueryType[],
    preferredModel?: string
  ): { model: string; reason: string } {
    // Check if user has a strong pattern
    const mostCommonPattern = this.getMostCommonPattern(userPatterns);
    
    // Find models that are strong in this query type
    const suitableModels = this.models.filter(m => 
      m.strengths.includes(queryType) || 
      (queryType === 'unknown' && m.strengths.includes('simple_chat'))
    );
    
    if (suitableModels.length === 0) {
      // Fallback to gpt-4o-mini for unknown queries
      return {
        model: 'gpt-4o-mini',
        reason: 'Default model for general queries.',
      };
    }

    // Sort by cost efficiency (prefer lower cost tier)
    suitableModels.sort((a, b) => {
      const costOrder = { low: 0, medium: 1, high: 2, premium: 3 };
      return costOrder[a.costTier] - costOrder[b.costTier];
    });

    // Special handling for different query types
    switch (queryType) {
      case 'reasoning':
        // Reasoning tasks need o1 models
        return {
          model: 'o1-mini',
          reason: 'Complex reasoning task detected.',
        };
        
      case 'coding':
        // Coding benefits from better models but not necessarily o1
        if (userPatterns.filter(p => p === 'coding').length > 3) {
          // Frequent coder, give them a better model
          return {
            model: 'gpt-4o',
            reason: 'Optimized for frequent coding tasks.',
          };
        }
        return {
          model: 'gpt-4o-mini',
          reason: 'Efficient model for coding queries.',
        };
        
      case 'creative':
        return {
          model: 'gpt-4o',
          reason: 'Creative tasks benefit from advanced capabilities.',
        };
        
      case 'analysis':
        return {
          model: 'gpt-4o',
          reason: 'Analysis requires strong reasoning capabilities.',
        };
        
      case 'simple_chat':
      default:
        return {
          model: 'gpt-3.5-turbo',
          reason: 'Efficient model for simple conversations.',
        };
    }
  }

  /**
   * Estimate token count for a query
   */
  estimateTokens(query: string, context?: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    const queryTokens = Math.ceil(query.length / 4);
    const contextTokens = context ? Math.ceil(context.length / 4) : 0;
    
    // Add buffer for system prompt and response
    const systemPromptTokens = 150; // Typical system prompt
    const estimatedResponseTokens = Math.min(queryTokens * 2, 2000); // Response typically 2x query, max 2000
    
    return queryTokens + contextTokens + systemPromptTokens + estimatedResponseTokens;
  }

  /**
   * Optimize prompt to reduce tokens
   */
  optimizePrompt(prompt: string, maxTokens: number = 4000): string {
    const estimatedTokens = this.estimateTokens(prompt);
    
    if (estimatedTokens <= maxTokens) {
      return prompt; // No optimization needed
    }
    
    // Remove extra whitespace
    let optimized = prompt.replace(/\s+/g, ' ').trim();
    
    // Truncate if still too long
    if (this.estimateTokens(optimized) > maxTokens) {
      // Keep first 75% of allowed tokens
      const targetLength = Math.floor(maxTokens * 4 * 0.75); // Convert tokens to chars
      optimized = optimized.substring(0, targetLength) + '... (truncated for token limit)';
    }
    
    return optimized;
  }

  /**
   * Update user query patterns for learning
   */
  private updateUserPatterns(userId: string, queryType: QueryType): void {
    const patterns = this.queryHistory.get(userId) || [];
    patterns.push(queryType);
    
    // Keep only last 20 queries for pattern analysis
    if (patterns.length > 20) {
      patterns.shift();
    }
    
    this.queryHistory.set(userId, patterns);
  }

  /**
   * Get user's query patterns
   */
  private getUserPatterns(userId: string): QueryType[] {
    return this.queryHistory.get(userId) || [];
  }

  /**
   * Get most common pattern from user history
   */
  private getMostCommonPattern(patterns: QueryType[]): QueryType | null {
    if (patterns.length === 0) return null;
    
    const counts = patterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<QueryType, number>);
    
    let maxCount = 0;
    let mostCommon: QueryType | null = null;
    
    for (const [pattern, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = pattern as QueryType;
      }
    }
    
    return mostCommon;
  }

  /**
   * Get model recommendations for different scenarios
   */
  getModelRecommendations(): Record<string, { model: string; useCase: string }> {
    return {
      budget: {
        model: 'gpt-3.5-turbo',
        useCase: 'Best for high-volume, simple queries with minimal cost',
      },
      balanced: {
        model: 'gpt-4o-mini',
        useCase: 'Good balance of capability and cost for most tasks',
      },
      quality: {
        model: 'gpt-4o',
        useCase: 'High quality for coding, creative, and analysis tasks',
      },
      reasoning: {
        model: 'o1-mini',
        useCase: 'Best for complex reasoning and problem-solving',
      },
      premium: {
        model: 'o1-preview',
        useCase: 'Top-tier reasoning for the most challenging tasks',
      },
    };
  }

  /**
   * Check if a model supports a specific feature
   */
  modelSupports(model: string, feature: 'reasoning' | 'vision' | 'functions'): boolean {
    const modelCaps = this.models.find(m => m.model === model);
    
    if (!modelCaps) return false;
    
    switch (feature) {
      case 'reasoning':
        return modelCaps.reasoning;
      case 'vision':
        return model.includes('gpt-4') && !model.includes('3.5');
      case 'functions':
        return !model.includes('o1'); // o1 models don't support functions
      default:
        return false;
    }
  }
}

// Export singleton instance
export const modelRouter = ModelRouter.getInstance();