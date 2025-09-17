import type { Message, Persona } from "@shared/schema";

interface ConversationPattern {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overall: 'positive' | 'neutral' | 'negative';
  };
  topics: {
    topic: string;
    frequency: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  verbosity: {
    avgMessageLength: number;
    minLength: number;
    maxLength: number;
    preferredLength: number;
  };
  emotionalState: {
    current: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'reflective';
    needsSupport: boolean;
    supportType: 'emotional' | 'practical' | 'listening' | 'advice' | null;
  };
  conversationFlow: {
    questionRatio: number; // How often they ask questions vs statements
    responseTime: number[]; // Average time between messages if available
    preferredTopics: string[];
    avoidedTopics: string[];
    conversationStarters: string[];
  };
  communicationStyle: {
    formality: 'formal' | 'casual' | 'mixed';
    expressiveness: 'expressive' | 'reserved' | 'balanced';
    humor: boolean;
    directness: 'direct' | 'indirect' | 'contextual';
  };
  learningMetrics: {
    patternConfidence: number; // 0-1 score of how confident we are in these patterns
    sampleSize: number;
    lastUpdated: Date;
  };
}

export class ConversationAnalyzer {
  private persona: Persona;
  private messages: Message[];
  
  constructor(persona: Persona, messages: Message[]) {
    this.persona = persona;
    this.messages = messages;
  }
  
  analyzeConversation(): ConversationPattern {
    const sentiment = this.analyzeSentiment();
    const topics = this.extractTopics();
    const verbosity = this.analyzeVerbosity();
    const emotionalState = this.detectEmotionalState();
    const conversationFlow = this.analyzeConversationFlow();
    const communicationStyle = this.analyzeCommunicationStyle();
    
    return {
      sentiment,
      topics,
      verbosity,
      emotionalState,
      conversationFlow,
      communicationStyle,
      learningMetrics: {
        patternConfidence: this.calculateConfidence(),
        sampleSize: this.messages.length,
        lastUpdated: new Date(),
      },
    };
  }
  
  private analyzeSentiment(): ConversationPattern['sentiment'] {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    const positiveWords = [
      'love', 'happy', 'great', 'wonderful', 'amazing', 'good', 'best', 
      'excellent', 'perfect', 'beautiful', 'fantastic', 'joy', 'blessed',
      'grateful', 'thankful', 'excited', 'proud', 'smile', 'laugh'
    ];
    
    const negativeWords = [
      'sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'worst',
      'horrible', 'disgusting', 'disappointed', 'frustrated', 'upset',
      'worried', 'anxious', 'stress', 'tired', 'sick', 'pain', 'hurt'
    ];
    
    for (const message of this.messages) {
      if (message.role === 'user') {
        const text = message.content.toLowerCase();
        let messagePositive = 0;
        let messageNegative = 0;
        
        for (const word of positiveWords) {
          if (text.includes(word)) messagePositive++;
        }
        
        for (const word of negativeWords) {
          if (text.includes(word)) messageNegative++;
        }
        
        if (messagePositive > messageNegative) {
          positive++;
        } else if (messageNegative > messagePositive) {
          negative++;
        } else {
          neutral++;
        }
      }
    }
    
    const total = positive + negative + neutral || 1;
    let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    if (positive / total > 0.5) overall = 'positive';
    else if (negative / total > 0.5) overall = 'negative';
    
    return {
      positive: positive / total,
      neutral: neutral / total,
      negative: negative / total,
      overall,
    };
  }
  
  private extractTopics(): ConversationPattern['topics'] {
    const topicMap = new Map<string, { count: number; sentiment: number }>();
    
    // Common topic keywords
    const topicKeywords = {
      'family': ['family', 'kids', 'children', 'parents', 'mother', 'father', 'sister', 'brother', 'daughter', 'son'],
      'work': ['work', 'job', 'office', 'career', 'boss', 'colleague', 'meeting', 'project', 'deadline'],
      'health': ['health', 'doctor', 'medicine', 'sick', 'well', 'pain', 'hospital', 'therapy', 'exercise'],
      'hobbies': ['hobby', 'fun', 'game', 'sport', 'music', 'movie', 'book', 'art', 'travel'],
      'emotions': ['feel', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'excited', 'worried', 'anxious'],
      'memories': ['remember', 'memory', 'past', 'used to', 'when we', 'that time', 'years ago'],
      'daily life': ['today', 'yesterday', 'morning', 'evening', 'weekend', 'routine', 'busy', 'schedule'],
      'relationships': ['friend', 'love', 'relationship', 'partner', 'marriage', 'together', 'miss'],
    };
    
    for (const message of this.messages) {
      if (message.role === 'user') {
        const text = message.content.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
          for (const keyword of keywords) {
            if (text.includes(keyword)) {
              const existing = topicMap.get(topic) || { count: 0, sentiment: 0 };
              existing.count++;
              
              // Simple sentiment scoring for the topic
              if (text.includes('love') || text.includes('happy') || text.includes('great')) {
                existing.sentiment += 1;
              } else if (text.includes('hate') || text.includes('sad') || text.includes('bad')) {
                existing.sentiment -= 1;
              }
              
              topicMap.set(topic, existing);
              break; // Only count once per message
            }
          }
        }
      }
    }
    
    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        sentiment: data.sentiment > 0 ? 'positive' : data.sentiment < 0 ? 'negative' : 'neutral',
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Top 5 topics
  }
  
  private analyzeVerbosity(): ConversationPattern['verbosity'] {
    const userMessages = this.messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      return {
        avgMessageLength: 50,
        minLength: 10,
        maxLength: 100,
        preferredLength: 50,
      };
    }
    
    const lengths = userMessages.map(m => m.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);
    
    // Calculate preferred length (median)
    const sorted = [...lengths].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const preferredLength = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    
    return {
      avgMessageLength: Math.round(avgLength),
      minLength,
      maxLength,
      preferredLength: Math.round(preferredLength),
    };
  }
  
  private detectEmotionalState(): ConversationPattern['emotionalState'] {
    const recentMessages = this.messages
      .filter(m => m.role === 'user')
      .slice(-5); // Last 5 user messages
    
    if (recentMessages.length === 0) {
      return {
        current: 'calm',
        needsSupport: false,
        supportType: null,
      };
    }
    
    let emotionalScores = {
      happy: 0,
      sad: 0,
      anxious: 0,
      calm: 0,
      excited: 0,
      reflective: 0,
    };
    
    const emotionalIndicators = {
      happy: ['happy', 'joy', 'great', 'wonderful', 'smile', 'laugh', 'fun', 'love'],
      sad: ['sad', 'cry', 'miss', 'lonely', 'down', 'depressed', 'unhappy'],
      anxious: ['worried', 'anxious', 'stress', 'nervous', 'scared', 'fear', 'concern'],
      calm: ['peaceful', 'calm', 'relaxed', 'fine', 'okay', 'alright', 'good'],
      excited: ['excited', 'amazing', 'wow', 'incredible', 'awesome', 'thrilled'],
      reflective: ['remember', 'think about', 'wondering', 'memories', 'past', 'used to'],
    };
    
    for (const message of recentMessages) {
      const text = message.content.toLowerCase();
      
      for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
        for (const indicator of indicators) {
          if (text.includes(indicator)) {
            emotionalScores[emotion as keyof typeof emotionalScores]++;
          }
        }
      }
    }
    
    // Find dominant emotion
    const current = Object.entries(emotionalScores)
      .sort(([, a], [, b]) => b - a)[0][0] as ConversationPattern['emotionalState']['current'];
    
    // Detect if support is needed
    const needsSupport = emotionalScores.sad > 1 || emotionalScores.anxious > 1;
    
    let supportType: ConversationPattern['emotionalState']['supportType'] = null;
    if (needsSupport) {
      if (emotionalScores.sad > emotionalScores.anxious) {
        supportType = 'emotional';
      } else if (emotionalScores.anxious > emotionalScores.sad) {
        supportType = 'practical';
      } else {
        supportType = 'listening';
      }
    }
    
    return {
      current,
      needsSupport,
      supportType,
    };
  }
  
  private analyzeConversationFlow(): ConversationPattern['conversationFlow'] {
    const userMessages = this.messages.filter(m => m.role === 'user');
    
    // Question ratio
    const questions = userMessages.filter(m => m.content.includes('?')).length;
    const questionRatio = userMessages.length > 0 ? questions / userMessages.length : 0;
    
    // Response times (if timestamps available)
    const responseTimes: number[] = [];
    for (let i = 1; i < this.messages.length; i++) {
      if (this.messages[i].role === 'user' && this.messages[i - 1].role === 'assistant') {
        // Calculate time difference if timestamps exist
        responseTimes.push(60); // Default 60 seconds between messages
      }
    }
    
    // Extract topics from analysis
    const topics = this.extractTopics();
    const preferredTopics = topics
      .filter(t => t.sentiment === 'positive')
      .map(t => t.topic)
      .slice(0, 3);
    
    const avoidedTopics = topics
      .filter(t => t.sentiment === 'negative')
      .map(t => t.topic)
      .slice(0, 3);
    
    // Conversation starters (first message patterns)
    const starters: string[] = [];
    for (const message of userMessages.slice(0, 3)) {
      const text = message.content.toLowerCase();
      if (text.includes('how are')) starters.push('greeting');
      else if (text.includes('remember')) starters.push('memory');
      else if (text.includes('tell me')) starters.push('inquiry');
      else starters.push('general');
    }
    
    return {
      questionRatio,
      responseTime: responseTimes,
      preferredTopics,
      avoidedTopics,
      conversationStarters: Array.from(new Set(starters)),
    };
  }
  
  private analyzeCommunicationStyle(): ConversationPattern['communicationStyle'] {
    const userMessages = this.messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      return {
        formality: 'casual',
        expressiveness: 'balanced',
        humor: false,
        directness: 'direct',
      };
    }
    
    let formalCount = 0;
    let casualCount = 0;
    let expressiveCount = 0;
    let humorCount = 0;
    let directCount = 0;
    
    const formalIndicators = ['please', 'thank you', 'would you', 'could you', 'apologize', 'excuse me'];
    const casualIndicators = ['hey', 'yeah', 'gonna', 'wanna', 'lol', 'haha', 'cool', 'awesome'];
    const expressiveIndicators = ['!', '...', 'really', 'very', 'so much', 'absolutely', 'definitely'];
    const humorIndicators = ['haha', 'lol', 'joke', 'funny', '😂', '😄', 'laugh'];
    
    for (const message of userMessages) {
      const text = message.content.toLowerCase();
      
      for (const indicator of formalIndicators) {
        if (text.includes(indicator)) formalCount++;
      }
      
      for (const indicator of casualIndicators) {
        if (text.includes(indicator)) casualCount++;
      }
      
      for (const indicator of expressiveIndicators) {
        if (text.includes(indicator)) expressiveCount++;
      }
      
      for (const indicator of humorIndicators) {
        if (text.includes(indicator)) humorCount++;
      }
      
      // Direct vs indirect (questions vs statements)
      if (text.includes('?')) {
        directCount--;
      } else {
        directCount++;
      }
    }
    
    return {
      formality: formalCount > casualCount ? 'formal' : casualCount > formalCount ? 'casual' : 'mixed',
      expressiveness: expressiveCount > userMessages.length * 0.5 ? 'expressive' : 
                      expressiveCount < userMessages.length * 0.2 ? 'reserved' : 'balanced',
      humor: humorCount > userMessages.length * 0.2,
      directness: directCount > 0 ? 'direct' : directCount < 0 ? 'indirect' : 'contextual',
    };
  }
  
  private calculateConfidence(): number {
    // Base confidence on sample size and pattern consistency
    const sampleSizeScore = Math.min(this.messages.length / 50, 1); // Max confidence at 50 messages
    const patternConsistency = this.calculatePatternConsistency();
    
    return (sampleSizeScore * 0.6 + patternConsistency * 0.4);
  }
  
  private calculatePatternConsistency(): number {
    // Check how consistent patterns are across the conversation
    // This is simplified - in production, you'd want more sophisticated analysis
    
    if (this.messages.length < 5) return 0.3; // Low confidence with few messages
    
    // Check sentiment consistency
    const sentiment = this.analyzeSentiment();
    const maxSentiment = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative);
    
    // Check topic consistency
    const topics = this.extractTopics();
    const topicConsistency = topics.length > 0 ? 
      topics[0].frequency / this.messages.filter(m => m.role === 'user').length : 0;
    
    return Math.min((maxSentiment + topicConsistency) / 2, 1);
  }
  
  // Merge patterns from multiple conversations to build comprehensive understanding
  static mergePatterns(patterns: ConversationPattern[]): ConversationPattern {
    if (patterns.length === 0) {
      throw new Error('No patterns to merge');
    }
    
    if (patterns.length === 1) {
      return patterns[0];
    }
    
    // Average sentiment across all patterns
    const sentiment = {
      positive: patterns.reduce((sum, p) => sum + p.sentiment.positive, 0) / patterns.length,
      neutral: patterns.reduce((sum, p) => sum + p.sentiment.neutral, 0) / patterns.length,
      negative: patterns.reduce((sum, p) => sum + p.sentiment.negative, 0) / patterns.length,
      overall: 'neutral' as ConversationPattern['sentiment']['overall'],
    };
    
    if (sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral) {
      sentiment.overall = 'positive';
    } else if (sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral) {
      sentiment.overall = 'negative';
    }
    
    // Merge topics by frequency
    const topicMap = new Map<string, { frequency: number; sentiment: ConversationPattern['topics'][0]['sentiment'] }>();
    for (const pattern of patterns) {
      for (const topic of pattern.topics) {
        const existing = topicMap.get(topic.topic) || { frequency: 0, sentiment: 'neutral' };
        existing.frequency += topic.frequency;
        // Keep the most common sentiment
        if (topic.sentiment !== 'neutral') {
          existing.sentiment = topic.sentiment;
        }
        topicMap.set(topic.topic, existing);
      }
    }
    
    const mergedTopics = Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.frequency,
        sentiment: data.sentiment,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    
    // Average verbosity
    const verbosity = {
      avgMessageLength: patterns.reduce((sum, p) => sum + p.verbosity.avgMessageLength, 0) / patterns.length,
      minLength: Math.min(...patterns.map(p => p.verbosity.minLength)),
      maxLength: Math.max(...patterns.map(p => p.verbosity.maxLength)),
      preferredLength: patterns.reduce((sum, p) => sum + p.verbosity.preferredLength, 0) / patterns.length,
    };
    
    // Most recent emotional state
    const emotionalState = patterns[patterns.length - 1].emotionalState;
    
    // Merge conversation flow
    const conversationFlow = {
      questionRatio: patterns.reduce((sum, p) => sum + p.conversationFlow.questionRatio, 0) / patterns.length,
      responseTime: patterns.flatMap(p => p.conversationFlow.responseTime),
      preferredTopics: Array.from(new Set(patterns.flatMap(p => p.conversationFlow.preferredTopics))),
      avoidedTopics: Array.from(new Set(patterns.flatMap(p => p.conversationFlow.avoidedTopics))),
      conversationStarters: Array.from(new Set(patterns.flatMap(p => p.conversationFlow.conversationStarters))),
    };
    
    // Most common communication style
    const styleVotes = {
      formality: { formal: 0, casual: 0, mixed: 0 },
      expressiveness: { expressive: 0, reserved: 0, balanced: 0 },
      directness: { direct: 0, indirect: 0, contextual: 0 },
    };
    
    let humorCount = 0;
    for (const pattern of patterns) {
      styleVotes.formality[pattern.communicationStyle.formality]++;
      styleVotes.expressiveness[pattern.communicationStyle.expressiveness]++;
      styleVotes.directness[pattern.communicationStyle.directness]++;
      if (pattern.communicationStyle.humor) humorCount++;
    }
    
    const communicationStyle = {
      formality: Object.entries(styleVotes.formality)
        .sort(([, a], [, b]) => b - a)[0][0] as ConversationPattern['communicationStyle']['formality'],
      expressiveness: Object.entries(styleVotes.expressiveness)
        .sort(([, a], [, b]) => b - a)[0][0] as ConversationPattern['communicationStyle']['expressiveness'],
      humor: humorCount > patterns.length / 2,
      directness: Object.entries(styleVotes.directness)
        .sort(([, a], [, b]) => b - a)[0][0] as ConversationPattern['communicationStyle']['directness'],
    };
    
    // Calculate overall confidence
    const totalSampleSize = patterns.reduce((sum, p) => sum + p.learningMetrics.sampleSize, 0);
    const avgConfidence = patterns.reduce((sum, p) => sum + p.learningMetrics.patternConfidence, 0) / patterns.length;
    
    return {
      sentiment,
      topics: mergedTopics,
      verbosity,
      emotionalState,
      conversationFlow,
      communicationStyle,
      learningMetrics: {
        patternConfidence: Math.min(avgConfidence * 1.1, 1), // Slight boost for multiple samples
        sampleSize: totalSampleSize,
        lastUpdated: new Date(),
      },
    };
  }
}

// Export singleton instance for easy use
export const conversationAnalyzer = {
  analyze: (persona: Persona, messages: Message[]) => {
    const analyzer = new ConversationAnalyzer(persona, messages);
    return analyzer.analyzeConversation();
  },
  mergePatterns: ConversationAnalyzer.mergePatterns,
};