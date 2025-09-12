import { useState } from "react";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const { toast } = useToast();

  const fillTestCredentials = () => {
    setEmail('demo@gmail.com');
    setPassword('demouser123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both email and password."
      });
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });

      // Redirect to onboarding after successful sign in
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 1000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Invalid email or password."
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your journey of eternal connection</p>
          </div>

          {/* Sign In Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Test Credentials Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillTestCredentials}
                  className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300"
                  data-testid="button-fill-test-credentials"
                >
                  Fill Test Credentials
                </Button>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>

              {/* Test Credentials Info */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-700 font-medium mb-1">Test Account:</p>
                <p className="text-xs text-purple-600">Email: demo@gmail.com</p>
                <p className="text-xs text-purple-600">Password: demouser123</p>
                <p className="text-xs text-purple-500 mt-1 italic">Click "Fill Test Credentials" to use these</p>
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