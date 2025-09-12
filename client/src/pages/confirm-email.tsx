import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { OnboardingSession } from "@shared/schema";

type ConfirmationState = 'loading' | 'success' | 'error' | 'already_confirmed';

export default function ConfirmEmail() {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Check for existing onboarding sessions to resume
  const { data: existingSessions } = useQuery<OnboardingSession[]>({
    queryKey: ['/api/onboarding-sessions'],
    enabled: !!user?.id && confirmationState === 'success',
  });

  // Handle email confirmation on component mount
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setErrorMessage(error.message || 'Failed to confirm email');
            setConfirmationState('error');
            return;
          }

          if (data.user) {
            setConfirmationState('success');
            toast({
              title: "Email Confirmed!",
              description: "Your email has been verified successfully. Welcome to Preserving Connections!"
            });
          }
        } else if (user && !authLoading) {
          // User is already logged in, email might already be confirmed
          setConfirmationState('already_confirmed');
        } else if (!accessToken && !refreshToken && !type) {
          // No confirmation tokens in URL
          setErrorMessage('Invalid confirmation link. Please check your email and try again.');
          setConfirmationState('error');
        }
      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setErrorMessage('An unexpected error occurred. Please try again.');
        setConfirmationState('error');
      }
    };

    if (!authLoading) {
      handleEmailConfirmation();
    }
  }, [user, authLoading, toast]);

  const handleContinueToOnboarding = () => {
    // Check if user has existing onboarding sessions
    if (existingSessions && existingSessions.length > 0) {
      const latestSession = existingSessions[0];
      
      if (!latestSession.isCompleted) {
        // Resume existing onboarding
        if (latestSession.approach === 'gradual-awakening') {
          setLocation('/gradual-awakening');
        } else if (latestSession.approach === 'ai-guided-interview') {
          setLocation('/ai-guided-interview');
        } else {
          setLocation('/onboarding');
        }
        
        toast({
          title: "Resuming Your Journey",
          description: "We'll pick up where you left off in your onboarding process."
        });
      } else {
        // User has completed onboarding, go to dashboard
        setLocation('/dashboard');
      }
    } else {
      // No existing sessions, start fresh onboarding
      setLocation('/onboarding');
    }
  };

  const handleGoToDashboard = () => {
    setLocation('/dashboard');
  };

  if (authLoading || confirmationState === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 via-indigo-50/20 to-purple-100/50 animate-gradient-xy"></div>
        <ParticleSystem />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming Your Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 via-indigo-50/20 to-purple-100/50 animate-gradient-xy"></div>
      
      {/* Moving gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-200/20 via-transparent to-indigo-200/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-100/10 to-transparent animate-bounce-slow"></div>
      </div>

      {/* Fairy Particles */}
      <ParticleSystem />

      {/* Floating gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-purple-200/20 to-indigo-200/15 rounded-full blur-3xl floating-cloud-1"></div>
        <div className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-violet-200/15 to-purple-300/10 rounded-full blur-3xl floating-cloud-2"></div>
        <div className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-indigo-200/15 to-purple-200/20 rounded-full blur-3xl floating-cloud-3"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-xl">Preserving Connections</span>
            </Link>
          </div>

          {/* Confirmation Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                {confirmationState === 'success' ? 'Email Confirmed!' :
                 confirmationState === 'already_confirmed' ? 'Welcome Back!' :
                 'Confirmation Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Success State */}
              {confirmationState === 'success' && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Your email has been verified!</h3>
                    <p className="text-gray-600">
                      Thank you for confirming your email address. You can now continue with creating your first persona and preserving precious memories.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleContinueToOnboarding}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
                      data-testid="button-continue-onboarding"
                    >
                      Continue Your Journey
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={handleGoToDashboard}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      data-testid="button-go-dashboard"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </>
              )}

              {/* Already Confirmed State */}
              {confirmationState === 'already_confirmed' && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">You're already confirmed!</h3>
                    <p className="text-gray-600">
                      Your email address is already verified. You can continue using Preserving Connections.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleContinueToOnboarding}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
                      data-testid="button-continue-onboarding"
                    >
                      Continue Your Journey
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={handleGoToDashboard}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      data-testid="button-go-dashboard"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </>
              )}

              {/* Error State */}
              {confirmationState === 'error' && (
                <>
                  <div className="flex justify-center">
                    <AlertCircle className="w-16 h-16 text-red-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Confirmation Failed</h3>
                    <p className="text-gray-600">
                      {errorMessage || 'We were unable to confirm your email address. Please try again or contact support if the problem persists.'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setLocation('/register')}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
                      data-testid="button-back-register"
                    >
                      Back to Registration
                    </Button>
                    <Button
                      onClick={() => setLocation('/sign-in')}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      data-testid="button-sign-in"
                    >
                      Sign In Instead
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}