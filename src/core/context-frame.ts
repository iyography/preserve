// CONTEXT ENGINEERING CORE DATA STRUCTURES
// Hierarchical context management for grief-tech platform

export interface ContextHierarchy {
  coreIdentity: {
    personalityTraits: ImmutableTraits
    fundamentalValues: CoreValue[]
    speechPatterns: VoiceSignature
  }
  episodicMemory: {
    recentEvents: TimestampedMemory[]      // Last 30 days, full fidelity
    compressedHistory: SummarizedMemory[]  // Older than 30 days, compressed
    landmarkMoments: SignificantEvent[]   // High emotional weight, preserved
  }
  interactionContext: {
    conversationWindow: Message[]          // Last 20 exchanges
    emotionalState: EmotionalContext      // Current session mood/triggers
    familyMemberContext: RelationshipState // Who's talking, relationship dynamics
  }
}