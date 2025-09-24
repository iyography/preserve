import { useState, useRef } from "react";
import { Heart, Clock, ArrowRight, ChevronLeft, TreePine, Calendar, Sparkles, Upload, MessageCircle, User, CheckCircle2, Loader2, X, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertPersona } from "@shared/schema";

// Simplified types
type GradualStep = 'minimal-start' | 'daily-invitations' | 'natural-growth';
type MinimalSubStep = 'essentials' | 'obituary-link' | 'communication-style' | 'finalize-personality';
type MemoryCadence = 'daily' | 'every-few-days' | 'weekly';
type TextingStyle = 'formal' | 'casual' | 'lots-of-emojis' | 'abbreviated' | 'dramatic' | 'dry-humor';
type ListenerTalker = 'listener' | 'talker' | 'balanced';
type ConflictStyle = 'avoided-it' | 'tackled-head-on' | 'made-jokes' | 'got-quiet' | 'needed-time';

export default function GradualAwakening() {
  const [step, setStep] = useState<GradualStep>('minimal-start');
  const [minimalSubStep, setMinimalSubStep] = useState<MinimalSubStep>('essentials');
  
  // Basic persona info - Essentials sub-step
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adjectives, setAdjectives] = useState(['', '', '']);
  const [favoriteMemory, setFavoriteMemory] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Obituary link step
  const [obituaryUrl, setObituaryUrl] = useState('');
  
  // Photo cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Communication Style - Communication sub-step
  const [usualGreeting, setUsualGreeting] = useState('');
  const [catchphrase, setCatchphrase] = useState('');
  const [textingStyles, setTextingStyles] = useState<TextingStyle[]>([]);
  const [listenerTalker, setListenerTalker] = useState<ListenerTalker>('balanced');
  const [conflictStyles, setConflictStyles] = useState<ConflictStyle[]>([]);
  const [whatMadeThemLaugh, setWhatMadeThemLaugh] = useState('');
  const [whatTheyWorried, setWhatTheyWorried] = useState('');
  
  // Finalize Personality - Final sub-step
  const [finalNotes, setFinalNotes] = useState('');
  
  // Daily setup
  const [cadence, setCadence] = useState<MemoryCadence>('every-few-days');
  
  // Loading states
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isCreateMode = urlParams.get('mode') === 'create';

  // Calculate progress
  const getStepProgress = () => {
    if (step === 'minimal-start') {
      // Sub-step progress within minimal start (0-33%)
      if (minimalSubStep === 'essentials') return 8;
      if (minimalSubStep === 'obituary-link') return 16;
      if (minimalSubStep === 'communication-style') return 24;
      if (minimalSubStep === 'finalize-personality') return 30;
      return 33;
    }
    if (step === 'daily-invitations') return 66;
    if (step === 'natural-growth') return 100;
    return 0;
  };
  const progress = getStepProgress();
  
  // Helper functions for multi-select toggles
  const toggleTextingStyle = (style: TextingStyle) => {
    setTextingStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };
  
  const toggleConflictStyle = (style: ConflictStyle) => {
    setConflictStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  // Handle file upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      
      // Create original image URL for cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setOriginalImage(imageUrl);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP).",
        variant: "destructive"
      });
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setOriginalImage(null);
    setCropPreview(null);
    setIsCropping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cropping utility functions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const containerWidth = img.clientWidth;
    const containerHeight = img.clientHeight;
    
    setImageNaturalSize({ 
      width: img.naturalWidth, 
      height: img.naturalHeight 
    });
    
    // Set initial crop area to center square
    const size = Math.min(containerWidth, containerHeight) * 0.6;
    setCropArea({
      x: (containerWidth - size) / 2,
      y: (containerHeight - size) / 2,
      width: size,
      height: size
    });
  };

  const getCropCoordinates = (imageElement: HTMLImageElement) => {
    const rect = imageElement.getBoundingClientRect();
    const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
    const scaleY = imageElement.naturalHeight / imageElement.clientHeight;
    
    return {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    };
  };

  const generateCroppedImage = () => {
    const img = cropImageRef.current;
    const canvas = canvasRef.current;
    
    if (!img || !canvas) return;
    
    const coords = getCropCoordinates(img);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to crop area
    canvas.width = coords.width;
    canvas.height = coords.height;
    
    // Draw cropped image
    ctx.drawImage(
      img,
      coords.x, coords.y, coords.width, coords.height,
      0, 0, coords.width, coords.height
    );
    
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCropConfirm = () => {
    const croppedImage = generateCroppedImage();
    if (croppedImage) {
      setPhotoPreview(croppedImage);
      setCropPreview(croppedImage);
      setIsCropping(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setOriginalImage(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle cropping interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on resize handles
    const handleSize = 10;
    const rightEdge = cropArea.x + cropArea.width;
    const bottomEdge = cropArea.y + cropArea.height;
    
    if (Math.abs(x - rightEdge) < handleSize && Math.abs(y - bottomEdge) < handleSize) {
      setIsResizing(true);
      setResizeHandle('se');
    } else if (x >= cropArea.x && x <= rightEdge && y >= cropArea.y && y <= bottomEdge) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, containerWidth - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, containerHeight - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && resizeHandle === 'se') {
      const newWidth = Math.max(50, Math.min(x - cropArea.x, containerWidth - cropArea.x));
      const newHeight = Math.max(50, Math.min(y - cropArea.y, containerHeight - cropArea.y));
      setCropArea(prev => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const handleSize = 20; // Larger for touch
    const rightEdge = cropArea.x + cropArea.width;
    const bottomEdge = cropArea.y + cropArea.height;
    
    if (Math.abs(x - rightEdge) < handleSize && Math.abs(y - bottomEdge) < handleSize) {
      setIsResizing(true);
      setResizeHandle('se');
    } else if (x >= cropArea.x && x <= rightEdge && y >= cropArea.y && y <= bottomEdge) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging && !isResizing) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, containerWidth - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, containerHeight - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && resizeHandle === 'se') {
      const newWidth = Math.max(50, Math.min(x - cropArea.x, containerWidth - cropArea.x));
      const newHeight = Math.max(50, Math.min(y - cropArea.y, containerHeight - cropArea.y));
      setCropArea(prev => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Create persona mutation
  const createPersonaMutation = useMutation({
    mutationFn: async (personaData: InsertPersona) => {
      const response = await apiRequest('POST', '/api/personas', personaData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/personas'] });
      toast({
        title: "Success!",
        description: "Your digital memory has been created. Welcome to your dashboard!",
      });
      setLocation('/dashboard');
    },
    onError: (error) => {
      console.error('Create persona error:', error);
      toast({
        title: "Error",
        description: "Failed to create persona. Please try again.",
        variant: "destructive"
      });
      setIsCreatingPersona(false);
    },
  });

  const handleNext = async () => {
    if (step === 'minimal-start') {
      if (minimalSubStep === 'essentials') {
        setMinimalSubStep('obituary-link');
      } else if (minimalSubStep === 'obituary-link') {
        setMinimalSubStep('communication-style');
      } else if (minimalSubStep === 'communication-style') {
        setMinimalSubStep('finalize-personality');
      } else if (minimalSubStep === 'finalize-personality') {
        // Move to Daily Invitations step
        setStep('daily-invitations');
      }
    } else if (step === 'daily-invitations') {
      setStep('natural-growth');
    } else if (step === 'natural-growth') {
      // Complete onboarding and create persona
      setIsCreatingPersona(true);
      
      // Prepare onboarding data
      const onboardingData = {
        voiceCommunication: {
          usualGreeting: usualGreeting || "Hello",
          communicationStyle: textingStyles.length > 0 ? textingStyles : ['casual'],
          catchphrase: catchphrase
        },
        contextBuilders: {
          favoriteTopics: [],
          hobbies: [],
          supportStyle: listenerTalker === 'listener' ? 'listening' : listenerTalker === 'talker' ? 'advising' : 'balanced conversation',
          importantValues: [],
          dailyRoutines: [],
          uniqueQuirks: [whatMadeThemLaugh, whatTheyWorried].filter(Boolean)
        },
        adjectives: adjectives.filter(Boolean),
        relationship: {
          howWeMet: "",
          petNames: [],
          insideJokes: [],
          specialMemories: favoriteMemory ? [favoriteMemory] : [],
          conflictResolution: conflictStyles.map(style => {
            const styleMap: Record<ConflictStyle, string> = {
              'avoided-it': 'avoided conflict',
              'tackled-head-on': 'addressed directly',
              'made-jokes': 'used humor',
              'got-quiet': 'withdrew quietly',
              'needed-time': 'needed time to process'
            };
            return styleMap[style];
          }).join(', ') || 'balanced approach',
          sharedDreams: []
        },
        storyTelling: {
          specialPhrases: catchphrase ? [catchphrase] : [],
          celebrationStyle: "",
          memorableStories: favoriteMemory ? [favoriteMemory] : [],
          sharedExperiences: []
        },
        recentContext: {
          recentEvents: [],
          lastConversationTopics: [],
          currentConcerns: whatTheyWorried ? [whatTheyWorried] : [],
          upcomingPlans: [],
          additionalNotes: finalNotes
        },
        memoryCadence: cadence,
        photoBase64: photoPreview, // Include photo if uploaded
        obituaryUrl: obituaryUrl // Include obituary URL if provided
      };
      
      // Create persona in database
      const personaData: InsertPersona = {
        userId: user!.id,
        name: personaName || 'My Loved One',
        relationship: relationship || 'Loved One',
        onboardingApproach: 'gradual-awakening',
        status: 'completed',
        onboardingData: onboardingData
      };
      
      await createPersonaMutation.mutate(personaData);
    }
  };

  const handleBack = () => {
    if (step === 'minimal-start') {
      if (minimalSubStep === 'obituary-link') {
        setMinimalSubStep('essentials');
      } else if (minimalSubStep === 'communication-style') {
        setMinimalSubStep('obituary-link');
      } else if (minimalSubStep === 'finalize-personality') {
        setMinimalSubStep('communication-style');
      }
    } else if (step === 'daily-invitations') {
      setStep('minimal-start');
      setMinimalSubStep('finalize-personality');
    } else if (step === 'natural-growth') {
      setStep('daily-invitations');
    }
  };

  // Styling helper for multi-select buttons
  const getButtonClassName = (isSelected: boolean) => {
    return cn(
      "px-4 py-2 rounded-lg border-2 transition-all duration-200",
      isSelected
        ? "bg-green-100 border-green-500 text-green-700 font-medium"
        : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 relative overflow-hidden">
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
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className={step === 'minimal-start' ? 'text-green-600 font-medium' : ''}>
              Minimal Start
              {step === 'minimal-start' && minimalSubStep === 'essentials' && ' (1/4)'}
              {step === 'minimal-start' && minimalSubStep === 'obituary-link' && ' (2/4)'}
              {step === 'minimal-start' && minimalSubStep === 'communication-style' && ' (3/4)'}
              {step === 'minimal-start' && minimalSubStep === 'finalize-personality' && ' (4/4)'}
            </span>
            <span className={step === 'daily-invitations' ? 'text-green-600 font-medium' : ''}>Daily Invitations</span>
            <span className={step === 'natural-growth' ? 'text-green-600 font-medium' : ''}>Natural Growth</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Minimal Start with Sub-steps */}
        {step === 'minimal-start' && (
          <>
            {/* Sub-step 1: Essentials */}
            {minimalSubStep === 'essentials' && (
              <div className="space-y-6">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                    <Heart className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                    {isCreateMode ? 'Create New Persona' : 'The Essentials'}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Let's start with the basics. Every field is optional - share what feels right.
                  </p>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-green-600" />
                      <span>Basic Information</span>
                      <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                        <Clock className="w-3 h-3 mr-1" />
                        All Optional
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="personaName" className="text-sm font-medium text-gray-700">
                          Their name
                        </Label>
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
                        <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                          Your relationship
                        </Label>
                        <Input
                          id="relationship"
                          placeholder="e.g., mother, father, friend"
                          value={relationship}
                          onChange={(e) => setRelationship(e.target.value)}
                          className="border-green-200 focus:border-green-400"
                          data-testid="input-relationship"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Three words that describe them
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {adjectives.map((adjective, index) => (
                          <Input
                            key={index}
                            placeholder={`Word ${index + 1}`}
                            value={adjective}
                            onChange={(e) => {
                              const newAdjectives = [...adjectives];
                              newAdjectives[index] = e.target.value;
                              setAdjectives(newAdjectives);
                            }}
                            className="border-green-200 focus:border-green-400"
                            data-testid={`input-adjective-${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="favoriteMemory" className="text-sm font-medium text-gray-700">
                        Share one favorite memory
                      </Label>
                      <Textarea
                        id="favoriteMemory"
                        placeholder="Tell us about a moment that captures who they were..."
                        value={favoriteMemory}
                        onChange={(e) => setFavoriteMemory(e.target.value)}
                        rows={4}
                        className="border-green-200 focus:border-green-400"
                        data-testid="textarea-favorite-memory"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Upload a photo (optional)
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      {isCropping ? (
                        <div className="space-y-4">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Crop Your Photo</h3>
                            <p className="text-sm text-gray-600">Drag to move the selection area, drag the corner to resize</p>
                          </div>
                          <div 
                            className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden cursor-move select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            data-testid="crop-container"
                          >
                            {originalImage && (
                              <img 
                                ref={cropImageRef}
                                src={originalImage} 
                                alt="Original"
                                className="w-full h-full object-contain"
                                onLoad={handleImageLoad}
                                draggable={false}
                                data-testid="crop-image"
                              />
                            )}
                            
                            {/* Crop overlay */}
                            <div 
                              className="absolute border-2 border-green-500 bg-green-500/10"
                              style={{
                                left: cropArea.x,
                                top: cropArea.y,
                                width: cropArea.width,
                                height: cropArea.height,
                                pointerEvents: 'none'
                              }}
                              data-testid="crop-overlay"
                            >
                              {/* Resize handle */}
                              <div 
                                className="absolute w-4 h-4 bg-green-600 border-2 border-white rounded-full cursor-nw-resize"
                                style={{
                                  right: -8,
                                  bottom: -8,
                                  pointerEvents: 'auto'
                                }}
                                data-testid="crop-resize-handle"
                              />
                            </div>
                            
                            {/* Darkened areas outside crop */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: `
                                  linear-gradient(to right, 
                                    rgba(0,0,0,0.5) 0%, 
                                    rgba(0,0,0,0.5) ${cropArea.x}px,
                                    transparent ${cropArea.x}px,
                                    transparent ${cropArea.x + cropArea.width}px,
                                    rgba(0,0,0,0.5) ${cropArea.x + cropArea.width}px,
                                    rgba(0,0,0,0.5) 100%
                                  ),
                                  linear-gradient(to bottom,
                                    rgba(0,0,0,0.5) 0%,
                                    rgba(0,0,0,0.5) ${cropArea.y}px,
                                    transparent ${cropArea.y}px,
                                    transparent ${cropArea.y + cropArea.height}px,
                                    rgba(0,0,0,0.5) ${cropArea.y + cropArea.height}px,
                                    rgba(0,0,0,0.5) 100%
                                  )
                                `
                              }}
                            />
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline"
                              onClick={handleCropCancel}
                              className="flex-1 border-gray-300"
                              data-testid="button-cancel-crop"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCropConfirm}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white"
                              data-testid="button-confirm-crop"
                            >
                              Use This Crop
                            </Button>
                          </div>
                        </div>
                      ) : photoPreview ? (
                        <div className="space-y-2">
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={photoPreview} 
                              alt="Cropped Preview"
                              className="w-full h-full object-cover"
                              data-testid="image-preview"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                              onClick={removePhoto}
                              data-testid="button-remove-photo"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 justify-center border-green-200 hover:bg-green-50"
                              onClick={() => {
                                setIsCropping(true);
                              }}
                              data-testid="button-recrop-photo"
                            >
                              Re-crop
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 justify-center border-green-200 hover:bg-green-50"
                              onClick={() => fileInputRef.current?.click()}
                              data-testid="button-change-photo"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Different photo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full justify-center border-green-200 hover:bg-green-50"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose a photo
                        </Button>
                      )}
                      <p className="text-xs text-gray-500">You can always add more photos later</p>
                      
                      {/* Hidden canvas for image processing */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <div></div>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                    data-testid="button-next-essentials"
                  >
                    Continue to Legacy Information
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sub-step 2: Legacy Information (Obituary) */}
            {minimalSubStep === 'obituary-link' && (
              <div className="space-y-6">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                    <LinkIcon className="w-10 h-10 text-amber-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                    Legacy Information
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Did your loved one have an obituary? We can use this to gather additional context and memories.
                  </p>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-amber-100 shadow-lg max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <LinkIcon className="w-6 h-6 text-amber-600" />
                      <span>Obituary Information</span>
                      <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Optional
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Sharing an obituary link helps us understand their story better
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="obituaryUrl" className="text-sm font-medium text-gray-700">
                        Obituary URL (Legacy.com or other)
                      </Label>
                      <Input
                        id="obituaryUrl"
                        placeholder="https://www.legacy.com/obituaries/..."
                        value={obituaryUrl}
                        onChange={(e) => setObituaryUrl(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="input-obituary-url"
                      />
                      <p className="text-xs text-gray-500">
                        If you have an obituary from Legacy.com, Obituaries.com, or any other site, you can paste the link here
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-amber-600 mt-0.5">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 mb-1">Why add an obituary?</h4>
                          <p className="text-xs text-amber-700">
                            Obituaries often contain rich details about someone's life, achievements, and personality that can help us create a more authentic representation of your loved one.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    data-testid="button-back-obituary"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6"
                    data-testid="button-next-obituary"
                  >
                    Continue to Communication Style
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sub-step 3: Communication Style */}
            {minimalSubStep === 'communication-style' && (
              <div className="space-y-6">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                    <MessageCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                    {isCreateMode ? 'Create New Persona' : 'Communication Style'}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Help us understand how they communicated. All fields are optional.
                  </p>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg max-w-2xl mx-auto mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Voice & Communication Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="greeting" className="text-sm font-medium text-gray-700">
                        How did they usually greet you?
                      </Label>
                      <Input
                        id="greeting"
                        placeholder="e.g., Hey kiddo, What's up buttercup"
                        value={usualGreeting}
                        onChange={(e) => setUsualGreeting(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                        data-testid="input-usual-greeting"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="catchphrase" className="text-sm font-medium text-gray-700">
                        A phrase they said all the time
                      </Label>
                      <Input
                        id="catchphrase"
                        placeholder="Their catchphrase or inside joke"
                        value={catchphrase}
                        onChange={(e) => setCatchphrase(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                        data-testid="input-catchphrase"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        How they texted/talked
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(['formal', 'casual', 'lots-of-emojis', 'abbreviated', 'dramatic', 'dry-humor'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => toggleTextingStyle(style)}
                            className={getButtonClassName(textingStyles.includes(style))}
                            data-testid={`button-texting-${style}`}
                          >
                            {style.replace(/-/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Personality Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Were they more of a listener or a talker?
                      </Label>
                      <RadioGroup value={listenerTalker} onValueChange={(value: ListenerTalker) => setListenerTalker(value)}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="listener" id="listener" />
                            <Label htmlFor="listener">Listener</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="talker" id="talker" />
                            <Label htmlFor="talker">Talker</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="balanced" id="balanced" />
                            <Label htmlFor="balanced">Balanced</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        How did they handle conflict?
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(['avoided-it', 'tackled-head-on', 'made-jokes', 'got-quiet', 'needed-time'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => toggleConflictStyle(style)}
                            className={getButtonClassName(conflictStyles.includes(style))}
                            data-testid={`button-conflict-${style}`}
                          >
                            {style.replace(/-/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="madeThemLaugh" className="text-sm font-medium text-gray-700">
                        What always made them laugh?
                      </Label>
                      <Textarea
                        id="madeThemLaugh"
                        placeholder="Dad jokes, silly pets, specific memories..."
                        value={whatMadeThemLaugh}
                        onChange={(e) => setWhatMadeThemLaugh(e.target.value)}
                        rows={3}
                        className="border-blue-200 focus:border-blue-400"
                        data-testid="textarea-made-them-laugh"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theyWorried" className="text-sm font-medium text-gray-700">
                        What did they worry about most?
                      </Label>
                      <Textarea
                        id="theyWorried"
                        placeholder="Family safety, finances, your future..."
                        value={whatTheyWorried}
                        onChange={(e) => setWhatTheyWorried(e.target.value)}
                        rows={3}
                        className="border-blue-200 focus:border-blue-400"
                        data-testid="textarea-they-worried"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="px-6"
                    data-testid="button-back-communication"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6"
                    data-testid="button-next-communication"
                  >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sub-step 3: Finalize Personality */}
            {minimalSubStep === 'finalize-personality' && (
              <div className="space-y-6">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-purple-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                    {isCreateMode ? 'Create New Persona' : 'Finalize Personality'}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Review what you've shared and add any final context.
                  </p>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Summary</CardTitle>
                    <CardDescription>Here's what you've shared about {personaName || 'your loved one'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {personaName && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{personaName}</span>
                      </div>
                    )}
                    {relationship && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Relationship:</span>
                        <span className="font-medium">{relationship}</span>
                      </div>
                    )}
                    {adjectives.filter(Boolean).length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Personality:</span>
                        <span className="font-medium">{adjectives.filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {usualGreeting && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Greeting:</span>
                        <span className="font-medium">"{usualGreeting}"</span>
                      </div>
                    )}
                    {textingStyles.length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Communication:</span>
                        <span className="font-medium">{textingStyles.join(', ').replace(/-/g, ' ')}</span>
                      </div>
                    )}
                    {photoPreview && (
                      <div className="py-2 border-b border-gray-100">
                        <span className="text-gray-600">Photo:</span>
                        <img 
                          src={photoPreview} 
                          alt="Uploaded" 
                          className="mt-2 w-20 h-20 object-cover rounded-lg"
                          data-testid="image-summary-preview"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Anything else to add?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any additional context, memories, or details you'd like to share..."
                      value={finalNotes}
                      onChange={(e) => setFinalNotes(e.target.value)}
                      rows={5}
                      className="border-purple-200 focus:border-purple-400"
                      data-testid="textarea-final-notes"
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="px-6"
                    data-testid="button-back-finalize"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                    data-testid="button-complete-minimal-start"
                  >
                    Complete Minimal Start
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Daily Invitations */}
        {step === 'daily-invitations' && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                {isCreateMode ? 'Create New Persona' : 'Daily Invitations'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Set up gentle prompts to help build memories over time. These are completely optional and can be changed later.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>Memory Building</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    How often would you like gentle memory prompts?
                  </Label>
                  <Select value={cadence} onValueChange={(value: MemoryCadence) => setCadence(value)}>
                    <SelectTrigger className="border-blue-200" data-testid="select-cadence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily - Every day</SelectItem>
                      <SelectItem value="every-few-days">Every few days - 2-3 times per week</SelectItem>
                      <SelectItem value="weekly">Weekly - Once a week</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    You can always adjust this later or pause the prompts anytime.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Gentle questions like "What made them laugh?"</li>
                    <li>• Memory prompts about special occasions</li>
                    <li>• Invitations to share photos or stories</li>
                    <li>• No pressure - skip whenever you want</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="px-6"
                data-testid="button-back-daily-invitations"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6"
                data-testid="button-next-daily-invitations"
              >
                Continue to Natural Growth
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Natural Growth */}
        {step === 'natural-growth' && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="header-title">
                {isCreateMode ? 'Create New Persona' : 'Natural Growth'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your digital memory will grow naturally over time as you share more stories and moments.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Organic Development</h3>
                      <p className="text-gray-600 text-sm">Memories will become more vivid as you share more stories</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Gentle Learning</h3>
                      <p className="text-gray-600 text-sm">The persona learns your unique relationship patterns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Your Timeline</h3>
                      <p className="text-gray-600 text-sm">Add memories at your own pace, whenever you feel ready</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                You're all set! Your digital memory journey begins now. You can always return to add more details, photos, and stories.
              </p>
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="px-6"
                data-testid="button-back-natural-growth"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={isCreatingPersona}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 disabled:opacity-70 disabled:cursor-not-allowed"
                data-testid="button-complete-onboarding"
              >
                {isCreatingPersona ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating your persona...
                  </>
                ) : (
                  <>
                    Enter Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}