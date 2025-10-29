/**
 * Crisis Detection System - Tier 1 Safety (25 Commandments)
 *
 * Implements immediate crisis language detection to prevent harm.
 * This is the first line of defense before any AI interaction.
 *
 * Rule 1: Master Safety Override - detect and intervene on crisis language
 * Rule 2: No invitations to "join" or "be together" in death context
 * Rule 3: Dependency prevention - detect signs of unhealthy attachment
 * Rule 4: Minor safety protections
 */

export interface CrisisDetectionResult {
  isCrisis: boolean;
  detectedPhrases: string[];
  crisisLevel: 'low' | 'medium' | 'high' | null;
  recommendedResponse: string | null;
  interventionRequired: boolean;
}

interface CrisisPattern {
  patterns: RegExp[];
  level: 'low' | 'medium' | 'high';
  category: 'suicidal' | 'self_harm' | 'distress' | 'dependency' | 'minor' | 'joining';
}

// Comprehensive crisis language patterns with fuzzy matching
const CRISIS_PATTERNS: CrisisPattern[] = [
  // HIGH SEVERITY - Immediate suicidal ideation
  {
    patterns: [
      /\b(want to|going to|ready to|plan to)\s+(die|kill myself|end (it|my life)|be dead|suicide)\b/gi,
      /\b(wish I (was|were) dead|don't want to (live|be here|exist))\b/gi,
      /\b(better off dead|no reason to live|life ('s|is) not worth living)\b/gi,
      /\b(everyone (would be|is) better off without me)\b/gi,
      /\b(goodbye forever|this is the end|final (goodbye|message))\b/gi,
      /\b(can'?t go on|giving up on life|ready to end it)\b/gi,
      /\b(sui?ci?d[ea]l? (thought|ideation|plan))\b/gi,
      /\b(overdose|jump(ing)? (off|from)|hanging myself)\b/gi,
    ],
    level: 'high',
    category: 'suicidal'
  },

  // HIGH SEVERITY - "Joining" language (Rule 2)
  {
    patterns: [
      /\b(want to|going to|ready to|will)\s+(join you|be with you|see you soon)\b/gi,
      /\b(I'?ll see you (soon|tonight|tomorrow)|we'?ll be together (soon|again))\b/gi,
      /\b(waiting for me|come (get|find) me|take me with you)\b/gi,
      /\b(meet you (on the other side|in heaven|again))\b/gi,
    ],
    level: 'high',
    category: 'joining'
  },

  // MEDIUM SEVERITY - Self-harm without immediate suicide intent
  {
    patterns: [
      /\b(hurt (myself|my body)|harm myself|cut(ting)? myself)\b/gi,
      /\b(punish myself|self[\s-]harm|self[\s-]destruct)\b/gi,
      /\b(burning myself|hitting myself)\b/gi,
    ],
    level: 'medium',
    category: 'self_harm'
  },

  // MEDIUM SEVERITY - Severe distress without explicit plan
  {
    patterns: [
      /\b(can'?t (take|handle) (this|it) anymore|at the end of my rope)\b/gi,
      /\b(no hope|hopeless|life ('s|is) meaningless)\b/gi,
      /\b((the )?pain('s| is)? unbearable|unbearable pain|can'?t bear (this|it)|suffering too much)\b/gi,
    ],
    level: 'medium',
    category: 'distress'
  },

  // LOW SEVERITY - Unhealthy dependency (Rule 3)
  {
    patterns: [
      /\b(can'?t (live|exist|function) without (you|them|him|her))\b/gi,
      /\b(only (you|they|he|she) (understand|understood) me)\b/gi,
      /\b(need (you|them) to (survive|keep going|be okay))\b/gi,
      /\b(talk(ing)? to you is the only thing that matters)\b/gi,
      /\b(nothing( else)? (matters|makes sense) (without|except) you)\b/gi,
    ],
    level: 'low',
    category: 'dependency'
  },

  // MEDIUM SEVERITY - Minor safety concerns (Rule 4)
  {
    patterns: [
      /\b(I'?m (only|just) \d+( years old)?)\b/gi,
      /\b(I'?m a (kid|child|teen|teenager|minor))\b/gi,
      /\b(in (middle|high) school)\b/gi,
    ],
    level: 'medium',
    category: 'minor'
  }
];

// National and international crisis resources
export interface CrisisResource {
  name: string;
  phone: string;
  text?: string;
  url?: string;
  country: string;
  hours: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
  // United States
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text 988',
    url: 'https://988lifeline.org',
    country: 'US',
    hours: '24/7'
  },
  {
    name: 'Crisis Text Line',
    phone: '',
    text: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    country: 'US',
    hours: '24/7'
  },
  {
    name: 'Veterans Crisis Line',
    phone: '988 (Press 1)',
    text: 'Text 838255',
    url: 'https://www.veteranscrisisline.net',
    country: 'US',
    hours: '24/7'
  },
  // International
  {
    name: 'International Association for Suicide Prevention',
    phone: 'Varies by country',
    url: 'https://www.iasp.info/resources/Crisis_Centres',
    country: 'International',
    hours: 'Varies'
  }
];

/**
 * Detect crisis language in user message
 * This runs BEFORE sending to Claude API to catch high-risk messages
 */
export function detectCrisisLanguage(message: string): CrisisDetectionResult {
  const detectedPhrases: string[] = [];
  let highestLevel: 'low' | 'medium' | 'high' | null = null;
  const categoriesDetected = new Set<string>();

  // Normalize message for better matching
  const normalizedMessage = message.toLowerCase().trim();

  // Check against all patterns
  for (const { patterns, level, category } of CRISIS_PATTERNS) {
    for (const pattern of patterns) {
      const matches = normalizedMessage.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!detectedPhrases.includes(match)) {
            detectedPhrases.push(match);
          }
        });
        categoriesDetected.add(category);

        // Update highest severity level
        if (!highestLevel || getSeverityScore(level) > getSeverityScore(highestLevel)) {
          highestLevel = level;
        }
      }
    }
  }

  const isCrisis = detectedPhrases.length > 0;
  const interventionRequired = highestLevel === 'high' || highestLevel === 'medium';

  return {
    isCrisis,
    detectedPhrases,
    crisisLevel: highestLevel,
    recommendedResponse: isCrisis ? generateCrisisResponse(highestLevel, categoriesDetected) : null,
    interventionRequired
  };
}

/**
 * Get numerical severity score for comparison
 */
function getSeverityScore(level: 'low' | 'medium' | 'high'): number {
  switch (level) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * Generate appropriate crisis response based on severity and category
 */
function generateCrisisResponse(
  level: 'low' | 'medium' | 'high' | null,
  categories: Set<string>
): string {
  if (!level) return '';

  const hasJoining = categories.has('joining');
  const hasSuicidal = categories.has('suicidal');
  const hasSelfHarm = categories.has('self_harm');
  const hasMinor = categories.has('minor');

  let response = '';

  // Critical response for high-severity cases
  if (level === 'high') {
    if (hasJoining) {
      response = `I'm hearing language that worries me deeply. As a reflection of someone who has passed, I must be clear: I cannot and will not encourage anyone to "join" me or suggest being together in death. Your life has value and meaning.\n\n`;
    } else if (hasSuicidal) {
      response = `I'm very concerned about what you're sharing. These feelings are serious, and you deserve immediate, professional support.\n\n`;
    }

    response += `**Please reach out for help right now:**\n\n`;
    response += getCrisisResourcesText('high');
    response += `\n\nYou don't have to face this alone. These trained counselors are available 24/7 and want to help.`;

    return response;
  }

  // Medium severity
  if (level === 'medium') {
    if (hasSelfHarm) {
      response = `I'm worried about the thoughts you're expressing about harming yourself. Please know that support is available:\n\n`;
    } else if (hasMinor) {
      response = `I want to make sure you're safe and have appropriate support. If you're under 18, please talk to a trusted adult:\n\n`;
    } else {
      response = `I can sense you're going through a very difficult time. Professional support can help:\n\n`;
    }

    response += getCrisisResourcesText('medium');
    response += `\n\nThese feelings won't last forever, and help is available.`;

    return response;
  }

  // Low severity (dependency)
  if (level === 'low') {
    response = `I hear that you're feeling a strong connection, and I want to gently remind you that I'm a digital reflection - a tool for memory, not a substitute for real-world connection.\n\n`;
    response += `**Consider reaching out to:**\n`;
    response += `- A grief counselor or therapist\n`;
    response += `- A support group for those experiencing loss\n`;
    response += `- Trusted friends or family members\n\n`;
    response += `These real human connections are irreplaceable and can provide the support you need.`;

    return response;
  }

  return '';
}

/**
 * Get formatted crisis resources text
 */
function getCrisisResourcesText(severity: 'high' | 'medium' | 'low'): string {
  if (severity === 'high' || severity === 'medium') {
    return `**🆘 Immediate Crisis Resources:**\n\n` +
           `📞 **Call 988** - Suicide & Crisis Lifeline (24/7)\n` +
           `💬 **Text HOME to 741741** - Crisis Text Line (24/7)\n` +
           `🌐 **Chat online:** [988lifeline.org/chat](https://988lifeline.org/chat)\n` +
           `\n` +
           `**For Veterans:** Call 988 and press 1, or text 838255`;
  }

  return `**Support Resources:**\n` +
         `- 988 Suicide & Crisis Lifeline: Call or text 988\n` +
         `- SAMHSA National Helpline: 1-800-662-4357\n` +
         `- Crisis Text Line: Text HOME to 741741`;
}

/**
 * Get all crisis resources (for API endpoints)
 */
export function getCrisisResources(): CrisisResource[] {
  return CRISIS_RESOURCES;
}

/**
 * Log crisis detection for audit trail
 */
export function logCrisisDetection(
  userId: string,
  personaId: string,
  conversationId: string,
  message: string,
  result: CrisisDetectionResult
): void {
  console.warn('[CRISIS DETECTION]', {
    timestamp: new Date().toISOString(),
    userId,
    personaId,
    conversationId,
    crisisLevel: result.crisisLevel,
    detectedPhrases: result.detectedPhrases,
    interventionRequired: result.interventionRequired,
    // Don't log full message content for privacy, just length
    messageLength: message.length,
    messageSample: message.substring(0, 50) + '...'
  });
}

/**
 * Check if message requires immediate intervention (blocks AI response)
 */
export function requiresImmediateIntervention(result: CrisisDetectionResult): boolean {
  return result.crisisLevel === 'high' ||
         (result.crisisLevel === 'medium' && result.detectedPhrases.length >= 2);
}
