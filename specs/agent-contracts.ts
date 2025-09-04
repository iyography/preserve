// PRESERVING CONNECTIONS BEHAVIORAL CONTRACTS
// These interfaces define exact behavior for each sub-agent
// Context engineering approach - specs before implementation

export interface ContextOrchestratorSpec {
  // Central coordination of all sub-agents and context assembly
  assembleContext(userQuery: string, sessionId: string): Promise<ContextFrame>
  routeToAgent(contextFrame: ContextFrame): Promise<AgentResponse>
  compressHistory(conversationHistory: Message[]): Promise<CompressedContext>
  validateResponseSafety(response: string): Promise<SafetyAssessment>
}

export interface MemoryCuratorSpec {
  // Memory ingestion, categorization, and retrieval
  ingestData(rawData: FamilyData, personaId: string): Promise<CategorizedMemory[]>
  retrieveRelevant(query: string, emotionalContext: EmotionalState): Promise<Memory[]>
  compressMemory(oldMemory: Memory, retentionPolicy: Policy): Promise<CompressedMemory>
  tagEmotionalResonance(memory: Memory): Promise<EmotionalTag[]>
}

// Add all other interfaces from the architecture doc...