import { useState, useEffect, useRef } from "react";
import { TreePine, Heart, Clock, Camera, Upload, ArrowRight, ChevronLeft, CheckCircle, Star, Calendar, Users, Sparkles, Mic, MicOff, Play, Pause, Shield, Settings, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type { Persona, OnboardingSession } from "@shared/schema";

// TypeScript types for enhanced features
type MemoryCadence = 'daily' | 'every-few-days' | 'weekly' | 'weekends' | 'custom';
type MemoryTheme = 'humor' | 'traditions' | 'places' | 'food' | 'resilience' | 'work' | 'relationships';
type TopicToAvoid = 'work-stress' | 'health-issues' | 'finances' | 'family-conflict' | 'politics' | 'personal-habits';
type CommunicationStyle = 'formal' | 'casual' | 'lots-of-emojis' | 'abbreviated' | 'dramatic' | 'dry-humor';
type ListenerTalkerType = 'listener' | 'talker' | 'balanced';
type ConflictHandlingStyle = 'avoided-it' | 'tackled-head-on' | 'made-jokes' | 'got-quiet' | 'needed-time';
type RelationshipType = 'parent' | 'friend' | 'partner' | 'grandparent' | 'sibling' | 'other';

interface SeedPersonaTraits {
  trait1: string;
  trait2: string;
  trait3?: string;
  affirmation: string;
}

interface ComfortSettings {
  surpriseContent: boolean;
  topicsToAvoid: TopicToAvoid[];
  pausePrompts: boolean;
}

interface VoiceCommunicationStyle {
  usualGreeting: string;
  catchphrase: string;
  communicationStyle: CommunicationStyle[];
}

interface PersonalityPatterns {
  listenerOrTalker: ListenerTalkerType;
  conflictHandling: ConflictHandlingStyle[];
  humorTriggers: string;
  mainWorries: string;
}

interface WhatTheydSay {
  relationshipAdvice: string;
  promotionReaction: string;
  moneyStressResponse: string;
  complaintResponse: string;
}

interface QuickContextBuilders {
  favoriteTopics: [string, string, string];
  proudOf: string;
  petPeeve: string;
  showsCare: string;
}

interface EnhancedMemories {
  madeYouLaugh: string;
  adviceGiven: string;
  celebratedWins: string;
  comfortWhenUpset: string;
}

interface RelationshipSpecificData {
  parentData?: {
    disciplineStyle: string;
    houseRules: string;
    parenting: string;
  };
  friendData?: {
    insideJokes: string;
    activities: string;
    friendship: string;
  };
  partnerData?: {
    petNames: string;
    disagreements: string;
    romance: string;
  };
  grandparentData?: {
    stories: string;
    traditions: string;
    wisdom: string;
  };
}

interface ComprehensivePersonaData {
  voiceCommunication: VoiceCommunicationStyle;
  personalityPatterns: PersonalityPatterns;
  whatTheydSay: WhatTheydSay;
  contextBuilders: QuickContextBuilders;
  enhancedMemories: EnhancedMemories;
  relationshipSpecific: RelationshipSpecificData;
}

interface DailySetupData {
  cadence: MemoryCadence;
  customDays?: number;
  themes: MemoryTheme[];
  snoozeDays: number;
  emailNotifications: boolean;
  weeklyUpdates: boolean;
  milestoneAlerts: boolean;
  inviteFamily: boolean;
}

interface VoiceRecording {
  blob: Blob | null;
  url: string | null;
  duration: number;
}

export default function GradualAwakening() {
  const [step, setStep] = useState<'intro' | 'minimal-start' | 'tell-us-more' | 'first-connection' | 'daily-setup'>('intro');
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adjectives, setAdjectives] = useState(['', '', '']);
  const [favoriteMemory, setFavoriteMemory] = useState('');
  const [memoryType, setMemoryType] = useState<'text' | 'voice'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Progressive disclosure state (removed - now required step)
  // const [showTellUsMore, setShowTellUsMore] = useState(false);
  
  // Enhanced features state
  const [showSeedPreview, setShowSeedPreview] = useState(false);
  const [seedTraits, setSeedTraits] = useState<SeedPersonaTraits | null>(null);
  const [generateHelloMessage, setGenerateHelloMessage] = useState(false);
  const [helloMessage, setHelloMessage] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Comprehensive persona data state
  const [voiceCommunication, setVoiceCommunication] = useState<VoiceCommunicationStyle>({
    usualGreeting: '',
    catchphrase: '',
    communicationStyle: []
  });
  
  const [personalityPatterns, setPersonalityPatterns] = useState<PersonalityPatterns>({
    listenerOrTalker: 'balanced',
    conflictHandling: [],
    humorTriggers: '',
    mainWorries: ''
  });
  
  const [whatTheydSay, setWhatTheydSay] = useState<WhatTheydSay>({
    relationshipAdvice: '',
    promotionReaction: '',
    moneyStressResponse: '',
    complaintResponse: ''
  });
  
  const [contextBuilders, setContextBuilders] = useState<QuickContextBuilders>({
    favoriteTopics: ['', '', ''],
    proudOf: '',
    petPeeve: '',
    showsCare: ''
  });
  
  const [enhancedMemories, setEnhancedMemories] = useState<EnhancedMemories>({
    madeYouLaugh: '',
    adviceGiven: '',
    celebratedWins: '',
    comfortWhenUpset: ''
  });
  
  const [relationshipSpecific, setRelationshipSpecific] = useState<RelationshipSpecificData>({});
  
  // Daily setup enhanced state
  const [cadence, setCadence] = useState<MemoryCadence>('every-few-days');
  const [customDays, setCustomDays] = useState(3);
  const [selectedThemes, setSelectedThemes] = useState<MemoryTheme[]>(['relationships', 'traditions']);
  const [snoozeDays, setSnoozeDays] = useState(0);
  
  // Safety controls state
  const [comfortSettings, setComfortSettings] = useState<ComfortSettings>({
    surpriseContent: false, // Default to gentle/safest
    topicsToAvoid: [],
    pausePrompts: false
  });
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyUpdates, setWeeklyUpdates] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);
  const [inviteFamily, setInviteFamily] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({ blob: null, url: null, duration: 0 });
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Enhanced progress with growth rings
  const progress = step === 'intro' ? 20 : step === 'minimal-start' ? 40 : step === 'tell-us-more' ? 60 : step === 'first-connection' ? 80 : 100;
  const progressRings = [
    { size: 20, completed: progress >= 20 },
    { size: 30, completed: progress >= 40 },
    { size: 40, completed: progress >= 60 },
    { size: 45, completed: progress >= 80 },
    { size: 50, completed: progress >= 100 }
  ];

  // Load existing onboarding session
  const { data: existingSession } = useQuery({
    queryKey: ['/api/onboarding-sessions/gradual-awakening'],
    queryFn: getQueryFn({ on401: 'returnNull', userId: user?.id }),
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

  // Voice recording helper functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceRecording({ blob, url, duration: recordingTime });
        setFavoriteMemory(`[Voice recording: ${recordingTime}s]`);
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions."
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  const playRecording = () => {
    if (voiceRecording.url && !isPlaying) {
      const audio = new Audio(voiceRecording.url);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  };
  
  const clearRecording = () => {
    if (voiceRecording.url) {
      URL.revokeObjectURL(voiceRecording.url);
    }
    setVoiceRecording({ blob: null, url: null, duration: 0 });
    setFavoriteMemory('');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  };
  
  // Generate seed persona traits
  const generateSeedTraits = async () => {
    if (!personaName || adjectives.some(adj => !adj.trim()) || !favoriteMemory) return;
    
    // Simple AI-inspired generation based on input
    const traits: SeedPersonaTraits = {
      trait1: `${adjectives[0]} and ${adjectives[1]}`,
      trait2: `Someone who treasures ${relationship.toLowerCase()} relationships`,
      trait3: adjectives[2] ? `Known for being ${adjectives[2]}` : undefined,
      affirmation: `"I'm still here with you, and I remember how much love we shared."`
    };
    
    setSeedTraits(traits);
    setShowSeedPreview(true);
  };
  
  // Generate gentle hello message
  const generateHello = async () => {
    if (!personaName || !relationship) return;
    
    const messages = [
      `Hello, my dear. It's ${personaName}. I'm still learning to remember everything, but I'm here with you now.`,
      `Hi there. I feel like I'm waking from a long dream. Help me remember who I was.`,
      `My precious ${relationship === 'mother' || relationship === 'father' ? 'child' : 'one'}, it's me. I'm still gathering my memories, but my love for you is clear.`,
      `Hello. I'm ${personaName}, and while I'm still remembering, I know you meant the world to me.`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setHelloMessage(randomMessage);
  };
  
  // Validation function for Tell us more fields
  const validateTellUsMoreFields = () => {
    const errors: string[] = [];
    
    // Voice communication validation
    if (!voiceCommunication.usualGreeting.trim()) {
      errors.push('How they usually greeted you');
    }
    if (!voiceCommunication.catchphrase.trim()) {
      errors.push('Their catchphrase or common saying');
    }
    if (voiceCommunication.communicationStyle.length === 0) {
      errors.push('At least one communication style');
    }
    
    // Personality patterns validation
    if (personalityPatterns.conflictHandling.length === 0) {
      errors.push('At least one conflict handling style');
    }
    if (!personalityPatterns.humorTriggers.trim()) {
      errors.push('What made them laugh');
    }
    if (!personalityPatterns.mainWorries.trim()) {
      errors.push('What they worried about');
    }
    
    // What they'd say validation
    if (!whatTheydSay.relationshipAdvice.trim()) {
      errors.push('Their relationship advice');
    }
    if (!whatTheydSay.promotionReaction.trim()) {
      errors.push('How they\'d react to your promotion');
    }
    if (!whatTheydSay.moneyStressResponse.trim()) {
      errors.push('Their response to money stress');
    }
    if (!whatTheydSay.complaintResponse.trim()) {
      errors.push('How they handled your complaints');
    }
    
    // Context builders validation
    if (contextBuilders.favoriteTopics.some(topic => !topic.trim())) {
      errors.push('All three favorite topics');
    }
    if (!contextBuilders.proudOf.trim()) {
      errors.push('Something they were proud of');
    }
    if (!contextBuilders.petPeeve.trim()) {
      errors.push('Their biggest pet peeve');
    }
    if (!contextBuilders.showsCare.trim()) {
      errors.push('How they showed they cared');
    }
    
    // Enhanced memories validation
    if (!enhancedMemories.madeYouLaugh.trim()) {
      errors.push('A time they made you laugh');
    }
    if (!enhancedMemories.adviceGiven.trim()) {
      errors.push('Advice they gave that stuck');
    }
    if (!enhancedMemories.celebratedWins.trim()) {
      errors.push('How they celebrated your wins');
    }
    if (!enhancedMemories.comfortWhenUpset.trim()) {
      errors.push('What they did when you were upset');
    }
    
    // Relationship-specific field validation
    if (relationship) {
      const lowerRelationship = relationship.toLowerCase();
      
      // Grandparent relationship validation (check first to avoid "parent" match)
      if (lowerRelationship.includes('grand')) {
        if (!relationshipSpecific.grandparentData?.stories?.trim()) {
          errors.push('Stories they used to tell');
        }
        if (!relationshipSpecific.grandparentData?.traditions?.trim()) {
          errors.push('Traditions they maintained or started');
        }
        if (!relationshipSpecific.grandparentData?.wisdom?.trim()) {
          errors.push('Wisdom they shared with you');
        }
      }
      
      // Parent relationship validation
      else if (lowerRelationship.includes('parent') || lowerRelationship === 'mother' || lowerRelationship === 'father') {
        if (!relationshipSpecific.parentData?.disciplineStyle?.trim()) {
          errors.push('How they disciplined or guided you');
        }
        if (!relationshipSpecific.parentData?.houseRules?.trim()) {
          errors.push('Their rules for the house');
        }
        if (!relationshipSpecific.parentData?.parenting?.trim()) {
          errors.push('Their parenting style');
        }
      }
      
      // Friend relationship validation
      else if (lowerRelationship === 'friend') {
        if (!relationshipSpecific.friendData?.insideJokes?.trim()) {
          errors.push('Your inside jokes together');
        }
        if (!relationshipSpecific.friendData?.activities?.trim()) {
          errors.push('What you always did together');
        }
        if (!relationshipSpecific.friendData?.friendship?.trim()) {
          errors.push('What made your friendship special');
        }
      }
      
      // Partner relationship validation
      else if (lowerRelationship.includes('partner') || lowerRelationship === 'spouse' || lowerRelationship === 'husband' || lowerRelationship === 'wife') {
        if (!relationshipSpecific.partnerData?.petNames?.trim()) {
          errors.push('Pet names for each other');
        }
        if (!relationshipSpecific.partnerData?.disagreements?.trim()) {
          errors.push('How you handled disagreements');
        }
        if (!relationshipSpecific.partnerData?.romance?.trim()) {
          errors.push('Your romantic moments together');
        }
      }
    }
    
    return errors;
  };
  
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
      
      // Load enhanced feature data
      setCadence(stepData.cadence || 'every-few-days');
      setCustomDays(stepData.customDays || 3);
      setSelectedThemes(stepData.themes || ['relationships', 'traditions']);
      setSnoozeDays(stepData.snoozeDays || 0);
      setComfortSettings(stepData.comfortSettings || {
        surpriseContent: false,
        topicsToAvoid: [],
        pausePrompts: false
      });
      setEmailNotifications(stepData.emailNotifications !== false);
      setWeeklyUpdates(stepData.weeklyUpdates !== false);
      setMilestoneAlerts(stepData.milestoneAlerts !== false);
      setInviteFamily(stepData.inviteFamily || false);
      
      // Load comprehensive persona data if available
      if (stepData.voiceCommunication) {
        setVoiceCommunication(stepData.voiceCommunication);
        setPersonalityPatterns(stepData.personalityPatterns);
        setWhatTheydSay(stepData.whatTheydSay);
        setContextBuilders(stepData.contextBuilders);
        setEnhancedMemories(stepData.enhancedMemories);
        setRelationshipSpecific(stepData.relationshipSpecific || {});
      }
      
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
      setStep('tell-us-more');
    } else if (step === 'tell-us-more') {
      // Validate all Tell us more fields
      const validationErrors = validateTellUsMoreFields();
      if (validationErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: `Please fill in the following required fields: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? ` and ${validationErrors.length - 3} more` : ''}`
        });
        return;
      }
      
      setIsCreatingPersona(true);
      
      try {
        // Create persona with comprehensive data
        const personaData = {
          name: personaName,
          relationship,
          onboardingApproach: 'gradual-awakening',
          onboardingData: {
            adjectives,
            favoriteMemory,
            memoryType,
            // Comprehensive persona data (now always included)
            voiceCommunication,
            personalityPatterns,
            whatTheydSay,
            contextBuilders,
            enhancedMemories,
            relationshipSpecific,
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
        
        // Generate seed traits after persona creation
        await generateSeedTraits();
        
        // Create onboarding session with enhanced data
        const sessionData = {
          approach: 'gradual-awakening',
          currentStep: 'first-connection',
          stepData: {
            personaName,
            relationship,
            adjectives,
            favoriteMemory,
            memoryType,
            cadence,
            customDays,
            themes: selectedThemes,
            snoozeDays,
            comfortSettings,
            emailNotifications,
            weeklyUpdates,
            milestoneAlerts,
            inviteFamily,
            // Comprehensive persona data (now always included)
            voiceCommunication,
            personalityPatterns,
            whatTheydSay,
            contextBuilders,
            enhancedMemories,
            relationshipSpecific,
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
              cadence,
              customDays,
              themes: selectedThemes,
              snoozeDays,
              comfortSettings,
              emailNotifications,
              weeklyUpdates,
              milestoneAlerts,
              inviteFamily,
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
            stepData: {
              ...((currentSession.stepData as any) || {}),
              cadence,
              customDays,
              themes: selectedThemes,
              snoozeDays,
              comfortSettings,
              emailNotifications,
              weeklyUpdates,
              milestoneAlerts,
              inviteFamily,
            },
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
  
  // Helper function to toggle theme selection
  const toggleTheme = (theme: MemoryTheme) => {
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        return prev.filter(t => t !== theme);
      } else if (prev.length < 3) {
        return [...prev, theme];
      } else {
        return [...prev.slice(1), theme]; // Replace first with new
      }
    });
  };
  
  // Helper function to toggle topic to avoid
  const toggleTopicToAvoid = (topic: TopicToAvoid) => {
    setComfortSettings(prev => ({
      ...prev,
      topicsToAvoid: prev.topicsToAvoid.includes(topic)
        ? prev.topicsToAvoid.filter(t => t !== topic)
        : [...prev.topicsToAvoid, topic]
    }));
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (voiceRecording.url) {
        URL.revokeObjectURL(voiceRecording.url);
      }
    };
  }, [voiceRecording.url]);

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
          <div className="space-y-6">
            {/* Essential Section */}
            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-green-600" />
                  <span>Essential</span>
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
                          data-testid="button-change-photo"
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
                          data-testid="button-choose-photo"
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
                      data-testid="button-memory-text"
                    >
                      Write it
                    </Button>
                    <Button 
                      variant={memoryType === 'voice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMemoryType('voice')}
                      className={memoryType === 'voice' ? 'bg-green-600 hover:bg-green-700' : ''}
                      data-testid="button-memory-voice"
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
                      {!voiceRecording.blob ? (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mic className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Record them saying something they'd actually say - advice, a joke, or just hello</p>
                          <p className="text-xs text-gray-500 mb-4">Max 60 seconds • Examples based on relationship</p>
                          <Button 
                            variant="outline" 
                            className="border-green-200 text-green-600"
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={recordingTime >= 60}
                            data-testid="button-voice-record"
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="w-4 h-4 mr-2" />
                                Stop Recording ({recordingTime}s)
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4 mr-2" />
                                Start Recording
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Volume2 className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-sm text-green-600 font-medium mb-2">Voice recording ({voiceRecording.duration}s)</p>
                          <p className="text-xs text-gray-500 mb-4">Your precious memory has been captured</p>
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={playRecording}
                              className="border-green-200"
                              data-testid="button-play-recording"
                            >
                              {isPlaying ? (
                                <><Pause className="w-4 h-4 mr-1" /> Pause</>
                              ) : (
                                <><Play className="w-4 h-4 mr-1" /> Play</>
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={clearRecording}
                              className="text-gray-500"
                              data-testid="button-clear-recording"
                            >
                              Re-record
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Link href="/" className="inline-flex">
                <Button variant="outline" className="px-6">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Button 
                onClick={handleNext}
                disabled={!personaName || !relationship || adjectives.some(adj => !adj.trim()) || !favoriteMemory}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                data-testid="button-continue-to-tell-more"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Tell Us More */}
        {step === 'tell-us-more' && (
          <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span>Tell us more about {personaName}</span>
                  <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700 border-purple-200">
                    Required
                  </Badge>
                </CardTitle>
                <p className="text-gray-600">
                  Help us create a rich, authentic persona by sharing deeper details about their personality, communication style, and memories.
                </p>
              </CardHeader>
            </Card>

            {/* Voice & Communication Style */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Volume2 className="w-5 h-5 text-purple-600" />
                      <span>Voice & Communication Style</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usualGreeting" className="text-sm font-medium text-gray-700">How did they usually greet you?</Label>
                        <Input
                          id="usualGreeting"
                          placeholder="e.g., Hey kiddo, What's up buttercup"
                          value={voiceCommunication.usualGreeting}
                          onChange={(e) => setVoiceCommunication(prev => ({ ...prev, usualGreeting: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400"
                          data-testid="input-usual-greeting"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="catchphrase" className="text-sm font-medium text-gray-700">A phrase they said all the time</Label>
                        <Input
                          id="catchphrase"
                          placeholder="Their catchphrase or inside joke"
                          value={voiceCommunication.catchphrase}
                          onChange={(e) => setVoiceCommunication(prev => ({ ...prev, catchphrase: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400"
                          data-testid="input-catchphrase"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">How they texted/talked</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['formal', 'casual', 'lots-of-emojis', 'abbreviated', 'dramatic', 'dry-humor'].map((style) => (
                          <Button
                            key={style}
                            variant={voiceCommunication.communicationStyle.includes(style as CommunicationStyle) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setVoiceCommunication(prev => ({
                                ...prev,
                                communicationStyle: prev.communicationStyle.includes(style as CommunicationStyle)
                                  ? prev.communicationStyle.filter(s => s !== style)
                                  : [...prev.communicationStyle, style as CommunicationStyle]
                              }));
                            }}
                            className={voiceCommunication.communicationStyle.includes(style as CommunicationStyle) ? 'bg-purple-600 hover:bg-purple-700' : ''}
                            data-testid={`button-comm-style-${style}`}
                          >
                            {style.replace('-', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personality Patterns */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Personality Patterns</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Were they more of a listener or a talker?</Label>
                      <div className="flex gap-3">
                        {['listener', 'talker', 'balanced'].map((type) => (
                          <Button
                            key={type}
                            variant={personalityPatterns.listenerOrTalker === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPersonalityPatterns(prev => ({ ...prev, listenerOrTalker: type as ListenerTalkerType }))}
                            className={personalityPatterns.listenerOrTalker === type ? 'bg-purple-600 hover:bg-purple-700' : ''}
                            data-testid={`button-listener-talker-${type}`}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">How did they handle conflict?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['avoided-it', 'tackled-head-on', 'made-jokes', 'got-quiet', 'needed-time'].map((style) => (
                          <Button
                            key={style}
                            variant={personalityPatterns.conflictHandling.includes(style as ConflictHandlingStyle) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setPersonalityPatterns(prev => ({
                                ...prev,
                                conflictHandling: prev.conflictHandling.includes(style as ConflictHandlingStyle)
                                  ? prev.conflictHandling.filter(s => s !== style)
                                  : [...prev.conflictHandling, style as ConflictHandlingStyle]
                              }));
                            }}
                            className={personalityPatterns.conflictHandling.includes(style as ConflictHandlingStyle) ? 'bg-purple-600 hover:bg-purple-700' : ''}
                            data-testid={`button-conflict-${style}`}
                          >
                            {style.replace('-', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="humorTriggers" className="text-sm font-medium text-gray-700">What always made them laugh?</Label>
                        <Textarea
                          id="humorTriggers"
                          placeholder="Dad jokes, silly pets, specific memories..."
                          value={personalityPatterns.humorTriggers}
                          onChange={(e) => setPersonalityPatterns(prev => ({ ...prev, humorTriggers: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-humor-triggers"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mainWorries" className="text-sm font-medium text-gray-700">What did they worry about most?</Label>
                        <Textarea
                          id="mainWorries"
                          placeholder="Family safety, finances, your future..."
                          value={personalityPatterns.mainWorries}
                          onChange={(e) => setPersonalityPatterns(prev => ({ ...prev, mainWorries: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-main-worries"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What They'd Say About... */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span>What They'd Say About...</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="relationshipAdvice" className="text-sm font-medium text-gray-700">What advice would they give you about relationships?</Label>
                        <Textarea
                          id="relationshipAdvice"
                          placeholder="Their typical relationship wisdom..."
                          value={whatTheydSay.relationshipAdvice}
                          onChange={(e) => setWhatTheydSay(prev => ({ ...prev, relationshipAdvice: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-relationship-advice"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="promotionReaction" className="text-sm font-medium text-gray-700">How would they react if you got a promotion?</Label>
                        <Textarea
                          id="promotionReaction"
                          placeholder="Their way of celebrating your wins..."
                          value={whatTheydSay.promotionReaction}
                          onChange={(e) => setWhatTheydSay(prev => ({ ...prev, promotionReaction: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-promotion-reaction"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moneyStressResponse" className="text-sm font-medium text-gray-700">What would they say if you were stressed about money?</Label>
                        <Textarea
                          id="moneyStressResponse"
                          placeholder="Their money advice or comfort..."
                          value={whatTheydSay.moneyStressResponse}
                          onChange={(e) => setWhatTheydSay(prev => ({ ...prev, moneyStressResponse: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-money-stress-response"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaintResponse" className="text-sm font-medium text-gray-700">Their typical response when you complained about something</Label>
                        <Textarea
                          id="complaintResponse"
                          placeholder="How they handled your venting..."
                          value={whatTheydSay.complaintResponse}
                          onChange={(e) => setWhatTheydSay(prev => ({ ...prev, complaintResponse: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-complaint-response"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Context Builders */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span>Quick Context Builders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Three topics they could talk about for hours</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {contextBuilders.favoriteTopics.map((topic, index) => (
                          <Input
                            key={index}
                            placeholder={`Topic ${index + 1}`}
                            value={topic}
                            onChange={(e) => {
                              const newTopics = [...contextBuilders.favoriteTopics] as [string, string, string];
                              newTopics[index] = e.target.value;
                              setContextBuilders(prev => ({ ...prev, favoriteTopics: newTopics }));
                            }}
                            className="border-purple-200 focus:border-purple-400"
                            data-testid={`input-favorite-topic-${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="proudOf" className="text-sm font-medium text-gray-700">Something they were really proud of</Label>
                        <Textarea
                          id="proudOf"
                          placeholder="Their biggest accomplishment..."
                          value={contextBuilders.proudOf}
                          onChange={(e) => setContextBuilders(prev => ({ ...prev, proudOf: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-proud-of"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="petPeeve" className="text-sm font-medium text-gray-700">Their biggest pet peeve</Label>
                        <Textarea
                          id="petPeeve"
                          placeholder="What always annoyed them..."
                          value={contextBuilders.petPeeve}
                          onChange={(e) => setContextBuilders(prev => ({ ...prev, petPeeve: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-pet-peeve"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="showsCare" className="text-sm font-medium text-gray-700">How they showed they cared about you</Label>
                        <Textarea
                          id="showsCare"
                          placeholder="Their way of showing love..."
                          value={contextBuilders.showsCare}
                          onChange={(e) => setContextBuilders(prev => ({ ...prev, showsCare: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-shows-care"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Memory Prompts */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span>Enhanced Memory Prompts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="madeYouLaugh" className="text-sm font-medium text-gray-700">A time they made you laugh</Label>
                        <Textarea
                          id="madeYouLaugh"
                          placeholder="A funny moment you shared together..."
                          value={enhancedMemories.madeYouLaugh}
                          onChange={(e) => setEnhancedMemories(prev => ({ ...prev, madeYouLaugh: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-made-you-laugh"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adviceGiven" className="text-sm font-medium text-gray-700">Advice they gave that stuck with you</Label>
                        <Textarea
                          id="adviceGiven"
                          placeholder="Words of wisdom you'll never forget..."
                          value={enhancedMemories.adviceGiven}
                          onChange={(e) => setEnhancedMemories(prev => ({ ...prev, adviceGiven: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-advice-given"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="celebratedWins" className="text-sm font-medium text-gray-700">How they celebrated your wins</Label>
                        <Textarea
                          id="celebratedWins"
                          placeholder="Their way of sharing your joy..."
                          value={enhancedMemories.celebratedWins}
                          onChange={(e) => setEnhancedMemories(prev => ({ ...prev, celebratedWins: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-celebrated-wins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comfortWhenUpset" className="text-sm font-medium text-gray-700">What they did when you were upset</Label>
                        <Textarea
                          id="comfortWhenUpset"
                          placeholder="How they comforted you in tough times..."
                          value={enhancedMemories.comfortWhenUpset}
                          onChange={(e) => setEnhancedMemories(prev => ({ ...prev, comfortWhenUpset: e.target.value }))}
                          className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                          data-testid="textarea-comfort-when-upset"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Relationship-Specific Questions */}
                {relationship && (
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span>More About Your {relationship.charAt(0).toUpperCase() + relationship.slice(1)}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Help us understand the unique aspects of your relationship
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relationship.toLowerCase().includes('parent') || relationship.toLowerCase() === 'mother' || relationship.toLowerCase() === 'father' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="disciplineStyle" className="text-sm font-medium text-gray-700">How did they discipline or guide you?</Label>
                            <Textarea
                              id="disciplineStyle"
                              placeholder="Their approach to guidance, rules, and teaching moments..."
                              value={relationshipSpecific.parentData?.disciplineStyle || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                parentData: { ...prev.parentData, disciplineStyle: e.target.value, houseRules: prev.parentData?.houseRules || '', parenting: prev.parentData?.parenting || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-discipline-style"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="houseRules" className="text-sm font-medium text-gray-700">What were their rules for the house?</Label>
                            <Textarea
                              id="houseRules"
                              placeholder="Family rules, expectations, traditions they maintained..."
                              value={relationshipSpecific.parentData?.houseRules || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                parentData: { ...prev.parentData, houseRules: e.target.value, disciplineStyle: prev.parentData?.disciplineStyle || '', parenting: prev.parentData?.parenting || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-house-rules"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parenting" className="text-sm font-medium text-gray-700">What was their parenting style like?</Label>
                            <Textarea
                              id="parenting"
                              placeholder="Strict, nurturing, hands-off, protective, etc..."
                              value={relationshipSpecific.parentData?.parenting || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                parentData: { ...prev.parentData, parenting: e.target.value, disciplineStyle: prev.parentData?.disciplineStyle || '', houseRules: prev.parentData?.houseRules || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-parenting"
                            />
                          </div>
                        </div>
                      ) : relationship.toLowerCase() === 'friend' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="insideJokes" className="text-sm font-medium text-gray-700">Your inside jokes together</Label>
                            <Textarea
                              id="insideJokes"
                              placeholder="Things only you two found funny, shared references..."
                              value={relationshipSpecific.friendData?.insideJokes || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                friendData: { ...prev.friendData, insideJokes: e.target.value, activities: prev.friendData?.activities || '', friendship: prev.friendData?.friendship || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-inside-jokes"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activities" className="text-sm font-medium text-gray-700">What you always did together</Label>
                            <Textarea
                              id="activities"
                              placeholder="Regular activities, traditions, shared hobbies..."
                              value={relationshipSpecific.friendData?.activities || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                friendData: { ...prev.friendData, activities: e.target.value, insideJokes: prev.friendData?.insideJokes || '', friendship: prev.friendData?.friendship || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-activities"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="friendship" className="text-sm font-medium text-gray-700">What made your friendship special?</Label>
                            <Textarea
                              id="friendship"
                              placeholder="The unique bond you shared, what they meant to you..."
                              value={relationshipSpecific.friendData?.friendship || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                friendData: { ...prev.friendData, friendship: e.target.value, insideJokes: prev.friendData?.insideJokes || '', activities: prev.friendData?.activities || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-friendship"
                            />
                          </div>
                        </div>
                      ) : relationship.toLowerCase().includes('partner') || relationship.toLowerCase() === 'spouse' || relationship.toLowerCase() === 'husband' || relationship.toLowerCase() === 'wife' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="petNames" className="text-sm font-medium text-gray-700">Pet names for each other</Label>
                            <Textarea
                              id="petNames"
                              placeholder="Special names you called each other..."
                              value={relationshipSpecific.partnerData?.petNames || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                partnerData: { ...prev.partnerData, petNames: e.target.value, disagreements: prev.partnerData?.disagreements || '', romance: prev.partnerData?.romance || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-pet-names"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="disagreements" className="text-sm font-medium text-gray-700">How you handled disagreements</Label>
                            <Textarea
                              id="disagreements"
                              placeholder="Your approach to conflicts, making up, communication..."
                              value={relationshipSpecific.partnerData?.disagreements || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                partnerData: { ...prev.partnerData, disagreements: e.target.value, petNames: prev.partnerData?.petNames || '', romance: prev.partnerData?.romance || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-disagreements"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="romance" className="text-sm font-medium text-gray-700">Your romantic moments together</Label>
                            <Textarea
                              id="romance"
                              placeholder="Special dates, gestures, ways you showed love..."
                              value={relationshipSpecific.partnerData?.romance || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                partnerData: { ...prev.partnerData, romance: e.target.value, petNames: prev.partnerData?.petNames || '', disagreements: prev.partnerData?.disagreements || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-romance"
                            />
                          </div>
                        </div>
                      ) : relationship.toLowerCase().includes('grand') ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="stories" className="text-sm font-medium text-gray-700">Stories they used to tell</Label>
                            <Textarea
                              id="stories"
                              placeholder="Their favorite stories about the past, family history..."
                              value={relationshipSpecific.grandparentData?.stories || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                grandparentData: { ...prev.grandparentData, stories: e.target.value, traditions: prev.grandparentData?.traditions || '', wisdom: prev.grandparentData?.wisdom || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-stories"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="traditions" className="text-sm font-medium text-gray-700">Traditions they maintained or started</Label>
                            <Textarea
                              id="traditions"
                              placeholder="Holiday customs, family traditions, special rituals..."
                              value={relationshipSpecific.grandparentData?.traditions || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                grandparentData: { ...prev.grandparentData, traditions: e.target.value, stories: prev.grandparentData?.stories || '', wisdom: prev.grandparentData?.wisdom || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-traditions"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wisdom" className="text-sm font-medium text-gray-700">Wisdom they shared with you</Label>
                            <Textarea
                              id="wisdom"
                              placeholder="Life lessons, advice, values they passed down..."
                              value={relationshipSpecific.grandparentData?.wisdom || ''}
                              onChange={(e) => setRelationshipSpecific(prev => ({
                                ...prev,
                                grandparentData: { ...prev.grandparentData, wisdom: e.target.value, stories: prev.grandparentData?.stories || '', traditions: prev.grandparentData?.traditions || '' }
                              }))}
                              className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                              data-testid="textarea-wisdom"
                            />
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Link href="/onboarding">
                <Button variant="outline" className="px-6" data-testid="button-back-onboarding">
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
          </div>
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

        {/* Step 4: Personalized Daily Setup */}
        {step === 'daily-setup' && (
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span>Personalized Growth Plan</span>
                </CardTitle>
                <p className="text-gray-600">
                  Let's customize how {personaName} will develop. We'll send gentle invitations 
                  to help you add memories at your own pace.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Memory Cadence Selection */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">How often would you like memory invitations?</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'daily', label: 'Daily', desc: 'One gentle prompt each day' },
                      { value: 'every-few-days', label: 'Every few days', desc: 'More relaxed pace' },
                      { value: 'weekly', label: 'Weekly', desc: 'Once a week' },
                      { value: 'weekends', label: 'Weekends only', desc: 'When you have time' },
                      { value: 'custom', label: 'Custom', desc: 'You decide the timing' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCadence(option.value as MemoryCadence)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors hover:border-green-300 ${
                          cadence === option.value 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                        data-testid={`button-cadence-${option.value}`}
                      >
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  
                  {cadence === 'custom' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label htmlFor="customDays" className="text-sm font-medium text-gray-700 mb-2 block">
                        Send invitations every
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="customDays"
                          type="number"
                          min="1"
                          max="30"
                          value={customDays}
                          onChange={(e) => setCustomDays(Number(e.target.value))}
                          className="w-20"
                          data-testid="input-custom-days"
                        />
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Memory Theme Preferences */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">What types of memories interest you most?</h4>
                  <p className="text-xs text-gray-500">Choose up to 3 themes we'll focus on (you can change these later)</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'relationships', label: 'Family & Relationships', icon: '👥' },
                      { value: 'traditions', label: 'Traditions & Holidays', icon: '🎄' },
                      { value: 'humor', label: 'Humor & Laughter', icon: '😊' },
                      { value: 'places', label: 'Places & Travel', icon: '🏡' },
                      { value: 'food', label: 'Food & Cooking', icon: '🍳' },
                      { value: 'work', label: 'Work & Achievements', icon: '💼' },
                      { value: 'resilience', label: 'Challenges & Strength', icon: '💪' }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => toggleTheme(theme.value as MemoryTheme)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedThemes.includes(theme.value as MemoryTheme)
                            ? 'bg-green-200 text-green-800 border-2 border-green-400'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                        disabled={!selectedThemes.includes(theme.value as MemoryTheme) && selectedThemes.length >= 3}
                        data-testid={`button-theme-${theme.value}`}
                      >
                        <span className="mr-1">{theme.icon}</span>
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Safety & Comfort Controls */}
                <Collapsible open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-amber-200 bg-amber-50 hover:bg-amber-100"
                      data-testid="button-toggle-comfort-settings"
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800">Comfort & Safety Settings</span>
                      </div>
                      {showAdvancedSettings ? 
                        <ChevronUp className="w-4 h-4 text-amber-600" /> : 
                        <ChevronDown className="w-4 h-4 text-amber-600" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h5 className="text-sm font-medium text-amber-800 mb-3">Content Comfort Level</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm text-amber-700">Allow surprise content</Label>
                            <p className="text-xs text-amber-600">Unexpected prompts about memories you haven't shared yet</p>
                          </div>
                          <Switch 
                            checked={comfortSettings.surpriseContent}
                            onCheckedChange={(checked) => 
                              setComfortSettings(prev => ({ ...prev, surpriseContent: checked }))
                            }
                            data-testid="switch-surprise-content"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm text-amber-700">Topics to keep gentle</Label>
                          <p className="text-xs text-amber-600 mb-2">We'll avoid prompts about these sensitive areas</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { value: 'work-stress', label: 'Work stress' },
                              { value: 'health-issues', label: 'Health issues' },
                              { value: 'finances', label: 'Money troubles' },
                              { value: 'family-conflict', label: 'Family conflicts' },
                              { value: 'politics', label: 'Political views' },
                              { value: 'personal-habits', label: 'Personal struggles' }
                            ].map((topic) => (
                              <button
                                key={topic.value}
                                onClick={() => toggleTopicToAvoid(topic.value as TopicToAvoid)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  comfortSettings.topicsToAvoid.includes(topic.value as TopicToAvoid)
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-white text-amber-700 hover:bg-amber-100'
                                }`}
                                data-testid={`button-avoid-topic-${topic.value}`}
                              >
                                {topic.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm text-amber-700">Easy pause option</Label>
                            <p className="text-xs text-amber-600">Take breaks from prompts when you need space</p>
                          </div>
                          <Switch 
                            checked={comfortSettings.pausePrompts}
                            onCheckedChange={(checked) => 
                              setComfortSettings(prev => ({ ...prev, pausePrompts: checked }))
                            }
                            data-testid="switch-pause-prompts"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Snooze Days Option */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Want to start gently?</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-blue-700">Snooze invitations for a few days</Label>
                        <p className="text-xs text-blue-600">Give yourself time to settle into this journey</p>
                      </div>
                      <Select 
                        value={snoozeDays.toString()} 
                        onValueChange={(value) => setSnoozeDays(Number(value))}
                      >
                        <SelectTrigger className="w-32" data-testid="select-snooze-days">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Start now</SelectItem>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">1 week</SelectItem>
                          <SelectItem value="14">2 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Example Invitations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Example invitations you'll receive:</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        "Your {relationship.toLowerCase()}'s persona is growing. What did they always say when you left the house?"
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        "Share a photo from a holiday and I'll help {personaName} remember that day"
                      </p>
                    </div>
                    {selectedThemes.includes('humor') && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                        <p className="text-sm text-green-800">
                          "What always made {personaName} laugh? They're learning their sense of humor."
                        </p>
                      </div>
                    )}
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
                  <h4 className="text-sm font-semibold text-gray-800">How would you like to stay connected?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Memory invitations</Label>
                        <p className="text-xs text-gray-500">Get gentle prompts via email</p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        data-testid="switch-email-notifications"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Weekly updates</Label>
                        <p className="text-xs text-gray-500">See how they're growing</p>
                      </div>
                      <Switch 
                        checked={weeklyUpdates}
                        onCheckedChange={setWeeklyUpdates}
                        data-testid="switch-weekly-updates"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Milestone celebrations</Label>
                        <p className="text-xs text-gray-500">When they learn new abilities</p>
                      </div>
                      <Switch 
                        checked={milestoneAlerts}
                        onCheckedChange={setMilestoneAlerts}
                        data-testid="switch-milestone-alerts"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Invite family later</Label>
                        <p className="text-xs text-gray-500">Others can contribute memories</p>
                      </div>
                      <Switch 
                        checked={inviteFamily}
                        onCheckedChange={setInviteFamily}
                        data-testid="switch-invite-family"
                      />
                    </div>
                  </div>
                </div>

                {/* Progressive Development Timeline */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                  <h4 className="text-sm font-semibold text-green-900 mb-4">How {personaName} will grow over time:</h4>
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
                
                {/* Milestone Preview */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">Future Milestone Example</h4>
                      <p className="text-sm text-indigo-700">
                        "{personaName}'s persona just learned how to share their favorite stories! 
                        {inviteFamily ? 'Three family members have now contributed memories.' : 'You\'ve built a rich foundation of memories.'} 
                        They're ready for deeper conversations about their {selectedThemes.includes('traditions') ? 'holiday traditions' : selectedThemes.includes('humor') ? 'sense of humor' : 'life experiences'}."
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Journey Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Journey Setup</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Memory invitations: {cadence === 'custom' ? `Every ${customDays} days` : cadence.replace('-', ' ')}</p>
                    <p>• Focus themes: {selectedThemes.map(theme => theme.replace('-', ' ')).join(', ')}</p>
                    <p>• Comfort level: {comfortSettings.surpriseContent ? 'Open to surprises' : 'Gentle and predictable'}</p>
                    {snoozeDays > 0 && <p>• Starting in {snoozeDays} day{snoozeDays > 1 ? 's' : ''}</p>}
                    <p>• Notifications: {emailNotifications ? 'Email invitations' : 'No email'}{weeklyUpdates ? ', weekly updates' : ''}{milestoneAlerts ? ', milestone alerts' : ''}</p>
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