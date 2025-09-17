import { createHash } from 'crypto';
import { z } from 'zod';

interface CachedResponse {
  hash: string;
  query: string;
  response: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  createdAt: Date;
  expiresAt: Date;
  hits: number;
  satisfaction: number; // Average user satisfaction 0-1
}

interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  avgSatisfaction: number;
  cacheSizeBytes: number;
  entriesCount: number;
}

export class ResponseCache {
  private static instance: ResponseCache;
  private cache: Map<string, CachedResponse> = new Map();
  private similarityThreshold = 0.85; // Threshold for considering queries similar
  
  // Cache configuration
  private readonly maxCacheSize = 100 * 1024 * 1024; // 100MB
  private readonly maxEntries = 10000;
  private readonly defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
  };

  private constructor() {
    // Schedule periodic cleanup
    this.scheduleCleanup();
  }

  static getInstance(): ResponseCache {
    if (!ResponseCache.instance) {
      ResponseCache.instance = new ResponseCache();
    }
    return ResponseCache.instance;
  }

  /**
   * Schedule periodic cleanup of expired entries
   */
  private scheduleCleanup(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpired(): void {
    const now = new Date();
    const toDelete: string[] = [];
    
    for (const [hash, entry] of Array.from(this.cache.entries())) {
      if (entry.expiresAt < now) {
        toDelete.push(hash);
      }
    }
    
    for (const hash of toDelete) {
      this.cache.delete(hash);
    }
    
    console.log(`Cache cleanup: removed ${toDelete.length} expired entries`);
  }

  /**
   * Generate hash for a query
   */
  private generateHash(query: string, model?: string): string {
    const normalizedQuery = this.normalizeQuery(query);
    const content = model ? `${normalizedQuery}:${model}` : normalizedQuery;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Normalize query for better cache hits
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim();
  }

  /**
   * Calculate similarity between two queries
   */
  private calculateSimilarity(query1: string, query2: string): number {
    const words1 = new Set(query1.toLowerCase().split(/\s+/));
    const words2 = new Set(query2.toLowerCase().split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Get cached response for a query
   */
  async get(
    query: string,
    model?: string,
    allowSimilar: boolean = true
  ): Promise<CachedResponse | null> {
    const hash = this.generateHash(query, model);
    
    // Try exact match first
    let cached = this.cache.get(hash) || null;
    
    if (!cached && allowSimilar) {
      // Try to find similar query
      cached = this.findSimilar(query, model);
    }
    
    if (cached) {
      const now = new Date();
      if (cached.expiresAt > now) {
        // Update hit count
        cached.hits++;
        this.stats.hits++;
        return cached;
      } else {
        // Expired, remove it
        this.cache.delete(hash);
      }
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Find similar cached query
   */
  private findSimilar(query: string, model?: string): CachedResponse | null {
    const normalizedQuery = this.normalizeQuery(query);
    let bestMatch: CachedResponse | null = null;
    let bestSimilarity = 0;
    
    for (const entry of Array.from(this.cache.values())) {
      // Skip if model doesn't match (when specified)
      if (model && entry.model !== model) continue;
      
      const similarity = this.calculateSimilarity(normalizedQuery, entry.query);
      if (similarity > this.similarityThreshold && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }
    
    return bestMatch;
  }

  /**
   * Store response in cache
   */
  async set(
    query: string,
    response: string,
    model: string,
    tokens: { input: number; output: number },
    ttl?: number
  ): Promise<void> {
    // Check cache size limits
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }
    
    const hash = this.generateHash(query, model);
    const now = new Date();
    
    const entry: CachedResponse = {
      hash,
      query: this.normalizeQuery(query),
      response,
      model,
      tokens,
      createdAt: now,
      expiresAt: new Date(now.getTime() + (ttl || this.defaultTTL)),
      hits: 0,
      satisfaction: 1.0, // Default to high satisfaction
    };
    
    this.cache.set(hash, entry);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestEntry: CachedResponse | null = null;
    let oldestHash: string | null = null;
    
    for (const [hash, entry] of Array.from(this.cache.entries())) {
      if (!oldestEntry || entry.hits < oldestEntry.hits) {
        oldestEntry = entry;
        oldestHash = hash;
      }
    }
    
    if (oldestHash) {
      this.cache.delete(oldestHash);
    }
  }

  /**
   * Update satisfaction score for a cached response
   */
  async updateSatisfaction(
    query: string,
    satisfaction: number,
    model?: string
  ): Promise<void> {
    const hash = this.generateHash(query, model);
    const cached = this.cache.get(hash);
    
    if (cached) {
      // Update with weighted average
      const weight = 0.3; // Weight for new satisfaction score
      cached.satisfaction = cached.satisfaction * (1 - weight) + satisfaction * weight;
      
      // If satisfaction is too low, consider removing from cache
      if (cached.satisfaction < 0.3) {
        this.cache.delete(hash);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalBytes = 0;
    let totalSatisfaction = 0;
    let count = 0;
    
    for (const entry of Array.from(this.cache.values())) {
      totalBytes += JSON.stringify(entry).length;
      totalSatisfaction += entry.satisfaction;
      count++;
    }
    
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? this.stats.hits / (this.stats.hits + this.stats.misses)
      : 0;
    
    return {
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: hitRate * 100,
      avgSatisfaction: count > 0 ? totalSatisfaction / count : 0,
      cacheSizeBytes: totalBytes,
      entriesCount: this.cache.size,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Preload common queries into cache
   */
  async preloadCommon(
    commonQueries: Array<{
      query: string;
      response: string;
      model: string;
    }>
  ): Promise<void> {
    for (const item of commonQueries) {
      await this.set(
        item.query,
        item.response,
        item.model,
        { input: 100, output: 200 }, // Estimated tokens
        30 * 24 * 60 * 60 * 1000 // 30 days TTL for preloaded
      );
    }
  }

  /**
   * Export cache for analysis
   */
  exportCache(): Array<{
    query: string;
    model: string;
    hits: number;
    satisfaction: number;
    createdAt: Date;
  }> {
    const entries = [];
    
    for (const entry of Array.from(this.cache.values())) {
      entries.push({
        query: entry.query,
        model: entry.model,
        hits: entry.hits,
        satisfaction: entry.satisfaction,
        createdAt: entry.createdAt,
      });
    }
    
    // Sort by hits descending
    entries.sort((a, b) => b.hits - a.hits);
    
    return entries;
  }

  /**
   * Check if response should be cached based on quality
   */
  shouldCache(
    response: string,
    tokens: { input: number; output: number }
  ): boolean {
    // Don't cache very short responses
    if (response.length < 50) return false;
    
    // Don't cache error messages
    if (response.toLowerCase().includes('error') || 
        response.toLowerCase().includes('failed')) {
      return false;
    }
    
    // Don't cache if tokens are too high (expensive to cache)
    if (tokens.input + tokens.output > 8000) return false;
    
    return true;
  }

  /**
   * Get cache recommendations for a user
   */
  getCacheRecommendations(userId: string): {
    frequentQueries: string[];
    potentialSavings: number;
    recommendation: string;
  } {
    // Find most frequently hit queries
    const frequentQueries: string[] = [];
    let potentialSavings = 0;
    
    const entries = Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 5);
    
    for (const entry of entries) {
      frequentQueries.push(entry.query);
      // Estimate savings (rough calculation)
      potentialSavings += entry.hits * 0.002; // $0.002 per cached response
    }
    
    const recommendation = potentialSavings > 1 
      ? 'Caching is saving you significant costs. Consider upgrading for more cache space.'
      : 'Enable similarity matching for better cache utilization.';
    
    return {
      frequentQueries,
      potentialSavings,
      recommendation,
    };
  }
}

// Export singleton instance
export const responseCache = ResponseCache.getInstance();