import { useState } from "react";
import { Heart, Clock, ArrowRight, ChevronLeft, TreePine, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Simplified types
type GradualStep = 'minimal-start' | 'daily-invitations' | 'natural-growth';
type MemoryCadence = 'daily' | 'every-few-days' | 'weekly';

export default function GradualAwakening() {
  const [step, setStep] = useState<GradualStep>('minimal-start');
  
  // Basic persona info
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adjectives, setAdjectives] = useState(['', '', '']);
  const [favoriteMemory, setFavoriteMemory] = useState('');
  
  // Daily setup
  const [cadence, setCadence] = useState<MemoryCadence>('every-few-days');
  
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Calculate progress
  const progress = step === 'minimal-start' ? 33 : step === 'daily-invitations' ? 66 : 100;

  const handleNext = async () => {
    if (step === 'minimal-start') {
      setStep('daily-invitations');
    } else if (step === 'daily-invitations') {
      setStep('natural-growth');
    } else if (step === 'natural-growth') {
      // Complete onboarding and redirect to dashboard
      toast({
        title: "Welcome to Your Digital Memory Journey!",
        description: "Your persona is being prepared. You can start creating memories anytime."
      });
      setLocation('/dashboard');
    }
  };

  const handleBack = () => {
    if (step === 'daily-invitations') {
      setStep('minimal-start');
    } else if (step === 'natural-growth') {
      setStep('daily-invitations');
    }
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
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
            <span className={step === 'minimal-start' ? 'text-green-600 font-medium' : ''}>Minimal Start</span>
            <span className={step === 'daily-invitations' ? 'text-green-600 font-medium' : ''}>Daily Invitations</span>
            <span className={step === 'natural-growth' ? 'text-green-600 font-medium' : ''}>Natural Growth</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Minimal Start */}
        {step === 'minimal-start' && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <TreePine className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Minimal Start</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Let's start with just a few essential details. You can always add more memories later.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-green-600" />
                  <span>Essential Details</span>
                  <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Optional
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
              </CardContent>
            </Card>

            <div className="flex justify-end mt-8">
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6"
                data-testid="button-next-minimal-start"
              >
                Continue to Daily Invitations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Daily Invitations */}
        {step === 'daily-invitations' && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Daily Invitations</h1>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Natural Growth</h1>
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8"
                data-testid="button-complete-onboarding"
              >
                Enter Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}