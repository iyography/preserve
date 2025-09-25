import { z } from 'zod';
import { storage } from '../storage';

interface UserCorrection {
  type: 'forbidden_term' | 'language_preference' | 'stop_behavior';
  extractedTerms: string[];
  originalMessage: string;
  correctionType: 'explicit' | 'implicit';
  severity: 'high' | 'medium' | 'low';
  reason: string;
}

interface ProcessingResult {
  correctionDetected: boolean;
  correction?: UserCorrection;
  updateApplied: boolean;
  processingTimeMs: number;
  visualFeedback: string;
}

export class RealTimeFeedbackProcessor {
  private static instance: RealTimeFeedbackProcessor;
  
  // Patterns for detecting user corrections
  private readonly correctionPatterns = [
    // Direct requests to stop using terms
    {
      pattern: /don'?t\s+(call\s+me|use|say)\s+["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'high' as const,
      extractGroup: 2
    },
    {
      pattern: /stop\s+(saying|using|calling\s+me)\s+["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'high' as const,
      extractGroup: 2
    },
    {
      pattern: /please\s+don'?t\s+(call\s+me|say)\s+["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'high' as const,
      extractGroup: 2
    },
    
    // Terms in quotes after negative feedback
    {
      pattern: /i\s+don'?t\s+like\s+(when\s+you\s+)?(call\s+me\s+|say\s+)["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'high' as const,
      extractGroup: 3
    },
    
    // Never use X patterns
    {
      pattern: /never\s+(call\s+me|use|say)\s+["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'high' as const,
      extractGroup: 2
    },
    
    // Avoid using X patterns
    {
      pattern: /avoid\s+(using|saying|calling\s+me)\s+["\"]?([^""\.\!]+)["\"]?/gi,
      type: 'forbidden_term' as const,
      severity: 'medium' as const,
      extractGroup: 2
    },
    
    // I prefer X over Y patterns for language preferences
    {
      pattern: /i\s+prefer\s+["\"]?([^""]+)["\"]?\s+(over|instead\s+of)\s+["\"]?([^""]+)["\"]?/gi,
      type: 'language_preference' as const,
      severity: 'medium' as const,
      extractGroup: 3, // The term to avoid (Y)
      preferredGroup: 1 // The preferred term (X)
    },
    
    // Stop doing X behavior patterns
    {
      pattern: /stop\s+(being\s+so|acting)\s+([^.\!]+)/gi,
      type: 'stop_behavior' as const,
      severity: 'medium' as const,
      extractGroup: 2
    }
  ];
  
  private constructor() {}
  
  static getInstance(): RealTimeFeedbackProcessor {
    if (!RealTimeFeedbackProcessor.instance) {
      RealTimeFeedbackProcessor.instance = new RealTimeFeedbackProcessor();
    }
    return RealTimeFeedbackProcessor.instance;
  }
  
  /**
   * Main processing method that detects and applies user corrections within 200ms
   */
  async processUserMessage(
    userId: string,
    message: string,
    personaId?: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Detect correction in user message
      const correction = this.detectCorrection(message);
      
      if (!correction.correctionDetected) {
        return {
          correctionDetected: false,
          updateApplied: false,
          processingTimeMs: Date.now() - startTime,
          visualFeedback: ''
        };
      }
      
      // Apply correction to user settings
      const success = await this.applyCorrection(userId, correction.correction!);
      
      const processingTime = Date.now() - startTime;
      
      // Generate visual feedback
      const visualFeedback = this.generateVisualFeedback(correction.correction!, success);
      
      console.log(`⚡ Real-time feedback processed in ${processingTime}ms`);
      
      return {
        correctionDetected: true,
        correction: correction.correction,
        updateApplied: success,
        processingTimeMs: processingTime,
        visualFeedback
      };
      
    } catch (error) {
      console.error('❌ Error processing real-time feedback:', error);
      return {
        correctionDetected: false,
        updateApplied: false,
        processingTimeMs: Date.now() - startTime,
        visualFeedback: ''
      };
    }
  }
  
  /**
   * Detect correction patterns in user message
   */
  private detectCorrection(message: string): { correctionDetected: boolean; correction?: UserCorrection } {
    const normalizedMessage = message.toLowerCase().trim();
    
    for (const patternConfig of this.correctionPatterns) {
      const matches = Array.from(normalizedMessage.matchAll(patternConfig.pattern));
      
      if (matches.length > 0) {
        const extractedTerms: string[] = [];
        let preferredTerm: string | undefined;
        
        for (const match of matches) {
          const term = match[patternConfig.extractGroup]?.trim();
          if (term && term.length > 0 && term.length < 50) { // Reasonable length limit
            extractedTerms.push(term);
          }
          
          // Extract preferred term if it's a language preference
          if (patternConfig.type === 'language_preference' && 'preferredGroup' in patternConfig) {
            preferredTerm = match[patternConfig.preferredGroup as number]?.trim();
          }
        }
        
        if (extractedTerms.length > 0) {
          return {
            correctionDetected: true,
            correction: {
              type: patternConfig.type,
              extractedTerms,
              originalMessage: message,
              correctionType: 'explicit',
              severity: patternConfig.severity,
              reason: `User explicitly requested to ${patternConfig.type === 'forbidden_term' ? 'avoid' : 'change'} these terms`,
              ...(preferredTerm && { preferredTerm })
            } as UserCorrection & { preferredTerm?: string }
          };
        }
      }
    }
    
    return { correctionDetected: false };
  }
  
  /**
   * Apply correction to user settings in database
   */
  private async applyCorrection(userId: string, correction: UserCorrection): Promise<boolean> {
    try {
      // Skip database operations for demo users
      if (userId === 'demo-user') {
        return true; // Demo sessions don't persist to database
      }
      
      // Get current user settings
      const currentSettings = await storage.getUserSettings(userId);
      
      if (correction.type === 'forbidden_term' || correction.type === 'stop_behavior') {
        // Add to forbidden terms array
        const existingTerms = currentSettings?.forbiddenTerms || [];
        const newTerms = correction.extractedTerms.filter(term => 
          !existingTerms.some(existing => existing.toLowerCase() === term.toLowerCase())
        );
        
        if (newTerms.length > 0) {
          const updatedTerms = [...existingTerms, ...newTerms];
          
          if (currentSettings) {
            await storage.updateUserSettings(userId, {
              forbiddenTerms: updatedTerms
            });
          } else {
            await storage.createUserSettings({
              userId,
              forbiddenTerms: updatedTerms
            });
          }
        }
      } else if (correction.type === 'language_preference') {
        // Add to language corrections map
        const correctionWithPreferred = correction as UserCorrection & { preferredTerm?: string };
        const existingCorrections = (currentSettings?.languageCorrections as Record<string, string>) || {};
        const updatedCorrections: Record<string, string> = { ...existingCorrections };
        
        for (const term of correction.extractedTerms) {
          if (correctionWithPreferred.preferredTerm) {
            updatedCorrections[term] = correctionWithPreferred.preferredTerm;
          }
        }
        
        if (currentSettings) {
          await storage.updateUserSettings(userId, {
            languageCorrections: updatedCorrections
          });
        } else {
          await storage.createUserSettings({
            userId,
            languageCorrections: updatedCorrections
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error applying correction to database:', error);
      return false;
    }
  }
  
  /**
   * Generate visual feedback message for user
   */
  private generateVisualFeedback(correction: UserCorrection, success: boolean): string {
    if (!success) {
      return '❌ Failed to apply feedback';
    }
    
    const termsText = correction.extractedTerms.length === 1 
      ? `"${correction.extractedTerms[0]}"` 
      : correction.extractedTerms.map(t => `"${t}"`).join(', ');
    
    switch (correction.type) {
      case 'forbidden_term':
        return `✓ Feedback applied - will avoid using ${termsText}`;
      case 'language_preference':
        return `✓ Language preference updated - will avoid ${termsText}`;
      case 'stop_behavior':
        return `✓ Behavior noted - will adjust ${termsText}`;
      default:
        return '✓ Feedback applied';
    }
  }
  
  /**
   * Get current forbidden terms for a user (for prompt building)
   */
  async getUserForbiddenTerms(userId: string): Promise<string[]> {
    try {
      // Demo users don't have persistent settings
      if (userId === 'demo-user') {
        return [];
      }
      
      const settings = await storage.getUserSettings(userId);
      return settings?.forbiddenTerms || [];
    } catch (error) {
      console.error('❌ Error fetching forbidden terms:', error);
      return [];
    }
  }
  
  /**
   * Get current language corrections for a user (for prompt building)
   */
  async getUserLanguageCorrections(userId: string): Promise<Record<string, string>> {
    try {
      // Demo users don't have persistent settings
      if (userId === 'demo-user') {
        return {};
      }
      
      const settings = await storage.getUserSettings(userId);
      return (settings?.languageCorrections as Record<string, string>) || {};
    } catch (error) {
      console.error('❌ Error fetching language corrections:', error);
      return {};
    }
  }
  
  /**
   * Generate prompt instructions for forbidden terms
   */
  generatePromptInstructions(forbiddenTerms: string[], languageCorrections: Record<string, string>): string {
    const instructions: string[] = [];
    
    if (forbiddenTerms.length > 0) {
      instructions.push(`CRITICAL: NEVER use these terms when addressing the user: ${forbiddenTerms.map(t => `"${t}"`).join(', ')}.`);
    }
    
    if (Object.keys(languageCorrections).length > 0) {
      const corrections = Object.entries(languageCorrections)
        .map(([avoid, prefer]) => `instead of "${avoid}" use "${prefer}"`)
        .join(', ');
      instructions.push(`Language preferences: ${corrections}.`);
    }
    
    return instructions.join(' ');
  }
}

// Export singleton instance
export const realTimeFeedback = RealTimeFeedbackProcessor.getInstance();