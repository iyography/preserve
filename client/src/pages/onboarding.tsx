import { useState } from "react";
import { Heart, Clock, ArrowRight, ChevronLeft, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";



export default function Onboarding() {
  const [step, setStep] = useState<'welcome' | 'essential'>('welcome');
  // Essential info state
  const [personaName, setPersonaName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adjectives, setAdjectives] = useState(['', '', '']);
  const [favoriteMemory, setFavoriteMemory] = useState('');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  


  const handleNext = () => {
    if (step === 'welcome') {
      setStep('essential');
    } else if (step === 'essential') {
      // Validate essential info
      if (!personaName || !relationship || adjectives.some(adj => !adj.trim()) || !favoriteMemory) {
        return; // Stay on current step if validation fails
      }
      // Redirect to gradual awakening with essential data populated
      setLocation('/onboarding/gradual-awakening?step=tell-us-more');
    }
  };

  const handleBack = () => {
    if (step === 'essential') setStep('welcome');
  };

  const canContinue = () => {
    if (step === 'essential') {
      return personaName && relationship && adjectives.every(adj => adj.trim()) && favoriteMemory;
    }
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

        {/* Essential Information Step */}
        {step === 'essential' && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Essential Information</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Just the essentials to bring them back. We'll add more memories together over time.
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-green-100 shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-green-600" />
                  <span>Essential Details</span>
                  <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    3 minutes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="personaName" className="text-sm font-medium text-gray-700">
                      Their name <span className="text-red-500">*</span>
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
                      Your relationship <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., mother, father, beloved friend"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                      data-testid="input-relationship"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Three words that describe them <span className="text-red-500">*</span>
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
                    Share one favorite memory <span className="text-red-500">*</span>
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

            <div className="flex justify-between mt-12 max-w-4xl mx-auto">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="px-6"
                data-testid="button-back-essential"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canContinue()}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6"
                data-testid="button-continue-essential"
              >
                Continue to Tell Us More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}