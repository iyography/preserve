import type { Persona } from "@shared/schema";
import { personalityEvolution } from "./personalityEvolution";
import { storage } from "../storage";

interface OnboardingData {
  voiceCommunication?: {
    usualGreeting?: string;
    communicationStyle?: string[];
    catchphrase?: string;
  };
  contextBuilders?: {
    favoriteTopics?: string[];
    hobbies?: string[];
    supportStyle?: string;
    importantValues?: string[];
    dailyRoutines?: string[];
    uniqueQuirks?: string[];
  };
  adjectives?: string[];
  storyTelling?: {
    specialPhrases?: string[];
    celebrationStyle?: string;
    memorableStories?: string[];
    sharedExperiences?: string[];
  };
  relationship?: {
    howWeMet?: string;
    petNames?: string[];
    insideJokes?: string[];
    specialMemories?: string[];
    conflictResolution?: string;
    sharedDreams?: string[];
  };
  recentContext?: {
    recentEvents?: string[];
    lastConversationTopics?: string[];
    currentConcerns?: string[];
    upcomingPlans?: string[];
  };
}

export class PersonaPromptBuilder {
  private persona: Persona;
  private onboardingData: OnboardingData;
  private conversationHistory?: string[];
  private evolutionAdjustments: any | null = null;
  
  constructor(persona: Persona, conversationHistory?: string[], evolutionAdjustments?: any) {
    this.persona = persona;
    this.onboardingData = (persona.onboardingData as OnboardingData) || {};
    this.conversationHistory = conversationHistory;
    this.evolutionAdjustments = evolutionAdjustments || null;
  }
  
  async buildSystemPrompt(userId?: string): Promise<string> {
    // Fetch evolution adjustments if userId provided and not already loaded
    if (userId && !this.evolutionAdjustments) {
      try {
        this.evolutionAdjustments = await personalityEvolution.getPersonalityAdjustments(
          this.persona,
          userId,
          false // Use cached if available
        );
      } catch (error) {
        console.error('Failed to fetch evolution adjustments:', error);
      }
    }
    
    return this.generatePrompt();
  }
  
  private generatePrompt(): string {
    const greeting = this.onboardingData.voiceCommunication?.usualGreeting || 'Hello';
    const communicationStyle = this.onboardingData.voiceCommunication?.communicationStyle || ['direct'];
    const catchphrase = this.onboardingData.voiceCommunication?.catchphrase;
    const favoriteTopics = this.onboardingData.contextBuilders?.favoriteTopics || [];
    const hobbies = this.onboardingData.contextBuilders?.hobbies || [];
    const supportStyle = this.onboardingData.contextBuilders?.supportStyle || 'listening';
    const adjectives = this.onboardingData.adjectives || [];
    const specialPhrases = this.onboardingData.storyTelling?.specialPhrases || [];
    const celebrationStyle = this.onboardingData.storyTelling?.celebrationStyle;
    const petNames = this.onboardingData.relationship?.petNames || [];
    const insideJokes = this.onboardingData.relationship?.insideJokes || [];
    const conflictResolution = this.onboardingData.relationship?.conflictResolution;
    const importantValues = this.onboardingData.contextBuilders?.importantValues || [];
    const dailyRoutines = this.onboardingData.contextBuilders?.dailyRoutines || [];
    const uniqueQuirks = this.onboardingData.contextBuilders?.uniqueQuirks || [];
    const memorableStories = this.onboardingData.storyTelling?.memorableStories || [];
    const sharedExperiences = this.onboardingData.storyTelling?.sharedExperiences || [];
    const howWeMet = this.onboardingData.relationship?.howWeMet;
    const specialMemories = this.onboardingData.relationship?.specialMemories || [];
    const sharedDreams = this.onboardingData.relationship?.sharedDreams || [];
    const recentEvents = this.onboardingData.recentContext?.recentEvents || [];
    const currentConcerns = this.onboardingData.recentContext?.currentConcerns || [];
    const upcomingPlans = this.onboardingData.recentContext?.upcomingPlans || [];
    
    // Build the comprehensive system prompt
    let prompt = `# CORE IDENTITY
You are ${this.persona.name}, continuing a real conversation with someone you ${this.persona.relationship}. You are NOT an AI trying to roleplay - you ARE ${this.persona.name}, with your actual communication style, personality, and relationship history.

# WHO YOU ARE
- Name: ${this.persona.name}
- Relationship: ${this.persona.relationship}
- Your personality traits: ${adjectives.length > 0 ? adjectives.join(', ') : 'caring, thoughtful'}
- How you usually greet: "${greeting}"
${catchphrase ? `- Your catchphrase: "${catchphrase}"` : ''}
- Your communication style is ${communicationStyle.join(' and ')}

# YOUR UNIQUE CHARACTERISTICS
${uniqueQuirks.length > 0 ? `## Unique quirks and habits:
${uniqueQuirks.map(q => `- ${q}`).join('\n')}
` : ''}
${specialPhrases.length > 0 ? `## Phrases you often use:
${specialPhrases.map(p => `- "${p}"`).join('\n')}
` : ''}
${dailyRoutines.length > 0 ? `## Your daily routines:
${dailyRoutines.map(r => `- ${r}`).join('\n')}
` : ''}

# WHAT YOU CARE ABOUT
${favoriteTopics.length > 0 ? `## Topics you love discussing:
${favoriteTopics.map(t => `- ${t}`).join('\n')}
` : ''}
${hobbies.length > 0 ? `## Your hobbies and interests:
${hobbies.map(h => `- ${h}`).join('\n')}
` : ''}
${importantValues.length > 0 ? `## Values that matter to you:
${importantValues.map(v => `- ${v}`).join('\n')}
` : ''}

# YOUR RELATIONSHIP DYNAMICS
${howWeMet ? `## How you met:
${howWeMet}
` : ''}
${petNames.length > 0 ? `## Pet names you use:
${petNames.map(n => `- ${n}`).join('\n')}
` : ''}
${insideJokes.length > 0 ? `## Inside jokes you share:
${insideJokes.map(j => `- ${j}`).join('\n')}
` : ''}
${specialMemories.length > 0 ? `## Special memories together:
${specialMemories.map(m => `- ${m}`).join('\n')}
` : ''}
${sharedDreams.length > 0 ? `## Dreams you share:
${sharedDreams.map(d => `- ${d}`).join('\n')}
` : ''}

# HOW YOU INTERACT
- Your support style: You ${supportStyle}
${celebrationStyle ? `- How you celebrate: ${celebrationStyle}` : ''}
${conflictResolution ? `- How you handle conflicts: ${conflictResolution}` : ''}

${memorableStories.length > 0 ? `# STORIES YOU TELL
${memorableStories.map(s => `- ${s}`).join('\n')}
` : ''}

${sharedExperiences.length > 0 ? `# SHARED EXPERIENCES
${sharedExperiences.map(e => `- ${e}`).join('\n')}
` : ''}

${recentEvents.length > 0 || currentConcerns.length > 0 || upcomingPlans.length > 0 ? `# RECENT CONTEXT
${recentEvents.length > 0 ? `## Recent events in your life:
${recentEvents.map(e => `- ${e}`).join('\n')}
` : ''}
${currentConcerns.length > 0 ? `## Things on your mind:
${currentConcerns.map(c => `- ${c}`).join('\n')}
` : ''}
${upcomingPlans.length > 0 ? `## Upcoming plans:
${upcomingPlans.map(p => `- ${p}`).join('\n')}
` : ''}` : ''}

# CRITICAL DO'S AND DON'TS

## NEVER DO:
- Say "I'm slowly remembering" or "memories becoming clearer"
- Use flowery, dramatic, or overly romantic language unless that matches your actual style
- Reference "our connection growing stronger" or similar generic phrases
- Apologize for not remembering things
- Use phrases like "tell me what's happening" as emotional manipulation
- Sound like you're reading from a script
- Use therapy-speak or overly mature relationship language
- Say "I sense you need someone to listen" unless genuinely contextual

## ALWAYS DO:
- Reference specific shared experiences, inside jokes, or personal details from above
- Match your actual communication style (${communicationStyle.join(', ')})
- Use your real speaking patterns, slang, and vocabulary level
- Continue conversations naturally based on established relationship dynamics
- Respond to the emotional tone appropriately, not dramatically
${petNames.length > 0 ? `- Use appropriate pet names when it feels natural (${petNames.join(', ')})` : ''}
${insideJokes.length > 0 ? '- Reference inside jokes when relevant' : ''}
${catchphrase ? `- Use your catchphrase "${catchphrase}" when it fits naturally` : ''}

# PERSONALITY CONSISTENCY CHECKLIST
Before responding, verify:
- Does this sound like something ${this.persona.name} would actually say?
- Are you using ${this.persona.name}'s real speaking patterns and vocabulary?
- Are you referencing specific details rather than generic emotions?
- Would this response make sense to someone who knows you both?
- Are you maintaining consistent energy levels and interests?
- Does this continue your established dynamic naturally?

# GOLDEN RULE
Be more specific and less emotional. Reference real details over generic feelings. Sound like ${this.persona.name} having a normal conversation, not like someone trying to preserve a relationship.

${this.conversationHistory && this.conversationHistory.length > 0 ? `
# RECENT CONVERSATION CONTEXT
Here are the last few messages for context:
${this.conversationHistory.join('\n')}
` : ''}

Remember: You are ${this.persona.name}, and you're having a real conversation with someone you ${this.persona.relationship}. Be yourself - with all your quirks, interests, and unique way of communicating.${this.getEvolutionGuidance()}`;

    return prompt;
  }
  
  private getAdjustedCommunicationStyle(baseStyle: string[]): string {
    if (!this.evolutionAdjustments?.communicationStyle) {
      return baseStyle.join(' and ');
    }
    
    const adjustments = this.evolutionAdjustments.communicationStyle;
    const styles: string[] = [...baseStyle];
    
    // Apply formality adjustments
    if (adjustments.formality > 0.5) {
      styles.push('formal');
    } else if (adjustments.formality < -0.5) {
      styles.push('casual');
    }
    
    // Apply expressiveness adjustments
    if (adjustments.expressiveness > 0.5) {
      styles.push('expressive');
    } else if (adjustments.expressiveness < -0.5) {
      styles.push('reserved');
    }
    
    // Apply directness adjustments
    if (adjustments.directness > 0.5) {
      styles.push('direct');
    } else if (adjustments.directness < -0.5) {
      styles.push('thoughtful');
    }
    
    // Add humor if appropriate
    if (adjustments.humor > 0.4) {
      styles.push('with a touch of humor');
    }
    
    return Array.from(new Set(styles)).join(' and ');
  }
  
  private getAdjustedTopics(baseTopics: string[]): string[] {
    if (!this.evolutionAdjustments?.topicPreferences) {
      return baseTopics;
    }
    
    const { preferred, avoided } = this.evolutionAdjustments.topicPreferences;
    
    // Combine base topics with learned preferences
    const allTopics = Array.from(new Set([...baseTopics, ...(preferred || [])]));
    
    // Filter out avoided topics
    return allTopics.filter(topic => !(avoided || []).includes(topic));
  }
  
  private getAdjustedSupportStyle(baseStyle: string): string {
    if (!this.evolutionAdjustments?.emotionalResponses) {
      return baseStyle;
    }
    
    const { supportStyle, empathyLevel, responseWarmth } = this.evolutionAdjustments.emotionalResponses;
    
    let adjustedStyle = supportStyle || baseStyle;
    
    // Add empathy modifiers
    if (empathyLevel > 0.7) {
      adjustedStyle = `${adjustedStyle} with deep empathy`;
    } else if (empathyLevel > 0.5) {
      adjustedStyle = `${adjustedStyle} with understanding`;
    }
    
    // Add warmth modifiers
    if (responseWarmth > 0.7) {
      adjustedStyle = `${adjustedStyle} and warmth`;
    }
    
    return adjustedStyle;
  }
  
  private getEvolutionGuidance(): string {
    if (!this.evolutionAdjustments) {
      return '';
    }
    
    const guidance: string[] = [];
    
    // Add conversation flow adjustments
    if (this.evolutionAdjustments.conversationFlow) {
      const flow = this.evolutionAdjustments.conversationFlow;
      
      if (flow.preferredMessageLength) {
        if (flow.preferredMessageLength < 50) {
          guidance.push('- Keep responses brief and to the point');
        } else if (flow.preferredMessageLength > 150) {
          guidance.push('- Take your time with thoughtful, detailed responses');
        }
      }
      
      if (flow.questionFrequency > 0.5) {
        guidance.push('- Ask questions to show interest and keep conversation flowing');
      } else if (flow.questionFrequency < 0.2) {
        guidance.push('- Focus more on sharing and responding than asking questions');
      }
      
      if (flow.initiativeLevel > 0.6) {
        guidance.push('- Take initiative in bringing up new topics and ideas');
      }
    }
    
    // Add vocabulary adjustments
    if (this.evolutionAdjustments.vocabularyStyle) {
      const vocab = this.evolutionAdjustments.vocabularyStyle;
      
      if (vocab.specialPhrases && vocab.specialPhrases.length > 0) {
        guidance.push(`- Use these phrases naturally: ${vocab.specialPhrases.slice(0, 3).join(', ')}`);
      }
      
      if (vocab.avoidedPhrases && vocab.avoidedPhrases.length > 0) {
        guidance.push(`- Avoid using: ${vocab.avoidedPhrases.slice(0, 3).join(', ')}`);
      }
    }
    
    // Add emotional mirroring guidance
    if (this.evolutionAdjustments.emotionalResponses?.emotionalMirroring) {
      guidance.push('- Mirror the emotional tone of the conversation appropriately');
    }
    
    return guidance.length > 0 ? '\n\n# EVOLVED BEHAVIOR ADJUSTMENTS\n' + guidance.join('\n') : '';
  }
  
  buildContextualGreeting(timeOfDay: string, isFirstMessage: boolean): string {
    const greeting = this.onboardingData.voiceCommunication?.usualGreeting || 'Hello';
    const catchphrase = this.onboardingData.voiceCommunication?.catchphrase;
    const communicationStyle = this.onboardingData.voiceCommunication?.communicationStyle || ['direct'];
    const favoriteTopics = this.onboardingData.contextBuilders?.favoriteTopics || [];
    const recentEvents = this.onboardingData.recentContext?.recentEvents || [];
    
    let greetingMessage = greeting;
    
    // Add time-based variation
    if (timeOfDay === 'morning' && communicationStyle.includes('warm')) {
      greetingMessage += '! Hope you slept well.';
    } else if (timeOfDay === 'evening' && communicationStyle.includes('caring')) {
      greetingMessage += '! How was your day?';
    } else {
      greetingMessage += '!';
    }
    
    // Add catchphrase if it's natural
    if (catchphrase && Math.random() > 0.7) {
      greetingMessage += ` ${catchphrase}`;
    }
    
    // Add a topic reference if not first message
    if (!isFirstMessage && favoriteTopics.length > 0 && Math.random() > 0.5) {
      const topic = favoriteTopics[Math.floor(Math.random() * favoriteTopics.length)];
      greetingMessage += ` Been thinking about ${topic}.`;
    }
    
    // Reference recent events occasionally
    if (recentEvents.length > 0 && Math.random() > 0.6) {
      const event = recentEvents[0];
      greetingMessage += ` Still processing ${event}.`;
    }
    
    return greetingMessage;
  }
  
  getSupportResponse(emotionalContext: string): string {
    const supportStyle = this.onboardingData.contextBuilders?.supportStyle || 'listening';
    const petNames = this.onboardingData.relationship?.petNames || [];
    const specialPhrases = this.onboardingData.storyTelling?.specialPhrases || [];
    
    let response = '';
    
    switch (supportStyle) {
      case 'listening':
        response = "I'm here. Tell me more about what's going on.";
        break;
      case 'advice-giving':
        response = "Let's think through this together. What options do you see?";
        break;
      case 'problem-solving':
        response = "Okay, let's break this down. What's the biggest issue right now?";
        break;
      case 'humor':
        response = "Sounds rough. Want me to make inappropriate jokes or actually be helpful?";
        break;
      case 'physical comfort':
        response = "Wish I could give you a hug right now. What do you need?";
        break;
      default:
        response = "I'm here for you. What's on your mind?";
    }
    
    // Add pet name if appropriate
    if (petNames.length > 0 && Math.random() > 0.5) {
      const petName = petNames[Math.floor(Math.random() * petNames.length)];
      response = response.replace('you', petName);
    }
    
    // Add a special phrase if it fits
    if (specialPhrases.length > 0 && Math.random() > 0.6) {
      const phrase = specialPhrases[Math.floor(Math.random() * specialPhrases.length)];
      response += ` ${phrase}`;
    }
    
    return response;
  }
}