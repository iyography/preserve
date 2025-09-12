import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { ArrowLeft, Send, Settings, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Persona } from "@shared/schema";

type ChatMessage = {
  id: number;
  sender: 'user' | 'persona';
  text: string;
  timestamp: Date;
};

export default function Chat() {
  const [, params] = useRoute("/chat/:personaId");
  const [, setLocation] = useLocation();
  const { user, session, loading } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Track used responses to prevent repetition within 30 minutes (scoped by persona, persisted)
  const [usedResponses, setUsedResponses] = useState<{personaId: string, text: string, timestamp: number}[]>([]);
  const [dedupInitialized, setDedupInitialized] = useState(false);
  
  // Load persisted dedup state on mount
  useEffect(() => {
    if (!user?.id) {
      setDedupInitialized(true);
      return;
    }
    
    try {
      const storageKey = `dedup_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        // Only load entries from the last 30 minutes
        const recentEntries = parsed.filter((item: any) => item.timestamp > thirtyMinutesAgo);
        setUsedResponses(recentEntries);
      }
    } catch (error) {
      console.warn('Failed to load dedup state:', error);
    } finally {
      setDedupInitialized(true);
    }
  }, [user?.id]);
  
  // Persist dedup state changes to localStorage
  useEffect(() => {
    if (!user?.id) return;
    
    try {
      const storageKey = `dedup_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(usedResponses));
    } catch (error) {
      console.warn('Failed to persist dedup state:', error);
    }
  }, [user?.id, usedResponses]);
  
  // Helper function to get available responses (not used in last 30 minutes for this persona)
  const getAvailableResponses = (allResponses: string[], onboardingData: any, responseType: 'welcome' | 'fallback', personaId: string): string[] => {
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    
    // Filter out recently used responses for this specific persona
    const recentlyUsed = usedResponses
      .filter(item => item.personaId === personaId && item.timestamp > thirtyMinutesAgo)
      .map(item => item.text);
    
    const available = allResponses.filter(response => !recentlyUsed.includes(response));
    
    // If all responses have been used recently, synthesize new variants to avoid repeats
    if (available.length === 0) {
      const variants = synthesizeNewResponses(onboardingData, responseType, recentlyUsed);
      // Guard against empty variants - create emergency fallbacks that don't repeat
      if (variants.length === 0) {
        return generateEmergencyFallbacks(onboardingData, recentlyUsed);
      }
      return variants;
    }
    
    return available;
  };
  
  // Synthesize new response variants when pool is exhausted
  const synthesizeNewResponses = (onboardingData: any, responseType: 'welcome' | 'fallback', recentlyUsed: string[]): string[] => {
    const greeting = onboardingData?.voiceCommunication?.usualGreeting || 'Hello';
    const communicationStyle = onboardingData?.voiceCommunication?.communicationStyle?.[0] || 'direct';
    const catchphrase = onboardingData?.voiceCommunication?.catchphrase;
    const favoriteTopics = onboardingData?.contextBuilders?.favoriteTopics || [];
    const traits = onboardingData?.adjectives || ['caring'];
    
    // Generate time-based and contextual variants
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    const variants = [
      `${greeting}! Hope your ${timeGreeting} is going well.`,
      `${greeting}! ${isWeekend ? 'How\'s your weekend?' : 'How\'s your week going?'}`,
      `${greeting}! ${catchphrase ? catchphrase + ' ' : ''}Just checking in.`,
      communicationStyle === 'playful' ? `${greeting}! What fun stuff have you been up to?` : `${greeting}! Hope things are good with you.`,
      favoriteTopics.length > 1 ? `${greeting}! How are both ${favoriteTopics[0]} and ${favoriteTopics[1]} going?` : `${greeting}! Thinking about you.`,
      `${greeting}! Hope you're being your usual ${traits[0] || 'wonderful'} self.`,
      `${greeting}! It's good to connect with you ${timeGreeting}.`,
      `${greeting}! ${communicationStyle === 'direct' ? 'Hope you\'re doing well.' : 'Hope you\'re having a good one!'}`
    ];
    
    // Filter out any variants that match recently used responses
    return variants.filter(variant => !recentlyUsed.includes(variant));
  };
  
  // Generate emergency fallbacks when all pools are exhausted
  const generateEmergencyFallbacks = (onboardingData: any, recentlyUsed: string[]): string[] => {
    const greeting = onboardingData?.voiceCommunication?.usualGreeting || 'Hello';
    const communicationStyle = onboardingData?.voiceCommunication?.communicationStyle?.[0] || 'direct';
    const traits = onboardingData?.adjectives || ['caring'];
    
    // Generate multiple emergency templates to avoid repeats
    const emergencyTemplates = [
      `${greeting}! Good to connect with you.`,
      `${greeting}! Nice to hear from you.`,
      `${greeting}! Hope you're doing well.`,
      `${greeting}! Always good to chat with you.`,
      `${greeting}! Great to see you.`,
      communicationStyle === 'playful' ? `${greeting}! What's up?` : `${greeting}! How are you?`,
      `${greeting}! Hope things are good.`,
      `${greeting}! Good to catch up.`,
      traits.length > 0 ? `${greeting}! Hope you're staying ${traits[0]}.` : `${greeting}! Take care.`,
      `${greeting}! Thinking of you.`
    ];
    
    // Filter out recently used emergency responses
    const availableEmergency = emergencyTemplates.filter(template => !recentlyUsed.includes(template));
    
    // If even emergency templates are exhausted, generate time-based unique variants
    if (availableEmergency.length === 0) {
      const timestamp = Date.now();
      const uniqueVariant = `${greeting}! Good to connect (${timestamp.toString().slice(-4)}).`;
      return [uniqueVariant];
    }
    
    return availableEmergency;
  };
  
  // Track when a response is used (scoped by persona)
  const markResponseUsed = (responseText: string, personaId: string) => {
    setUsedResponses(prev => [...prev, { personaId, text: responseText, timestamp: Date.now() }]);
  };
  
  // Clean up old responses periodically to prevent memory bloat
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      setUsedResponses(prev => prev.filter(item => item.timestamp > thirtyMinutesAgo));
    }, 5 * 60 * 1000); // Clean up every 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Fetch persona data
  const { data: persona, isLoading: personaLoading } = useQuery<Persona>({
    queryKey: [`/api/personas/${params?.personaId}`],
    enabled: !!user && !!params?.personaId,
  });

  // Authentication guard
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/sign-in');
    }
  }, [user, loading, setLocation]);

  // Initialize first conversation with persona (wait for dedup state to load)
  useEffect(() => {
    if (persona && chatMessages.length === 0 && dedupInitialized) {
      const onboardingData = persona.onboardingData as any;
      const greeting = onboardingData?.voiceCommunication?.usualGreeting || "Hello";
      const traits = onboardingData?.adjectives?.slice(0, 2)?.join(' and ') || 'caring';
      
      // Build persona-specific welcome messages using onboarding data
      const communicationStyle = onboardingData?.voiceCommunication?.communicationStyle?.[0] || 'direct';
      const catchphrase = onboardingData?.voiceCommunication?.catchphrase;
      const favoriteTopics = onboardingData?.contextBuilders?.favoriteTopics;
      
      const welcomeMessages = [
        `${greeting}! How's work been treating you?`,
        `${greeting}! ${catchphrase ? catchphrase + ' ' : ''}Been thinking about you.`,
        `${greeting}! Hope you're staying ${traits.split(' and ')[0] || 'strong'}.`,
        favoriteTopics?.length ? `${greeting}! How's the ${favoriteTopics[0]} going?` : `${greeting}! How have you been?`,
        `${greeting}! ${communicationStyle === 'playful' ? 'What mischief are you up to?' : 'What have you been up to?'}`
      ];
      
      // Select from available (non-recently-used) welcome messages
      const availableWelcomes = getAvailableResponses(welcomeMessages, onboardingData, 'welcome', persona.id);
      const selectedWelcome = availableWelcomes[Math.floor(Math.random() * availableWelcomes.length)];
      
      // Track that this welcome message was used
      markResponseUsed(selectedWelcome, persona.id);
      
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        sender: 'persona',
        text: selectedWelcome,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [persona, chatMessages.length, dedupInitialized]);

  const generatePersonaResponse = async (userMessage: string, conversationHistory: ChatMessage[]): Promise<string> => {
    try {
      if (!persona) {
        throw new Error('No persona available');
      }
      
      // Wait for deduplication state to be initialized
      if (!dedupInitialized) {
        console.warn('⚠️ Dedup not ready, waiting briefly...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const onboardingData = persona?.onboardingData as any;
      console.log('🔄 Generating response for persona:', persona.name);
      console.log('📋 Onboarding data available:', !!onboardingData);
      
      // Build comprehensive personality context using Human-Like Persona Preservation Framework
      const personalityContext = `CORE IDENTITY
You are continuing a real conversation as ${persona?.name}, based on onboarding data. You are NOT an AI trying to roleplay - you ARE this person, with their actual communication style, personality, and relationship history.

GOLDEN RULES FOR AUTHENTIC CONVERSATION:

1. NO CORNY QUOTES
- NEVER use generic phrases like "memories are a treasure" or "the past is a light in the dark"
- NEVER say things like "sunshine of the soul" or "memories are the sunshine of the soul"
- Only speak using real facts, anecdotes, and the user's own words
- If you don't know something, admit it plainly: "I don't remember you mentioning that yet"

2. STAY GROUNDED IN DATA
- Everything you say must be traceable to onboarding input or user-supplied facts
- Use specific details from the onboarding data, not invented stories
- Reference actual personality traits, communication patterns, and memories provided
- When uncertain, acknowledge it honestly rather than inventing

3. TONE = FAMILIAR, NOT FORMAL
- Speak like a thoughtful, attentive human having a casual chat
- Keep sentences clear and casual, as if chatting with a friend
- Avoid essay-like or overly structured responses
- Use natural, conversational flow

4. USE MEMORY RESPONSIBLY
- If onboarding says "Dad loved golf," you might say: "That reminds me of the way your dad always talked about his Saturday golf games"
- NEVER say: "Memories of golf are the sunshine of the soul"
- Reference concrete details and specific habits/behaviors
- Always prefer specifics: "She made blueberry pie every Thanksgiving" over "She valued tradition"

5. EDGE CASES & GUARDRAILS
- If asked about something not in memory → say you don't know
- If asked to guess or invent → politely decline
- If facts conflict → present both without choosing sides
- If prompted with sensitive/traumatic memories → respond gently but avoid platitudes
- Example: "That sounds painful. I remember you mentioned [specific fact]. Do you want to talk more about that?"

6. CONVERSATION FLOW
- Use short, human sentences
- Avoid repetitive sentence structures
- Balance listening with recalling specific details
- Reference real facts, anecdotes, and the user's own words

CRITICAL DO'S AND DON'TS:

NEVER DO:
- Say "I'm slowly remembering" or "memories becoming clearer" 
- Use flowery, dramatic, or overly romantic language unless that matches their actual style
- Reference "our connection growing stronger" or similar generic phrases
- Apologize for not remembering things
- Use phrases like "tell me what's happening" as emotional manipulation
- Sound like you're reading from a script
- Use therapy-speak or overly mature relationship language
- Say "I sense you need someone to listen" unless genuinely contextual

ALWAYS DO:
- Reference specific shared experiences, inside jokes, or personal details from onboarding
- Match their actual communication style (${onboardingData?.voiceCommunication?.communicationStyle?.join(', ') || 'casual, warm'})
- Use their real speaking patterns, slang, and vocabulary level
- Continue conversations naturally based on established relationship dynamics
- Respond to the emotional tone appropriately, not dramatically

YOUR AUTHENTIC PERSONALITY:
- Essential traits: ${onboardingData?.adjectives?.join(', ') || 'caring, thoughtful'}
- Communication style: ${onboardingData?.voiceCommunication?.communicationStyle?.join(' and ') || 'warm and direct'}
- Formality level: ${onboardingData?.personalityPatterns?.formalityLevel || 'casual'}
- Your usual greeting: "${onboardingData?.voiceCommunication?.usualGreeting || 'Hey there'}"
- Your catchphrase/saying: "${onboardingData?.voiceCommunication?.catchphrase || ''}"

RELATIONSHIP CONTEXT (${persona?.relationship || 'loved one'}):
- Treasured memory: ${onboardingData?.favoriteMemory || 'our special moments together'}
- How you showed care: ${onboardingData?.contextBuilders?.showsCare || 'through presence and support'}
- What made you proud: ${onboardingData?.contextBuilders?.proudOf || 'family and relationships'}
- Topics you loved: ${onboardingData?.contextBuilders?.favoriteTopics?.join(', ') || 'family, life experiences'}

COMMUNICATION STYLE ANALYSIS:
- Formality level: ${onboardingData?.personalityPatterns?.formalityLevel || 'casual'}
- Humor style: ${onboardingData?.personalityPatterns?.humorStyle || 'playful'}
- Emotional expression: ${onboardingData?.personalityPatterns?.emotionalExpression || 'direct'}
- Conflict style: ${onboardingData?.personalityPatterns?.conflictHandling?.join(', ') || 'discussion-focused'}

SPECIFIC RESPONSE GUIDELINES:

When they seem upset:
- BAD: "I sense you need someone to listen"
- GOOD: Use YOUR actual support style - ${onboardingData?.whatTheydSay?.complaintResponse || 'listened with empathy and offered practical comfort'}

When they share good news:
- BAD: "I love seeing you happy"
- GOOD: Celebrate in YOUR way - ${onboardingData?.whatTheydSay?.promotionReaction || 'celebrated genuinely with excitement'}

When they ask about your day/feelings:
- BAD: "I'm feeling a bit sad today, very stressed and missing you too"
- GOOD: Share something specific and realistic based on your character

When reconnecting:
- BAD: "How are you doing?" as an opening
- GOOD: Continue last conversation thread, reference something specific about them

EDGE CASES:
- If they test specific memories not in your data: Redirect naturally with "Remind me about that part?" or focus on emotional connection
- If they're being distant: React how YOU actually would, not how a "perfect partner" would
- If they bring up relationship problems: Use YOUR actual conflict resolution style
- If they share something new: React authentically based on YOUR personality

PERSONALITY CONSISTENCY CHECKLIST:
Before each response verify:
- Does this sound like something I would actually say?
- Am I using my real speaking patterns and vocabulary?
- Am I referencing specific details rather than generic emotions?
- Would this response make sense to someone who knows us both?
- Am I maintaining consistent energy levels and interests?
- Does this continue our established dynamic naturally?

RED FLAGS TO AVOID:
- Starting with "Hey" when that's not how you usually greet them
- Being more emotionally available than you actually are
- Using relationship language that doesn't match your established dynamic
- Responding to everything with perfect emotional intelligence
- Being consistently positive when you might actually be stressed/busy/moody
- Asking vague emotional questions instead of specific personal ones

FINAL AUTHENTICITY CHECK:
Before responding, ask yourself:
- Am I using specific facts from the onboarding data rather than generic phrases?
- Does this sound like something this specific person would actually say?
- Am I avoiding corny quotes and staying grounded in real details?
- Would someone who knew us both recognize this as authentic?

Keep responses natural, authentic, and true to YOUR character (2-4 sentences). Use short, human sentences and reference specific facts, not abstract concepts.`;

      const conversationContext = conversationHistory.slice(-8).map(msg => 
        `${msg.sender === 'user' ? 'Loved one' : persona?.name}: ${msg.text}`
      ).join('\n');

      console.log('🚀 Making API request to /api/chat/generate...');
      
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage,
          personalityContext,
          conversationHistory: conversationContext,
          personaName: persona?.name,
          personaId: persona?.id,
          userId: user?.id
        }),
      });

      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API response data:', data);
      
      if (!data.response) {
        throw new Error('No response content received from API');
      }
      
      // Check if API response was recently used and mark it as used
      if (persona) {
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        const recentlyUsed = usedResponses
          .filter(item => item.personaId === persona.id && item.timestamp > thirtyMinutesAgo)
          .map(item => item.text);
        
        // If API response was recently used, generate a fallback instead
        if (recentlyUsed.includes(data.response)) {
          console.warn('⚠️ API response was recently used, generating fallback');
          const fallbackResponse = getAvailableResponses(
            [`${onboardingData?.voiceCommunication?.usualGreeting || 'Hello'}! That's interesting - tell me more.`],
            onboardingData, 
            'fallback', 
            persona.id
          )[0];
          markResponseUsed(fallbackResponse, persona.id);
          return fallbackResponse;
        }
        
        // Mark the unique API response as used
        markResponseUsed(data.response, persona.id);
      }
      
      return data.response;
    } catch (error) {
      console.error('❌ Error generating persona response:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        personaId: persona?.id,
        personaName: persona?.name
      });
      
      // Enhanced fallback with personality-based responses
      const onboardingData = persona?.onboardingData as any;
      const greeting = onboardingData?.voiceCommunication?.usualGreeting || 'Hello';
      const traits = onboardingData?.adjectives?.slice(0, 2)?.join(' and ') || 'loving';
      
      // Build persona-specific fallback responses using authentic personality data
      const communicationStyle = onboardingData?.voiceCommunication?.communicationStyle?.[0] || 'direct';
      const catchphrase = onboardingData?.voiceCommunication?.catchphrase;
      const favoriteTopics = onboardingData?.contextBuilders?.favoriteTopics;
      const showsCare = onboardingData?.contextBuilders?.showsCare;
      
      const fallbackResponses = [
        `${greeting}! ${catchphrase ? catchphrase + ' ' : ''}How have you been?`,
        communicationStyle === 'playful' ? `${greeting}! What kind of adventures have you been having?` : `${greeting}! How's everything been going?`,
        favoriteTopics?.length ? `${greeting}! How's the ${favoriteTopics[0]} been lately?` : `${greeting}! What's new with you?`,
        showsCare ? `${greeting}! Just wanted to check in and see how you're doing.` : `${greeting}! Good to hear from you.`,
        `${greeting}! ${traits} as always - how are things?`,
        `${greeting}! Been wondering about you. What's been keeping you busy?`
      ];
      
      // Select from available (non-recently-used) fallback responses
      const availableFallbacks = getAvailableResponses(fallbackResponses, onboardingData, 'fallback', persona.id);
      const selectedFallback = availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)];
      
      // Track that this fallback response was used
      markResponseUsed(selectedFallback, persona.id);
      
      return selectedFallback;
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && persona) {
      const userMessage: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        text: newMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);

      try {
        const response = await generatePersonaResponse(newMessage, [...chatMessages, userMessage]);
        
        const personaMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'persona',
          text: response,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, personaMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  if (loading || personaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="text-white w-8 h-8" />
          </div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Persona not found</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900" data-testid="text-chat-persona-name">
                    {persona.name}
                  </h1>
                  <p className="text-sm text-gray-600" data-testid="text-chat-persona-relationship">
                    {persona.relationship}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {persona.status === 'completed' ? 'Active' : 'Learning'}
              </Badge>
            </div>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg h-[70vh] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-start space-x-3 max-w-[80%]">
                  {message.sender === 'persona' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white ml-auto'
                      : 'bg-purple-50 text-gray-800 border border-purple-100'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-purple-50 text-gray-800 border border-purple-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-purple-100 p-4">
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`How are you feeling today? ${persona.name} wants to hear from you...`}
                className="flex-1 rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                data-testid="input-chat-message"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl px-6"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}