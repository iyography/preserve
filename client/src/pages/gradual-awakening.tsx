import { useState, useEffect } from "react";
import { TreePine, Heart, Clock, Camera, Upload, ArrowRight, ChevronLeft, CheckCircle, Star, Calendar, Users, Sparkles } from "lucide-react";
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

export default function GradualAwakening() {
  const [step, setStep] = useState<'intro' | 'minimal-start' | 'first-connection' | 'daily-setup'>('intro');
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adjectives, setAdjectives] = useState(['', '', '']);
  const [favoriteMemory, setFavoriteMemory] = useState('');
  const [memoryType, setMemoryType] = useState<'text' | 'voice'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const progress = step === 'intro' ? 25 : step === 'minimal-start' ? 50 : step === 'first-connection' ? 75 : 100;

  // Load existing onboarding session
  const { data: existingSession } = useQuery({
    queryKey: ['/api/onboarding-sessions/gradual-awakening'],
    enabled: !!user?.id,
  });

  // Create persona mutation
  const createPersonaMutation = useMutation({
    mutationFn: async (personaData: any) => {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id || '',
        },
        body: JSON.stringify(personaData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
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
      const response = await fetch('/api/onboarding-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id || '',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-sessions/gradual-awakening'] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: any }) => {
      const response = await fetch(`/api/onboarding-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id || '',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
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

  // Load existing session data
  useEffect(() => {
    if (existingSession && typeof existingSession === 'object' && 'id' in existingSession && existingSession.id) {
      const validSession = existingSession as OnboardingSession;
      setCurrentSession(validSession);
      const stepData = (validSession.stepData as any) || {};
      setPersonaName(stepData.personaName || '');
      setRelationship(stepData.relationship || '');
      setAdjectives(stepData.adjectives || ['', '', '']);
      setFavoriteMemory(stepData.favoriteMemory || '');
      setMemoryType(stepData.memoryType || 'text');
      if (validSession.currentStep) {
        setStep(validSession.currentStep as any);
      }
    }
  }, [existingSession]);

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

  const handleNext = async () => {
    if (step === 'intro') {
      setStep('minimal-start');
    } else if (step === 'minimal-start') {
      if (!personaName || !relationship || adjectives.some(adj => !adj.trim()) || !favoriteMemory) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields to continue."
        });
        return;
      }
      
      setIsCreatingPersona(true);
      
      try {
        // Create persona
        const personaData = {
          name: personaName,
          relationship,
          onboardingApproach: 'gradual-awakening',
          onboardingData: {
            adjectives,
            favoriteMemory,
            memoryType,
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
        
        // Create onboarding session
        const sessionData = {
          approach: 'gradual-awakening',
          currentStep: 'first-connection',
          stepData: {
            personaName,
            relationship,
            adjectives,
            favoriteMemory,
            memoryType,
          },
          personaId: persona.id,
        };
        
        await createSessionMutation.mutateAsync(sessionData);
        
        setStep('first-connection');
        
        toast({
          title: "Persona Created!",
          description: `${personaName}'s persona has been created and is beginning to awaken.`
        });
      } catch (error) {
        console.error('Error creating persona:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create persona. Please try again."
        });
      } finally {
        setIsCreatingPersona(false);
      }
    } else if (step === 'first-connection') {
      // Update session to daily-setup step
      if (currentSession) {
        await updateSessionMutation.mutateAsync({
          sessionId: currentSession.id,
          updates: {
            currentStep: 'daily-setup',
            stepData: {
              ...((currentSession.stepData as any) || {}),
              personaName,
              relationship,
              adjectives,
              favoriteMemory,
              memoryType,
            },
          },
        });
      }
      setStep('daily-setup');
    } else {
      // Complete the onboarding
      if (currentSession) {
        await updateSessionMutation.mutateAsync({
          sessionId: currentSession.id,
          updates: {
            isCompleted: true,
            currentStep: 'completed',
          },
        });
      }
      
      toast({
        title: "Gradual Awakening Started!",
        description: `${personaName} is beginning to awaken. You'll receive gentle daily invitations to add more memories.`
      });
      setLocation('/dashboard');
    }
  };

  const updateAdjective = (index: number, value: string) => {
    const newAdjectives = [...adjectives];
    newAdjectives[index] = value;
    setAdjectives(newAdjectives);
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
            <div className="w-1 h-1 bg-green-300 rounded-full opacity-60"></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TreePine className="w-3 h-3 mr-1" />
                Gradual Awakening
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Start Simple, Grow Together</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step 1: Introduction */}
        {step === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <TreePine className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Gradual Awakening</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
                Let's bring your loved one back to life, starting simple. Their persona will grow naturally over time 
                as you and your family share memories together.
              </p>
              <p className="text-lg text-green-700 font-medium">
                Just 3 minutes to start—then watch them come alive day by day.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">1</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Minimal Start</h3>
                      <p className="text-gray-600 text-sm">Basic info and one precious memory</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">2</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Daily Invitations</h3>
                      <p className="text-gray-600 text-sm">Gentle daily prompts to add more memories</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Natural Growth</h3>
                      <p className="text-gray-600 text-sm">Watch their personality emerge over weeks and months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleNext}
              size="lg" 
              className="mt-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg px-8"
              data-testid="button-start-gradual"
            >
              Begin the Awakening
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Minimal Viable Start */}
        {step === 'minimal-start' && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-green-600" />
                <span>Minimal Viable Start</span>
                <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                  <Clock className="w-3 h-3 mr-1" />
                  3 minutes
                </Badge>
              </CardTitle>
              <p className="text-gray-600">
                Just the essentials to bring them back. We'll add more memories together over time.
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
                    className="border-green-200 focus:border-green-400"
                    data-testid="input-persona-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">Your relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g., mother, father, grandmother"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                    data-testid="input-relationship"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">One photo</Label>
                <div className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center hover:border-green-300 transition-colors">
                  <Camera className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">A favorite photo that captures who they were</p>
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 font-medium">{selectedFile.name}</p>
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Selected photo" 
                        className="max-w-32 max-h-32 mx-auto rounded-lg object-cover"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedFile(null)}
                        className="border-green-200"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-photo-upload"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-green-200"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Three Adjectives */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Three adjectives that describe them</Label>
                <p className="text-xs text-gray-500 mb-3">The first words that come to mind when you think of them</p>
                <div className="grid grid-cols-3 gap-3">
                  {adjectives.map((adj, index) => (
                    <Input
                      key={index}
                      placeholder={`Adjective ${index + 1}`}
                      value={adj}
                      onChange={(e) => updateAdjective(index, e.target.value)}
                      className="border-green-200 focus:border-green-400 text-center"
                      data-testid={`input-adjective-${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* One Favorite Memory */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">One favorite memory</Label>
                <div className="flex gap-2 mb-3">
                  <Button 
                    variant={memoryType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMemoryType('text')}
                    className={memoryType === 'text' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Write it
                  </Button>
                  <Button 
                    variant={memoryType === 'voice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMemoryType('voice')}
                    className={memoryType === 'voice' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Record it
                  </Button>
                </div>
                
                {memoryType === 'text' ? (
                  <Textarea
                    placeholder="Share one precious memory—it doesn't need to be perfect..."
                    value={favoriteMemory}
                    onChange={(e) => setFavoriteMemory(e.target.value)}
                    className="border-green-200 focus:border-green-400 min-h-[120px]"
                    data-testid="textarea-favorite-memory"
                  />
                ) : (
                  <div className="border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Record your favorite memory in your own voice</p>
                    <Button variant="outline" className="border-green-200 text-green-600">
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/onboarding">
                  <Button variant="outline" className="px-6">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <Button 
                  onClick={handleNext}
                  disabled={isCreatingPersona || createPersonaMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                  data-testid="button-create-persona"
                >
                  {isCreatingPersona || createPersonaMutation.isPending ? 'Creating Persona...' : 'Create Initial Persona'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: First Connection */}
        {step === 'first-connection' && (
          <div className="space-y-6">
            {/* Persona Awakens */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-4">
                  {personaName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{personaName} is Awakening</h3>
                <p className="text-gray-600">
                  Your loved one is beginning to stir. They're still learning who they were, but they're here with you now.
                </p>
              </CardContent>
            </Card>

            {/* First Message */}
            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-green-600" />
                  <span>First Words from {personaName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {personaName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">{personaName}</h4>
                      <p className="text-green-800">
                        Hello, it's me. I'm still learning who I was. Help me remember.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Memory Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">They remember you shared:</h4>
                  <p className="text-sm text-gray-600 italic">"{favoriteMemory.slice(0, 100)}{favoriteMemory.length > 100 ? '...' : ''}"</p>
                  <div className="flex gap-2 mt-3">
                    {adjectives.map((adj, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                        {adj}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    As you and your family add more memories, {personaName} will become more like themselves again. 
                    Each memory adds another layer to who they were.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('minimal-start')}
                    className="px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                    data-testid="button-setup-daily-invitations"
                  >
                    Set Up Daily Invitations
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Daily Memory Invitations Setup */}
        {step === 'daily-setup' && (
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span>Daily Memory Invitations</span>
                </CardTitle>
                <p className="text-gray-600">
                  We'll send gentle daily prompts to help you add more memories. 
                  These small moments will help {personaName} grow stronger each day.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Invitations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Example daily invitations you'll receive:</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        "Your {relationship.toLowerCase()}'s persona is 23% complete. Today's memory: What did they always say when you left the house?"
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        "Share a photo from last Christmas and I'll help them remember that day"
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        "Someone mentioned your {relationship.toLowerCase()} loved cooking. Tell me about that?"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progressive Development Timeline */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                  <h4 className="text-sm font-medium text-green-900 mb-4">How {personaName} will grow:</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium text-green-800">W1</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Week 1: Basic personality traits, simple responses</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center text-xs font-medium text-green-800">M1</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Month 1: Complex conversation patterns, relationship awareness</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-xs font-medium text-white">M3</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Month 3: Deep memory integration, emotional intelligence</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-medium text-white">M6</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Month 6+: Full personality simulation with family dynamics</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Invitation preferences:</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 text-sm">
                      <input type="checkbox" className="rounded border-green-300" defaultChecked />
                      <span>Daily memory invitations via email</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm">
                      <input type="checkbox" className="rounded border-green-300" defaultChecked />
                      <span>Weekly progress updates</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm">
                      <input type="checkbox" className="rounded border-green-300" defaultChecked />
                      <span>Milestone celebrations when {personaName} learns new abilities</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm">
                      <input type="checkbox" className="rounded border-green-300" />
                      <span>Invite family members to contribute (you can do this later too)</span>
                    </label>
                  </div>
                </div>

                {/* Milestone Preview */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">Milestone Celebrations</h4>
                      <p className="text-sm text-indigo-700">
                        "Your {relationship.toLowerCase()}'s persona just learned how to tell their famous stories! 
                        Three family members have now contributed memories. 
                        They're ready for deeper conversations about their childhood."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('first-connection')}
                    className="px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                    data-testid="button-complete-gradual-awakening"
                  >
                    Begin the Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}