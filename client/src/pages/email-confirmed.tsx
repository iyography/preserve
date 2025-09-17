import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowRight, Sparkles, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";

export default function EmailConfirmed() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Parse query parameters to determine success/error state
  const urlParams = new URLSearchParams(window.location.search);
  const isConfirmed = urlParams.get('confirmed') === 'true';
  const hasError = urlParams.get('error') === 'true';
  const errorMessage = urlParams.get('message') || 'An error occurred during email verification';

  // Auto-redirect countdown (only for successful confirmations)
  useEffect(() => {
    if (!isConfirmed || hasError) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          setLocation('/onboarding');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConfirmed, hasError, setLocation]);

  const handleContinue = () => {
    setIsRedirecting(true);
    setLocation('/onboarding');
  };

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
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
            <div className={`w-1 h-1 ${isConfirmed && !hasError ? 'bg-green-300' : 'bg-purple-300'} rounded-full opacity-60`}></div>
          </div>
        ))}
      </div>

      {/* Success sparkles animation */}
      {isConfirmed && !hasError && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-bounce"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400 opacity-70" />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center">
          {/* Success State */}
          {isConfirmed && !hasError && (
            <>
              <div className="mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                    <CheckCircle className="w-12 h-12 text-green-600" data-testid="icon-success" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-success-title">
                  Email Confirmed! ✨
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed" data-testid="text-success-description">
                  Welcome to Preserving Connections! Your email has been successfully verified 
                  and your account is now ready to begin this meaningful journey.
                </p>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-xl mb-8" data-testid="card-confirmation-details">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <Mail className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900" data-testid="text-account-ready">Account Successfully Activated</h3>
                      <p className="text-gray-600 text-sm">You can now start preserving precious memories</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium" data-testid="text-next-step">Ready to begin your onboarding journey</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!isRedirecting ? (
                      <>
                        <Button 
                          onClick={handleContinue}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                          size="lg"
                          data-testid="button-continue-onboarding"
                        >
                          Continue to Onboarding
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <span data-testid="text-auto-redirect">Auto-redirecting in {countdown} seconds...</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-purple-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span data-testid="text-redirecting">Taking you to onboarding...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Error State */}
          {hasError && (
            <>
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <XCircle className="w-12 h-12 text-red-600" data-testid="icon-error" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-error-title">
                  Verification Failed
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed" data-testid="text-error-description">
                  We couldn't verify your email address. This could be due to an expired or invalid confirmation link.
                </p>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border-red-100 shadow-xl mb-8" data-testid="card-error-details">
                <CardContent className="p-8">
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription data-testid="text-error-message">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Don't worry! You can request a new confirmation email or try signing in if you've already verified your account.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        asChild
                        variant="outline"
                        className="flex-1"
                        data-testid="button-register-again"
                      >
                        <Link href="/register">
                          Request New Confirmation
                        </Link>
                      </Button>
                      
                      <Button 
                        asChild
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        data-testid="button-sign-in"
                      >
                        <Link href="/sign-in">
                          Try Signing In
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Neutral State (no query params) */}
          {!isConfirmed && !hasError && (
            <>
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Mail className="w-12 h-12 text-purple-600" data-testid="icon-email" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-neutral-title">
                  Email Verification
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed" data-testid="text-neutral-description">
                  Please check your email for a verification link, or sign in if you've already verified your account.
                </p>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-xl mb-8" data-testid="card-neutral-options">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        asChild
                        variant="outline"
                        className="flex-1"
                        data-testid="button-register"
                      >
                        <Link href="/register">
                          Create Account
                        </Link>
                      </Button>
                      
                      <Button 
                        asChild
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        data-testid="button-sign-in-neutral"
                      >
                        <Link href="/sign-in">
                          Sign In
                        </Link>
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleReturnHome}
                      variant="ghost"
                      className="w-full"
                      data-testid="button-return-home"
                    >
                      Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}