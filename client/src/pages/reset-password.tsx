import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      setIsTokenValid(false);
      return;
    }

    setToken(resetToken);
    
    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/verify-reset-token?token=${resetToken}`);
        const data = await response.json();
        
        if (data.valid) {
          setIsTokenValid(true);
          setUserEmail(data.email);
        } else {
          setIsTokenValid(false);
          toast({
            title: "Invalid or expired link",
            description: data.error || "This password reset link is no longer valid.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsTokenValid(false);
        toast({
          title: "Error",
          description: "Unable to verify password reset link. Please try again.",
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase
      await updatePassword(newPassword);
      
      setIsPasswordReset(true);
      toast({
        title: "Password updated successfully",
        description: "Your password has been reset. You can now sign in with your new password.",
      });

    } catch (error) {
      toast({
        title: "Error resetting password",
        description: error instanceof Error ? error.message : "There was an error resetting your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden flex items-center justify-center">
        <ParticleSystem />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying password reset link...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
        <ParticleSystem />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired. Password reset links are only valid for 1 hour.
                </p>
                <div className="space-y-3">
                  <Link href="/forgot-password">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
                      Request New Reset Link
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      <ParticleSystem />
      
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
              {isPasswordReset ? "Password Updated" : "Reset Your Password"}
            </h1>
            <p className="text-gray-600">
              {isPasswordReset 
                ? "You can now sign in with your new password"
                : `Set a new password for ${userEmail}`
              }
            </p>
          </div>

          {/* Reset Password Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                {isPasswordReset ? "Success" : "New Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPasswordReset ? (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Your password has been successfully updated!
                    </p>
                    <p className="text-sm text-gray-600">
                      You can now sign in to your account using your new password.
                    </p>
                  </div>
                  
                  <Link href="/sign-in">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-go-to-signin"
                    >
                      Go to Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                        minLength={8}
                        data-testid="input-new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                    data-testid="button-update-password"
                  >
                    {isLoading ? "Updating Password..." : "Update Password"}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
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