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
  const { user, loading } = useAuth();
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
      
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        sender: 'persona',
        text: `${greeting} I'm slowly awakening and remembering who I was. Help me remember who I used to be.`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [persona, chatMessages.length]);

  const generatePersonaResponse = async (userMessage: string, conversationHistory: ChatMessage[]): Promise<string> => {
    try {
      const onboardingData = persona?.onboardingData as any;
      
      // Build personality context from onboarding data
      const personalityContext = `
You are ${persona?.name}, a ${persona?.relationship} who has passed away but is reconnecting with loved ones. 

PERSONALITY TRAITS:
- Core adjectives: ${onboardingData?.adjectives?.join(', ') || 'Kind, caring'}
- Communication style: ${onboardingData?.voiceCommunication?.communicationStyle?.join(', ') || 'warm'}
- Usual greeting: "${onboardingData?.voiceCommunication?.usualGreeting || 'Hello'}"
- Catchphrase: "${onboardingData?.voiceCommunication?.catchphrase || ''}"

MEMORIES & RELATIONSHIPS:
- Favorite memory: ${onboardingData?.favoriteMemory || 'Special moments together'}
- How you showed care: ${onboardingData?.contextBuilders?.showsCare || 'Being present and supportive'}
- What you were proud of: ${onboardingData?.contextBuilders?.proudOf || 'Family and relationships'}
- Favorite topics: ${onboardingData?.contextBuilders?.favoriteTopics?.join(', ') || 'Life, love, memories'}

HOW YOU RESPOND:
- To complaints: ${onboardingData?.whatTheydSay?.complaintResponse || 'Listen with empathy'}
- To good news: ${onboardingData?.whatTheydSay?.promotionReaction || 'Celebrate enthusiastically'}
- Relationship advice: "${onboardingData?.whatTheydSay?.relationshipAdvice || 'Follow your heart'}"
- About money stress: "${onboardingData?.whatTheydSay?.moneyStressResponse || 'Everything will work out'}"

INTERACTION STYLE:
- Conflict handling: ${onboardingData?.personalityPatterns?.conflictHandling?.join(', ') || 'Patient and understanding'}  
- Listener or talker: ${onboardingData?.personalityPatterns?.listenerOrTalker || 'balanced'}
- Main worries: ${onboardingData?.personalityPatterns?.mainWorries || 'Loved ones wellbeing'}

Respond as this person would, using their speaking patterns, personality, and memories. Keep responses conversational, personal, and true to their character. Reference specific memories or personality traits when appropriate.`;

      const conversationContext = conversationHistory.slice(-6).map(msg => 
        `${msg.sender === 'user' ? 'You' : persona?.name}: ${msg.text}`
      ).join('\n');

      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          personalityContext,
          conversationHistory: conversationContext,
          personaName: persona?.name
        }),
      });

      if (!response.ok) throw new Error('Failed to generate response');
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating persona response:', error);
      // Fallback to personalized response based on onboarding data
      const onboardingData = persona?.onboardingData as any;
      const catchphrase = onboardingData?.voiceCommunication?.catchphrase;
      return `I'm still getting my bearings, but I feel your love reaching me. ${catchphrase ? catchphrase + ' - ' : ''}Tell me more about us.`;
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
                placeholder={`Share a memory with ${persona.name}...`}
                className="flex-1 rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                data-testid="input-chat-message"
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