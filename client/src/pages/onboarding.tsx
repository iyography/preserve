import { useState, useEffect } from "react";
import { Heart, MessageCircle, Clock, Users, Sparkles, ArrowRight, ChevronLeft, Star, Shield, Brain, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import EmailConfirmationModal from "@/components/EmailConfirmationModal";

interface OnboardingApproach {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  duration: string;
  comfortLevel: 'gentle' | 'moderate' | 'deep' | 'collaborative';
  icon: any;
  features: string[];
  recommended?: boolean;
  premium?: boolean;
}

const approaches: OnboardingApproach[] = [
  {
    id: 'gradual-awakening',
    name: 'Taking it slow',
    subtitle: 'Start simple, grow together',
    description: 'Begin with basic memories and watch your loved one\'s persona develop naturally over time through family contributions.',
    duration: '3 minutes to start',
    comfortLevel: 'gentle',
    icon: TreePine,
    features: [
      'Minimal initial setup',
      'Daily memory invitations',
      'Family collaboration',
      'Progressive sophistication'
    ],
    recommended: true
  },
  {
    id: 'ai-guided-interview',
    name: 'Ready to share', 
    subtitle: 'Therapeutic conversation',
    description: 'An empathetic AI interviewer guides you through sharing memories in a natural, supportive conversation.',
    duration: '35-60 minutes',
    comfortLevel: 'moderate',
    icon: MessageCircle,
    features: [
      'Natural conversation flow',
      'Real-time persona building',
      'Emotional safety protocols',
      'Live persona testing'
    ],
    recommended: true
  },
  {
    id: 'digital-seance',
    name: 'Seeking profound connection',
    subtitle: 'Sacred connection ritual',
    description: 'A profound, ceremonial experience that honors the gravity of connecting with your loved one through structured ritual.',
    duration: '45 minutes',
    comfortLevel: 'deep',
    icon: Sparkles,
    features: [
      'Sacred setup ceremony',
      'Memory offering ritual',
      'Guided first conversation',
      'Maximum emotional impact'
    ],
    premium: true
  },
  {
    id: 'living-archive',
    name: 'Bringing others in',
    subtitle: 'Community celebration',
    description: 'Create a comprehensive life documentation with contributions from extended family, friends, and community members.',
    duration: '15 minutes setup',
    comfortLevel: 'collaborative',
    icon: Users,
    features: [
      'Community contribution system',
      'Professional life integration',
      'Crowdsourced memory validation',
      'Broad social engagement'
    ]
  }
];


export default function Onboarding() {
  const [step, setStep] = useState<'welcome' | 'approach'>('welcome');
  const [selectedApproach, setSelectedApproach] = useState<string>('');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Email confirmation handling
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  
  // Check URL parameters for email confirmation status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailConfirmedParam = urlParams.get('email_confirmed');
    const emailErrorParam = urlParams.get('email_confirmation_error');
    const errorMessage = urlParams.get('message');
    
    if (emailConfirmedParam === 'true') {
      setEmailConfirmed(true);
      // Clear URL params
      window.history.replaceState({}, '', '/onboarding');
    } else if (emailErrorParam === 'true') {
      console.error('Email confirmation error:', errorMessage);
      setShowEmailConfirmation(true);
    } else if (!user?.email_confirmed_at) {
      // Show confirmation modal if email is not confirmed
      setShowEmailConfirmation(true);
    }
  }, [user]);
  
  // Handle email confirmation resend
  const [isResending, setIsResending] = useState(false);
  
  const handleResendEmail = async () => {
    if (!user?.email || isResending) return;
    
    setIsResending(true);
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      
      if (response.ok) {
        console.log('Confirmation email resent successfully');
      }
    } catch (error) {
      console.error('Failed to resend confirmation email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const progress = step === 'welcome' ? 50 : 100;

  const handleNext = () => {
    // Block progression if email is not confirmed
    if (!emailConfirmed && !user?.email_confirmed_at) {
      setShowEmailConfirmation(true);
      return;
    }
    
    if (step === 'welcome') setStep('approach');
    else if (step === 'approach') {
      // Redirect to the specific approach flow
      if (selectedApproach) {
        setLocation(`/onboarding/${selectedApproach}`);
      }
    }
  };

  const handleBack = () => {
    if (step === 'approach') setStep('welcome');
  };

  const canContinue = () => {
    if (step === 'approach') return selectedApproach;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-medium text-gray-500">Setting up your experience</h2>
            <span className="text-xs text-gray-400">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Journey</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                You're about to create something beautiful—a way to preserve and connect with the memories of someone special. 
                We'll guide you through this process with care and respect for your unique needs.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Your Privacy & Emotional Safety</h3>
                    <p className="text-gray-600 text-sm">Everything you share is private and secure. You control who has access.</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Designed for Healing</h3>
                    <p className="text-gray-600 text-sm">Our approach is based on therapeutic principles and grief support research.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Take Your Time</h3>
                    <p className="text-gray-600 text-sm">Go at your own pace. You can pause, save, and return whenever you're ready.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleNext}
              size="lg" 
              className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg px-8"
              data-testid="button-continue-welcome"
            >
              I'm Ready to Begin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Approach Selection Step */}
        {step === 'approach' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Path</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Each approach is designed to honor your loved one's memory in a meaningful way. 
                Choose the one that feels right for you today.
              </p>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
              {approaches.map((approach) => {
                const IconComponent = approach.icon;
                return (
                  <Card
                    key={approach.id}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      selectedApproach === approach.id
                        ? 'border-purple-500 bg-purple-50/50 shadow-lg'
                        : 'border-gray-200 bg-white/70 hover:border-purple-200 hover:shadow-md'
                    } backdrop-blur-sm`}
                    onClick={() => setSelectedApproach(approach.id)}
                    data-testid={`card-approach-${approach.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedApproach === approach.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{approach.name}</h3>
                            {approach.recommended && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <Star className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                            {approach.premium && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                                Premium
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-purple-600 font-medium mb-2">{approach.subtitle}</p>
                          <p className="text-gray-600 mb-4">{approach.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{approach.duration}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {approach.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedApproach === approach.id
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedApproach === approach.id && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between mt-12 max-w-4xl mx-auto">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="px-6"
                data-testid="button-back-approach"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canContinue()}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                data-testid="button-continue-approach"
              >
                Start My Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        isOpen={showEmailConfirmation}
        onClose={() => {
          if (emailConfirmed || user?.email_confirmed_at) {
            setShowEmailConfirmation(false);
          }
        }}
        email={user?.email || ''}
        onResend={handleResendEmail}
        isResending={isResending}
      />
    </div>
  );
}