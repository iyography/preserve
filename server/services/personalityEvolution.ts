import type { Persona, PatternMetrics, Feedback } from "@shared/schema";
import { storage } from "../storage";

interface EvolutionState {
  personaId: string;
  evolutionStage: 'initial' | 'learning' | 'adapted' | 'mature';
  adaptationScore: number; // 0-1 score of how well adapted the persona is
  lastEvolution: Date;
  evolutionHistory: EvolutionSnapshot[];
}

interface EvolutionSnapshot {
  timestamp: Date;
  changes: {
    category: string;
    before: any;
    after: any;
    reason: string;
  }[];
  triggerEvent: string;
  confidenceScore: number;
}

interface PersonalityAdjustments {
  communicationStyle?: {
    formality: number; // -1 (very casual) to 1 (very formal)
    expressiveness: number; // -1 (reserved) to 1 (expressive)
    directness: number; // -1 (indirect) to 1 (direct)
    humor: number; // 0 (no humor) to 1 (lots of humor)
  };
  topicPreferences?: {
    preferred: string[];
    avoided: string[];
    topicWeights: Map<string, number>; // Topic to weight (0-1)
  };
  emotionalResponses?: {
    empathyLevel: number; // 0 (low) to 1 (high)
    supportStyle: 'listening' | 'advice' | 'validation' | 'distraction';
    emotionalMirroring: boolean;
    responseWarmth: number; // 0 (neutral) to 1 (warm)
  };
  conversationFlow?: {
    preferredMessageLength: number;
    questionFrequency: number; // 0 (few questions) to 1 (many questions)
    initiativeLevel: number; // 0 (passive) to 1 (proactive)
    responseSpeed: 'immediate' | 'thoughtful' | 'varied';
  };
  vocabularyStyle?: {
    complexity: number; // 0 (simple) to 1 (complex)
    specialPhrases: string[];
    avoidedPhrases: string[];
    preferredExpressions: Map<string, string>; // Original to preferred
  };
}

export class PersonalityEvolution {
  private static instance: PersonalityEvolution;
  private evolutionStates: Map<string, EvolutionState> = new Map();
  private adjustmentCache: Map<string, PersonalityAdjustments> = new Map();
  
  private constructor() {}
  
  static getInstance(): PersonalityEvolution {
    if (!PersonalityEvolution.instance) {
      PersonalityEvolution.instance = new PersonalityEvolution();
    }
    return PersonalityEvolution.instance;
  }
  
  /**
   * Analyze patterns and generate personality adjustments
   */
  async evolvePersonality(
    persona: Persona,
    patterns: PatternMetrics[],
    feedback: Feedback[],
    userId: string
  ): Promise<PersonalityAdjustments> {
    const cacheKey = `${persona.id}_${Date.now()}`;
    
    // Get or initialize evolution state
    let evolutionState = this.evolutionStates.get(persona.id) || {
      personaId: persona.id,
      evolutionStage: 'initial',
      adaptationScore: 0,
      lastEvolution: new Date(),
      evolutionHistory: [],
    };
    
    const adjustments: PersonalityAdjustments = {
      communicationStyle: this.evolveCommunicationStyle(patterns, feedback),
      topicPreferences: this.evolveTopicPreferences(patterns, feedback),
      emotionalResponses: this.evolveEmotionalResponses(patterns, feedback),
      conversationFlow: this.evolveConversationFlow(patterns),
      vocabularyStyle: this.evolveVocabularyStyle(patterns, feedback),
    };
    
    // Calculate adaptation score based on feedback and pattern confidence
    const adaptationScore = this.calculateAdaptationScore(patterns, feedback);
    
    // Determine evolution stage
    const evolutionStage = this.determineEvolutionStage(adaptationScore, patterns.length);
    
    // Create evolution snapshot if significant changes detected
    const snapshot = this.createEvolutionSnapshot(evolutionState, adjustments, patterns);
    if (snapshot.changes.length > 0) {
      evolutionState.evolutionHistory.push(snapshot);
    }
    
    // Update evolution state
    evolutionState.adaptationScore = adaptationScore;
    evolutionState.evolutionStage = evolutionStage;
    evolutionState.lastEvolution = new Date();
    
    // Store updated state
    this.evolutionStates.set(persona.id, evolutionState);
    this.adjustmentCache.set(cacheKey, adjustments);
    
    // Store evolution metrics
    await this.storeEvolutionMetrics(persona.id, evolutionState, adjustments, userId);
    
    return adjustments;
  }
  
  private evolveCommunicationStyle(
    patterns: PatternMetrics[],
    feedback: Feedback[]
  ): PersonalityAdjustments['communicationStyle'] {
    // Analyze communication style patterns
    const stylePattern = patterns.find(p => p.metric === 'communication_style');
    const sentimentPattern = patterns.find(p => p.metric === 'sentiment_analysis');
    
    let formality = 0;
    let expressiveness = 0;
    let directness = 0;
    let humor = 0;
    
    if (stylePattern?.value) {
      const style = stylePattern.value as any;
      
      // Adjust formality based on user's style
      if (style.formality === 'formal') formality = 0.7;
      else if (style.formality === 'casual') formality = -0.7;
      
      // Adjust expressiveness
      if (style.expressiveness === 'expressive') expressiveness = 0.7;
      else if (style.expressiveness === 'reserved') expressiveness = -0.5;
      
      // Adjust directness
      if (style.directness === 'direct') directness = 0.6;
      else if (style.directness === 'indirect') directness = -0.6;
      
      // Adjust humor based on positive feedback
      if (style.humor === true) {
        humor = 0.5;
      }
    }
    
    // Adjust based on sentiment feedback
    if (sentimentPattern?.value) {
      const sentiment = sentimentPattern.value as any;
      if (sentiment.overall === 'positive') {
        expressiveness += 0.2;
        humor += 0.1;
      } else if (sentiment.overall === 'negative') {
        expressiveness -= 0.1;
        formality += 0.1;
      }
    }
    
    // Adjust based on direct feedback
    const positiveFeedback = feedback.filter(f => 
      f.kind === 'thumbs_up' || 
      (f.kind === 'rating' && (f.payload as any)?.rating >= 4)
    );
    
    if (positiveFeedback.length > feedback.length * 0.7) {
      // Current style is working well, amplify characteristics slightly
      expressiveness *= 1.1;
      humor *= 1.1;
    }
    
    return {
      formality: Math.max(-1, Math.min(1, formality)),
      expressiveness: Math.max(-1, Math.min(1, expressiveness)),
      directness: Math.max(-1, Math.min(1, directness)),
      humor: Math.max(0, Math.min(1, humor)),
    };
  }
  
  private evolveTopicPreferences(
    patterns: PatternMetrics[],
    feedback: Feedback[]
  ): PersonalityAdjustments['topicPreferences'] {
    const topicPattern = patterns.find(p => p.metric === 'topic_preferences');
    const flowPattern = patterns.find(p => p.metric === 'conversation_flow');
    
    const preferred: string[] = [];
    const avoided: string[] = [];
    const topicWeights = new Map<string, number>();
    
    if (topicPattern?.value) {
      const topics = topicPattern.value as any[];
      
      // Identify preferred topics (high frequency with positive sentiment)
      topics.forEach(topic => {
        if (topic.frequency > 3 && topic.sentiment === 'positive') {
          preferred.push(topic.topic);
          topicWeights.set(topic.topic, 0.8);
        } else if (topic.frequency > 5 && topic.sentiment === 'neutral') {
          preferred.push(topic.topic);
          topicWeights.set(topic.topic, 0.6);
        } else if (topic.sentiment === 'negative' && topic.frequency > 2) {
          avoided.push(topic.topic);
          topicWeights.set(topic.topic, 0.2);
        } else {
          topicWeights.set(topic.topic, 0.5);
        }
      });
    }
    
    if (flowPattern?.value) {
      const flow = flowPattern.value as any;
      if (flow.preferredTopics) {
        preferred.push(...flow.preferredTopics);
      }
      if (flow.avoidedTopics) {
        avoided.push(...flow.avoidedTopics);
      }
    }
    
    return {
      preferred: Array.from(new Set(preferred)), // Remove duplicates
      avoided: Array.from(new Set(avoided)),
      topicWeights,
    };
  }
  
  private evolveEmotionalResponses(
    patterns: PatternMetrics[],
    feedback: Feedback[]
  ): PersonalityAdjustments['emotionalResponses'] {
    const emotionalPattern = patterns.find(p => p.metric === 'emotional_patterns');
    const sentimentPattern = patterns.find(p => p.metric === 'sentiment_analysis');
    
    let empathyLevel = 0.6; // Default moderate empathy
    let supportStyle: 'listening' | 'advice' | 'validation' | 'distraction' = 'listening';
    let emotionalMirroring = false;
    let responseWarmth = 0.5;
    
    if (emotionalPattern?.value) {
      const emotional = emotionalPattern.value as any;
      
      // Increase empathy if user needs support
      if (emotional.needsSupport) {
        empathyLevel = 0.8;
        responseWarmth = 0.7;
      }
      
      // Adapt support style based on what user needs
      if (emotional.supportType) {
        supportStyle = emotional.supportType;
      }
      
      // Enable emotional mirroring for certain emotional states
      if (['sad', 'anxious', 'excited'].includes(emotional.current)) {
        emotionalMirroring = true;
      }
    }
    
    // Adjust warmth based on overall sentiment
    if (sentimentPattern?.value) {
      const sentiment = sentimentPattern.value as any;
      if (sentiment.overall === 'positive') {
        responseWarmth = Math.min(1, responseWarmth + 0.2);
      } else if (sentiment.overall === 'negative') {
        empathyLevel = Math.min(1, empathyLevel + 0.1);
        responseWarmth = Math.min(1, responseWarmth + 0.1);
      }
    }
    
    // Learn from feedback about emotional responses
    const emotionalFeedback = feedback.filter(f => 
      f.payload && typeof f.payload === 'object' && 'emotional_response' in f.payload
    );
    
    if (emotionalFeedback.length > 0) {
      const positiveFeedback = emotionalFeedback.filter(f => 
        f.kind === 'thumbs_up' || 
        (f.kind === 'rating' && (f.payload as any)?.rating >= 4)
      );
      
      if (positiveFeedback.length > emotionalFeedback.length * 0.6) {
        // Current emotional style is working
        empathyLevel = Math.min(1, empathyLevel * 1.1);
      }
    }
    
    return {
      empathyLevel: Math.max(0, Math.min(1, empathyLevel)),
      supportStyle,
      emotionalMirroring,
      responseWarmth: Math.max(0, Math.min(1, responseWarmth)),
    };
  }
  
  private evolveConversationFlow(
    patterns: PatternMetrics[]
  ): PersonalityAdjustments['conversationFlow'] {
    const flowPattern = patterns.find(p => p.metric === 'conversation_flow');
    const verbosityPattern = patterns.find(p => p.metric === 'verbosity_preferences');
    
    let preferredMessageLength = 100; // Default medium length
    let questionFrequency = 0.3; // Default moderate questions
    let initiativeLevel = 0.5; // Default balanced
    let responseSpeed: 'immediate' | 'thoughtful' | 'varied' = 'thoughtful';
    
    if (verbosityPattern?.value) {
      const verbosity = verbosityPattern.value as any;
      preferredMessageLength = verbosity.preferredLength || verbosity.avgMessageLength || 100;
    }
    
    if (flowPattern?.value) {
      const flow = flowPattern.value as any;
      
      // Adapt question frequency based on user's style
      questionFrequency = flow.questionRatio || 0.3;
      
      // Adjust initiative based on conversation starters
      if (flow.conversationStarters && flow.conversationStarters.length > 3) {
        initiativeLevel = 0.7; // User likes when persona takes initiative
      }
      
      // Determine response speed preference
      if (flow.responseTime && Array.isArray(flow.responseTime)) {
        const avgResponseTime = flow.responseTime.reduce((a: number, b: number) => a + b, 0) / flow.responseTime.length;
        if (avgResponseTime < 5000) {
          responseSpeed = 'immediate';
        } else if (avgResponseTime > 15000) {
          responseSpeed = 'varied';
        }
      }
    }
    
    return {
      preferredMessageLength: Math.max(20, Math.min(500, preferredMessageLength)),
      questionFrequency: Math.max(0, Math.min(1, questionFrequency)),
      initiativeLevel: Math.max(0, Math.min(1, initiativeLevel)),
      responseSpeed,
    };
  }
  
  private evolveVocabularyStyle(
    patterns: PatternMetrics[],
    feedback: Feedback[]
  ): PersonalityAdjustments['vocabularyStyle'] {
    const stylePattern = patterns.find(p => p.metric === 'communication_style');
    
    let complexity = 0.5; // Default medium complexity
    const specialPhrases: string[] = [];
    const avoidedPhrases: string[] = [];
    const preferredExpressions = new Map<string, string>();
    
    // Learn from negative feedback about specific phrases
    const phraseFeedback = feedback.filter(f => 
      f.kind === 'thumbs_down' && 
      f.payload && 
      typeof f.payload === 'object' && 
      'phrase' in f.payload
    );
    
    phraseFeedback.forEach(f => {
      const phrase = (f.payload as any).phrase;
      if (phrase) {
        avoidedPhrases.push(phrase);
      }
    });
    
    // Learn special phrases from positive interactions
    const positiveFeedback = feedback.filter(f => 
      f.kind === 'thumbs_up' && 
      f.payload && 
      typeof f.payload === 'object' && 
      'phrase' in f.payload
    );
    
    positiveFeedback.forEach(f => {
      const phrase = (f.payload as any).phrase;
      if (phrase) {
        specialPhrases.push(phrase);
      }
    });
    
    // Adjust complexity based on communication style
    if (stylePattern?.value) {
      const style = stylePattern.value as any;
      if (style.formality === 'formal') {
        complexity = 0.7;
      } else if (style.formality === 'casual') {
        complexity = 0.3;
      }
    }
    
    // Common replacements for more natural conversation
    preferredExpressions.set("I don't remember", "I'm not sure about that");
    preferredExpressions.set("tell me what's happening", "how are things going");
    preferredExpressions.set("our connection", "our relationship");
    
    return {
      complexity: Math.max(0, Math.min(1, complexity)),
      specialPhrases: Array.from(new Set(specialPhrases)),
      avoidedPhrases: Array.from(new Set(avoidedPhrases)),
      preferredExpressions,
    };
  }
  
  private calculateAdaptationScore(
    patterns: PatternMetrics[],
    feedback: Feedback[]
  ): number {
    let score = 0;
    let weights = 0;
    
    // Weight pattern confidence
    patterns.forEach(pattern => {
      const patternValue = pattern.value as any;
      if (patternValue?.learningMetrics?.patternConfidence) {
        score += patternValue.learningMetrics.patternConfidence * 0.3;
        weights += 0.3;
      }
    });
    
    // Weight positive feedback ratio
    if (feedback.length > 0) {
      const positiveFeedback = feedback.filter(f => 
        f.kind === 'thumbs_up' || 
        (f.kind === 'rating' && (f.payload as any)?.rating >= 4)
      ).length;
      
      const feedbackRatio = positiveFeedback / feedback.length;
      score += feedbackRatio * 0.5;
      weights += 0.5;
    }
    
    // Weight sample size (more data = better adaptation)
    const totalSamples = patterns.reduce((sum, p) => {
      const value = p.value as any;
      return sum + (value?.learningMetrics?.sampleSize || 0);
    }, 0);
    
    if (totalSamples > 100) {
      score += 0.2;
      weights += 0.2;
    } else if (totalSamples > 50) {
      score += 0.1;
      weights += 0.2;
    } else {
      weights += 0.2;
    }
    
    return weights > 0 ? score / weights : 0;
  }
  
  private determineEvolutionStage(
    adaptationScore: number,
    patternCount: number
  ): EvolutionState['evolutionStage'] {
    if (patternCount < 3 || adaptationScore < 0.2) {
      return 'initial';
    } else if (adaptationScore < 0.5) {
      return 'learning';
    } else if (adaptationScore < 0.8) {
      return 'adapted';
    } else {
      return 'mature';
    }
  }
  
  private createEvolutionSnapshot(
    currentState: EvolutionState,
    adjustments: PersonalityAdjustments,
    patterns: PatternMetrics[]
  ): EvolutionSnapshot {
    const changes: EvolutionSnapshot['changes'] = [];
    
    // Compare with previous adjustments if available
    const lastSnapshot = currentState.evolutionHistory[currentState.evolutionHistory.length - 1];
    
    // Track significant changes in communication style
    if (adjustments.communicationStyle && 
        (!lastSnapshot || JSON.stringify(adjustments.communicationStyle) !== 
         JSON.stringify(lastSnapshot.changes.find(c => c.category === 'communicationStyle')?.after))) {
      changes.push({
        category: 'communicationStyle',
        before: lastSnapshot?.changes.find(c => c.category === 'communicationStyle')?.after || null,
        after: adjustments.communicationStyle,
        reason: 'Adapted based on conversation patterns and feedback',
      });
    }
    
    // Track topic preference changes
    if (adjustments.topicPreferences?.preferred && adjustments.topicPreferences.preferred.length > 0) {
      changes.push({
        category: 'topicPreferences',
        before: lastSnapshot?.changes.find(c => c.category === 'topicPreferences')?.after || null,
        after: adjustments.topicPreferences,
        reason: 'Learned preferred topics from conversation history',
      });
    }
    
    const confidenceScore = patterns.reduce((sum, p) => {
      const value = p.value as any;
      return sum + (value?.learningMetrics?.patternConfidence || 0);
    }, 0) / Math.max(patterns.length, 1);
    
    return {
      timestamp: new Date(),
      changes,
      triggerEvent: 'Pattern analysis and feedback processing',
      confidenceScore,
    };
  }
  
  private async storeEvolutionMetrics(
    personaId: string,
    evolutionState: EvolutionState,
    adjustments: PersonalityAdjustments,
    userId: string
  ): Promise<void> {
    try {
      // Store evolution state as a pattern metric
      await storage.upsertPatternMetric({
        personaId,
        metric: 'evolution_state',
        window: '30d',
        value: {
          evolutionStage: evolutionState.evolutionStage,
          adaptationScore: evolutionState.adaptationScore,
          lastEvolution: evolutionState.lastEvolution,
          adjustments,
        },
      }, userId);
    } catch (error) {
      console.error('Failed to store evolution metrics:', error);
    }
  }
  
  /**
   * Get current evolution state for a persona
   */
  getEvolutionState(personaId: string): EvolutionState | null {
    return this.evolutionStates.get(personaId) || null;
  }
  
  /**
   * Reset learning for a persona
   */
  resetLearning(personaId: string): void {
    this.evolutionStates.delete(personaId);
    // Clear cache entries for this persona
    for (const key of Array.from(this.adjustmentCache.keys())) {
      if (key.startsWith(personaId)) {
        this.adjustmentCache.delete(key);
      }
    }
  }
  
  /**
   * Get personality adjustments from cache or compute them
   */
  async getPersonalityAdjustments(
    persona: Persona,
    userId: string,
    forceRefresh = false
  ): Promise<PersonalityAdjustments | null> {
    const cacheKey = `${persona.id}_latest`;
    
    if (!forceRefresh) {
      const cached = this.adjustmentCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      // Fetch latest patterns and feedback
      const patterns = await storage.getPatternMetrics(persona.id, userId);
      const feedback = await storage.getFeedbackByPersona(persona.id, userId);
      
      if (patterns.length === 0) {
        return null; // No patterns to learn from yet
      }
      
      // Compute adjustments
      const adjustments = await this.evolvePersonality(persona, patterns, feedback, userId);
      
      // Cache with latest key
      this.adjustmentCache.set(cacheKey, adjustments);
      
      return adjustments;
    } catch (error) {
      console.error('Failed to get personality adjustments:', error);
      return null;
    }
  }
}

export const personalityEvolution = PersonalityEvolution.getInstance();