import { useState, useEffect } from "react";
import { Heart, MessageCircle, Clock, Shield, Mic, Play, Pause, Volume2, ArrowRight, ChevronLeft, CheckCircle, User, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Persona, OnboardingSession } from "@shared/schema";

interface InterviewStep {
  id: string;
  title: string;
  duration: string;
  description: string;
}

const interviewSteps: InterviewStep[] = [
  {
    id: 'setup',
    title: 'Pre-Interview Setup',
    duration: '2 minutes',
    description: 'Basic information and emotional check-in'
  },
  {
    id: 'interview',
    title: 'The Interview Experience',
    duration: '20-45 minutes',
    description: 'Natural conversation with AI interviewer Sarah'
  },
  {
    id: 'testing',
    title: 'Live Persona Testing',
    duration: '10 minutes',
    description: 'Try talking with the created persona'
  },
  {
    id: 'coordination',
    title: 'Family Coordination',
    duration: '5 minutes',
    description: 'Invite family members to add memories'
  }
];

export default function AIGuidedInterview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{speaker: string, message: string, timestamp: string}>>([]);
  const [userResponse, setUserResponse] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const progress = ((currentStep + 1) / interviewSteps.length) * 100;

  // Load existing onboarding session
  const { data: existingSession } = useQuery({
    queryKey: ['/api/onboarding-sessions/ai-guided-interview'],
    enabled: !!user?.id,
  });

  // Create persona mutation
  const createPersonaMutation = useMutation({
    mutationFn: async (personaData: any) => {
      const response = await apiRequest('POST', '/api/personas', personaData);
      return response.json();
    },
    onSuccess: (persona) => {
      setCurrentPersona(persona);
      queryClient.invalidateQueries({ queryKey: ['/api/personas'] });
    },
  });

  // Create onboarding session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/onboarding-sessions', sessionData);
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-sessions/ai-guided-interview'] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/onboarding-sessions/${sessionId}`, updates);
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-sessions/ai-guided-interview'] });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ personaId, file }: { personaId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/personas/${personaId}/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-Id': user?.id || '',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const openingQuestions = [
    "Tell me about the first time you remember really laughing with {name}",
    "What's a typical Saturday afternoon with them look like?",
    "If {name} walked into this room right now, what would they say?"
  ];

  const followUpQuestions = [
    "That sounds like such a special tradition. What made it different? Did they have any funny habits?",
    "I'm hearing that {name} was very {trait}. Can you give me an example of that?",
    "When you say they were {trait}, can you give me an example?",
    "Did {name} have any favorite phrases or expressions?",
    "How was {name} different with you versus with other family members?",
    "What made that moment so special to you both?"
  ];

  // Load existing session data
  useEffect(() => {
    if (existingSession && typeof existingSession === 'object' && 'id' in existingSession && existingSession.id) {
      const validSession = existingSession as OnboardingSession;
      setCurrentSession(validSession);
      const stepData = (validSession.stepData as any) || {};
      setPersonaName(stepData.personaName || '');
      setRelationship(stepData.relationship || '');
      setEmotionalState(stepData.emotionalState || '');
      setConversationHistory(stepData.conversationHistory || []);
      setCurrentQuestion(stepData.currentQuestion || '');
      if (validSession.currentStep) {
        const stepIndex = interviewSteps.findIndex(step => step.id === validSession.currentStep);
        if (stepIndex >= 0) {
          setCurrentStep(stepIndex);
        }
      }
      if (stepData.interviewStarted) {
        setInterviewStarted(stepData.interviewStarted);
      }
    }
  }, [existingSession]);

  useEffect(() => {
    if (interviewStarted && currentQuestion === '' && conversationHistory.length === 0) {
      // Start with a random opening question
      const randomQuestion = openingQuestions[Math.floor(Math.random() * openingQuestions.length)];
      setCurrentQuestion(randomQuestion.replace('{name}', personaName));
      
      // Add Sarah's introduction
      setConversationHistory([{
        speaker: 'Sarah',
        message: `Hello, I'm Sarah, and I'll be helping you share memories of ${personaName}. This will feel like talking to a friend who truly wants to understand who they were. We can pause anytime, and everything you share stays private until you decide otherwise. ${randomQuestion.replace('{name}', personaName)}`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [interviewStarted, personaName, conversationHistory.length]);

  const handleNextStep = async () => {
    if (currentStep < interviewSteps.length - 1) {
      const nextStep = currentStep + 1;
      const nextStepId = interviewSteps[nextStep]?.id;
      
      setCurrentStep(nextStep);

      // Update session progress in database
      if (currentSession && nextStepId) {
        try {
          await updateSessionMutation.mutateAsync({
            sessionId: currentSession.id,
            updates: {
              currentStep: nextStepId,
              stepData: {
                ...((currentSession.stepData as any) || {}),
                conversationHistory,
                currentQuestion,
                personaName,
                relationship,
                emotionalState,
                interviewStarted: true,
              },
            },
          });
        } catch (error) {
          console.error('Error updating session progress:', error);
        }
      }
    } else {
      // Complete the interview
      if (currentSession) {
        try {
          await updateSessionMutation.mutateAsync({
            sessionId: currentSession.id,
            updates: {
              isCompleted: true,
              currentStep: 'completed',
              stepData: {
                ...((currentSession.stepData as any) || {}),
                conversationHistory,
                currentQuestion,
                personaName,
                relationship,
                emotionalState,
                interviewStarted: true,
              },
            },
          });
        } catch (error) {
          console.error('Error completing session:', error);
        }
      }

      // Update persona status to completed
      if (currentPersona) {
        try {
          await apiRequest('PUT', `/api/personas/${currentPersona.id}`, {
            status: 'completed',
            onboardingData: {
              ...(currentPersona.onboardingData || {}),
              conversationHistory,
              completedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Error updating persona status:', error);
        }
      }

      toast({
        title: "Interview Complete!",
        description: `${personaName}'s persona has been created and is ready for your first conversation.`
      });
      setLocation('/dashboard');
    }
  };

  const handleStartInterview = async () => {
    if (!personaName || !relationship) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide the person's name and your relationship."
      });
      return;
    }

    setIsCreatingPersona(true);

    try {
      // Create persona
      const personaData = {
        name: personaName,
        relationship,
        onboardingApproach: 'ai-guided-interview',
        onboardingData: {
          emotionalState,
        },
      };

      const persona = await createPersonaMutation.mutateAsync(personaData);

      // Upload photo if selected
      if (selectedFile && persona.id) {
        await uploadPhotoMutation.mutateAsync({
          personaId: persona.id,
          file: selectedFile,
        });
      }

      // Create onboarding session and mark as completed immediately
      const sessionData = {
        approach: 'ai-guided-interview',
        currentStep: 'completed',
        isCompleted: true,
        stepData: {
          personaName,
          relationship,
          emotionalState,
          interviewStarted: true,
          conversationHistory: [],
          currentQuestion: '',
          completedAt: new Date().toISOString(),
        },
        personaId: persona.id,
      };

      await createSessionMutation.mutateAsync(sessionData);

      // Redirect to chat after successful persona creation
      toast({
        title: "Persona Created Successfully!",
        description: `${personaName} has been created and is ready. Start your first conversation!`
      });
      
      setLocation(`/chat/${persona.id}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start interview. Please try again."
      });
    } finally {
      setIsCreatingPersona(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) return;

    // Add user's response to conversation
    const newHistory = [...conversationHistory, {
      speaker: 'You',
      message: userResponse,
      timestamp: new Date().toISOString()
    }];

    // Generate Sarah's follow-up question
    const randomFollowUp = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    const traits = ['caring', 'funny', 'wise', 'stubborn', 'generous', 'creative'];
    const randomTrait = traits[Math.floor(Math.random() * traits.length)];
    const newQuestion = randomFollowUp.replace('{name}', personaName).replace('{trait}', randomTrait);
    
    // Update conversation history immediately
    setConversationHistory(newHistory);
    setUserResponse('');

    // Save conversation progress to database
    if (currentSession) {
      try {
        await updateSessionMutation.mutateAsync({
          sessionId: currentSession.id,
          updates: {
            stepData: {
              ...((currentSession.stepData as any) || {}),
              conversationHistory: newHistory,
              currentQuestion,
              personaName,
              relationship,
              emotionalState,
              interviewStarted: true,
            },
          },
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
    
    // Add Sarah's follow-up after delay
    setTimeout(async () => {
      const updatedHistory = [...newHistory, {
        speaker: 'Sarah',
        message: newQuestion,
        timestamp: new Date().toISOString()
      }];
      
      setConversationHistory(updatedHistory);
      setCurrentQuestion(newQuestion);

      // Save updated conversation with Sarah's response
      if (currentSession) {
        try {
          await updateSessionMutation.mutateAsync({
            sessionId: currentSession.id,
            updates: {
              stepData: {
                ...((currentSession.stepData as any) || {}),
                conversationHistory: updatedHistory,
                currentQuestion: newQuestion,
                personaName,
                relationship,
                emotionalState,
                interviewStarted: true,
              },
            },
          });
        } catch (error) {
          console.error('Error saving Sarah response:', error);
        }
      }
    }, 1500);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)."
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 10MB."
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleEmotionalPause = () => {
    toast({
      title: "Taking a moment",
      description: "It's completely natural to need breaks. Take all the time you need."
    });
    setConversationHistory([...conversationHistory, {
      speaker: 'Sarah',
      message: "I can see this is bringing up a lot of emotions. That's completely natural and shows how much love you have for them. Would you like to take a break, or shall we continue gently?",
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 bg-purple-300 rounded-full opacity-60"></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <MessageCircle className="w-3 h-3 mr-1" />
                AI-Guided Interview
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Memory Interview with Sarah</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3 mb-4" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {interviewSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Pre-Interview Setup */}
        {currentStep === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-purple-600" />
                <span>Pre-Interview Setup</span>
              </CardTitle>
              <p className="text-gray-600">
                I'm Sarah, and I'll be helping you share memories of your loved one. 
                This will feel like talking to a friend who truly wants to understand who they were. 
                We can pause anytime, and everything you share stays private until you decide otherwise.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="personaName" className="text-sm font-medium text-gray-700">Their name</Label>
                  <Input
                    id="personaName"
                    placeholder="What did you call them?"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                    data-testid="input-persona-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">Your relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g., mother, father, grandparent, friend"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                    data-testid="input-relationship"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Photo (optional)</Label>
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:border-purple-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                    data-testid="input-photo"
                  />
                  <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm text-gray-900 font-medium mb-1">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mb-3">File selected ({Math.round(selectedFile.size / 1024)}KB)</p>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-200"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Photo
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Share a favorite photo to help bring their memory to life</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-200"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        data-testid="button-choose-photo"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Emotional Check-in */}
              <div className="space-y-2">
                <Label htmlFor="emotionalState" className="text-sm font-medium text-gray-700">How are you feeling about sharing today?</Label>
                <Textarea
                  id="emotionalState"
                  placeholder="Take a moment to check in with yourself. There's no right or wrong way to feel..."
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                  data-testid="textarea-emotional-state"
                />
                <p className="text-xs text-gray-500">
                  This helps me understand how to best support you during our conversation.
                </p>
              </div>

              {/* Safety Information */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 mb-1">Your Emotional Safety</h4>
                    <p className="text-sm text-purple-700">
                      We can pause anytime if you need a break. Sarah is trained to detect when you might need support and will check in with you throughout our conversation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/onboarding">
                  <Button variant="outline" className="px-6">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <Button 
                  onClick={handleStartInterview}
                  disabled={isCreatingPersona || createPersonaMutation.isPending || createSessionMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                  data-testid="button-start-interview"
                >
                  {isCreatingPersona ? 'Creating Persona...' : 'Begin Interview'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: The Interview Experience */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Sarah Introduction */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Meet Sarah, Your Interview Guide</h3>
              <p className="text-gray-600 text-sm mb-3">
                Sarah is an empathetic AI trained in grief support and memory preservation. She'll guide you through sharing memories in a natural, supportive way, building your loved one's persona in real-time.
              </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>20-45 minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>Emotionally safe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Interface */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Memory Conversation</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmotionalPause}
                      className="text-purple-600 border-purple-200"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause if needed
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conversation History */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                  {conversationHistory.map((entry, index) => (
                    <div key={index} className={`flex ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        entry.speaker === 'You' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white border border-purple-100'
                      }`}>
                        <p className="text-sm">{entry.message}</p>
                        <p className={`text-xs mt-1 ${
                          entry.speaker === 'You' ? 'text-purple-100' : 'text-gray-400'
                        }`}>
                          {entry.speaker} • {(() => {
                            try {
                              return new Date(entry.timestamp).toLocaleTimeString();
                            } catch (error) {
                              return 'Invalid time';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Response Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Your response:</Label>
                  <Textarea
                    placeholder="Share your thoughts and memories..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                    data-testid="textarea-user-response"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                        className={isRecording ? 'text-red-600 border-red-200' : 'text-purple-600 border-purple-200'}
                      >
                        <Mic className="w-4 h-4 mr-1" />
                        {isRecording ? 'Stop Recording' : 'Voice Response'}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {isRecording ? 'Recording...' : 'Click to record your voice'}
                      </span>
                    </div>
                    <Button 
                      onClick={handleSubmitResponse}
                      disabled={!userResponse.trim() || updateSessionMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      data-testid="button-submit-response"
                    >
                      {updateSessionMutation.isPending ? '...' : <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress to Next Step */}
            {conversationHistory.length >= 6 && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Progress!</h3>
                  <p className="text-gray-600 mb-4">
                    Sarah has gathered enough memories to create an initial version of {personaName}'s persona. 
                    Ready to try talking with them?
                  </p>
                  <Button 
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
                    data-testid="button-test-persona"
                  >
                    Test the Persona
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Live Persona Testing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Introduction to Persona Testing */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Persona Created Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  Based on what you've shared, I've created an early version of {personaName}. 
                  Would you like to try talking to them? Remember, they'll get better as we add more memories.
                </p>
              </CardContent>
            </Card>

            {/* Persona Testing Interface */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Play className="w-6 h-6 text-purple-600" />
                  <span>First Conversation with {personaName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Persona First Message */}
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {personaName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-2">{personaName}</h4>
                      <p className="text-purple-800">
                        Hello, my dear. I'm still learning about who I was through the beautiful memories you've shared. 
                        It feels wonderful to be here with you again. What would you like to talk about?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Conversation */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Try having a brief conversation:</Label>
                  <Textarea
                    placeholder="Ask them a question or share something..."
                    className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                    data-testid="textarea-test-conversation"
                  />
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Send Message
                  </Button>
                </div>

                {/* Feedback Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">How does this feel? Feedback on accuracy:</Label>
                  <Textarea
                    placeholder="Does this sound like them? What feels right or needs adjustment?"
                    className="border-purple-200 focus:border-purple-400 min-h-[80px] bg-white"
                    data-testid="textarea-persona-feedback"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="px-6"
                    data-testid="button-back-to-interview"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Interview
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                    data-testid="button-continue-to-family"
                  >
                    Continue to Family Coordination
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Family Coordination */}
        {currentStep === 3 && (
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <User className="w-6 h-6 text-purple-600" />
                <span>Family Coordination</span>
              </CardTitle>
              <p className="text-gray-600">
                Who else might want to add their memories of {personaName}? 
                Each family member's contributions will make the persona richer and more complete for everyone.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Family Invitation */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Invite family members to contribute:</Label>
                <div className="space-y-3">
                  <Input
                    placeholder="Family member's email address"
                    className="border-purple-200 focus:border-purple-400"
                    data-testid="input-family-email"
                  />
                  <Input
                    placeholder="Their relationship to {personaName} (e.g., daughter, brother, grandchild)"
                    className="border-purple-200 focus:border-purple-400"
                    data-testid="input-family-relationship"
                  />
                  <Button variant="outline" className="w-full border-purple-200 text-purple-600">
                    <User className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>

              {/* What they'll receive */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">What will they receive?</h4>
                <p className="text-sm text-indigo-700 mb-2">
                  Automated invitations with context about what's already been shared, plus:
                </p>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Simple interface to add their own memories</li>
                  <li>• Access to interact with {personaName}'s persona</li>
                  <li>• Notifications when new memories are added</li>
                </ul>
              </div>

              {/* Permission Settings */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h4 className="text-sm font-medium text-purple-900 mb-3">Permission settings for what each family member can access:</h4>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 text-sm">
                    <input type="checkbox" className="rounded border-purple-300 mt-0.5" defaultChecked />
                    <div>
                      <span className="font-medium">View shared memories</span>
                      <p className="text-purple-600 text-xs">Family members can see memories you've marked as shareable</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 text-sm">
                    <input type="checkbox" className="rounded border-purple-300 mt-0.5" defaultChecked />
                    <div>
                      <span className="font-medium">Add new memories</span>
                      <p className="text-purple-600 text-xs">Let family members contribute their own memories and stories</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 text-sm">
                    <input type="checkbox" className="rounded border-purple-300 mt-0.5" defaultChecked />
                    <div>
                      <span className="font-medium">Talk with {personaName}</span>
                      <p className="text-purple-600 text-xs">Allow private conversations between family members and the persona</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  className="px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                  data-testid="button-complete-interview"
                >
                  Complete Interview Process
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}