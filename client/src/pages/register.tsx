import { useState } from "react";
import { Eye, EyeOff, User, Lock, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Helper function to determine where to route user after sign-up (same as sign-in)
async function determineUserRoute(): Promise<string> {
  try {
    // Get the current session to extract the access token (same as apiRequest)
    const { data: { session } } = await supabase.auth.getSession();
    
    // Helper function to make authenticated requests using the same pattern as apiRequest
    const makeAuthenticatedRequest = async (url: string) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if user is authenticated
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      return response;
    };

    // Check if user has any personas
    const personasResponse = await makeAuthenticatedRequest('/api/personas');
    
    if (personasResponse.ok) {
      const personas = await personasResponse.json();
      
      // If user has completed personas, go to dashboard
      if (personas.length > 0 && personas.some((p: any) => p.status === 'completed')) {
        return '/dashboard';
      }
      
      // If user has personas but they're all in progress, go to dashboard too
      if (personas.length > 0) {
        return '/dashboard';
      }
    }
    
    // Check if user has any incomplete onboarding sessions
    const sessionsResponse = await makeAuthenticatedRequest('/api/onboarding-sessions');
    
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json();
      
      // Find the most recent incomplete session
      const incompleteSessions = sessions.filter((s: any) => !s.isCompleted);
      if (incompleteSessions.length > 0) {
        // Sort by creation date if it exists, with fallback handling
        const recentSession = incompleteSessions.sort((a: any, b: any) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        })[0];
        
        // Route to the specific onboarding approach where they left off
        if (recentSession.approach) {
          return `/onboarding/${recentSession.approach}`;
        }
      }
    }
    
    // Default: new user, send to onboarding flow
    return '/onboarding';
    
  } catch (error) {
    console.error('Error checking user state:', error);
    // Fallback to onboarding on any error
    return '/onboarding';
  }
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to send welcome email after registration
  const sendWelcomeEmail = async (email: string, firstName: string) => {
    try {
      const response = await fetch('/api/welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName }),
      });

      if (!response.ok) {
        console.warn('Failed to send welcome email - this is not critical');
        // Don't throw error - welcome email failure shouldn't block registration
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (error) {
      console.warn('Error sending welcome email:', error);
      // Don't throw error - welcome email failure shouldn't block registration
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration form submitted with:', { email: formData.email, firstName: formData.firstName, lastName: formData.lastName });
    
    if (formData.password !== formData.confirmPassword) {
      console.log('Password mismatch error');
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again."
      });
      return;
    }

    if (formData.password.length < 6) {
      console.log('Password too short error');
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting Supabase registration...');

    try {
      // Step 1: Register with Supabase (no email confirmation required)
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      console.log('Supabase registration successful:', result);

      // Step 2: Send welcome email (non-blocking)
      sendWelcomeEmail(formData.email, formData.firstName);
        
      // Step 3: Show success message and redirect to onboarding
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Preserving Connections! Let's get you started."
      });
      
      // Wait a moment for the toast to show, then redirect
      setTimeout(() => {
        // Redirect directly to onboarding - user is now fully authenticated
        setLocation('/onboarding');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration."
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Family</h1>
            <p className="text-gray-600">Create your account to begin preserving precious memories</p>
          </div>

          {/* Registration Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      required
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

                {/* Password match validation */}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required
                    className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={formData.password !== formData.confirmPassword || isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
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