import { useState } from "react";
import { ArrowRight, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "If an account with this email exists, you will receive a password reset link shortly.",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "If an account with this email exists, you will receive a password reset link shortly.",
        });
        setIsEmailSent(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Particle System Background */}
      <ParticleSystem />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-xl">Preserving Connections</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEmailSent ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className="text-gray-600">
              {isEmailSent 
                ? "We've sent you a password reset link"
                : "Enter your email to receive a password reset link"
              }
            </p>
          </div>

          {/* Forgot Password Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                {isEmailSent ? "Email Sent" : "Reset Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEmailSent ? (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
                      {email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your email and click the link to reset your password. 
                      The link will expire in 1 hour for security.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setIsEmailSent(false);
                        setEmail('');
                      }}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                      data-testid="button-send-another"
                    >
                      Send Another Email
                    </Button>
                    
                    <Link href="/sign-in">
                      <Button
                        variant="ghost"
                        className="w-full text-gray-600 hover:text-purple-600"
                        data-testid="button-back-to-signin"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                    data-testid="button-reset-password"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              )}

              {!isEmailSent && (
                <div className="mt-6 text-center">
                  <Link href="/sign-in" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    Back to Sign In
                  </Link>
                </div>
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