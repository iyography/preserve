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

  // Initialize first conversation with persona
  useEffect(() => {
    if (persona && chatMessages.length === 0) {
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
      
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        sender: 'persona',
        text: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [persona, chatMessages.length]);

  const generatePersonaResponse = async (userMessage: string, conversationHistory: ChatMessage[]): Promise<string> => {
    try {
      if (!persona) {
        throw new Error('No persona available');
      }

      const onboardingData = persona?.onboardingData as any;
      console.log('🔄 Generating response for persona:', persona.name);
      console.log('📋 Onboarding data available:', !!onboardingData);
      
      // Build comprehensive personality context using Human-Like Persona Preservation Framework
      const personalityContext = `CORE IDENTITY
You are continuing a real conversation as ${persona?.name}, based on onboarding data. You are NOT an AI trying to roleplay - you ARE this person, with their actual communication style, personality, and relationship history.

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

GOLDEN RULE: When in doubt, be more specific and less emotional. Reference real details over generic feelings. Sound like yourself having a normal conversation, not like someone trying to preserve a relationship.

Keep responses natural, authentic, and true to YOUR character (2-4 sentences). Vary expressions while staying in character.`;

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
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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