import { useState } from "react";
import { Heart, User, Camera, Upload, FileText, PlayCircle, ArrowRight, CheckCircle, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

interface Step {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: any;
}

export default function CreateFirstPersona() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      id: 1,
      title: "Share Basic Information",
      description: "Tell us about your loved one - their name, relationship to you, and what made them special.",
      duration: "2-3 minutes",
      icon: User
    },
    {
      id: 2,
      title: "Choose Your Approach",
      description: "Select from our four therapeutic onboarding methods based on your comfort level.",
      duration: "1 minute",
      icon: Heart
    },
    {
      id: 3,
      title: "Gather Memories",
      description: "Collect photos, voice recordings, videos, or written memories that capture their essence.",
      duration: "15-60 minutes",
      icon: Camera
    },
    {
      id: 4,
      title: "Review & Refine",
      description: "Test your persona and make adjustments to ensure it feels authentic.",
      duration: "10-15 minutes",
      icon: CheckCircle
    }
  ];

  const approaches = [
    {
      name: "AI-Guided Memory Interview",
      description: "Gentle conversation with our empathetic AI interviewer Sarah",
      duration: "35-60 minutes",
      difficulty: "Gentle",
      recommended: true
    },
    {
      name: "Gradual Awakening",
      description: "Start simple and add complexity over time",
      duration: "3+ minutes",
      difficulty: "Easy Start",
      recommended: false
    },
    {
      name: "Digital Séance",
      description: "Sacred ritual approach for spiritual connection",
      duration: "45 minutes",
      difficulty: "Deep",
      recommended: false
    },
    {
      name: "Living Archive Builder",
      description: "Community-driven memory collection",
      duration: "15+ minutes",
      difficulty: "Collaborative",
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 via-indigo-50/20 to-purple-100/50 animate-gradient-xy"></div>
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-200/20 via-transparent to-indigo-200/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-100/10 to-transparent animate-bounce-slow"></div>
      </div>

      <ParticleSystem />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </Link>
            
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Heart className="w-3 h-3 mr-1" />
              Getting Started Guide
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Create Your First Persona
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A step-by-step guide to preserving your loved one's memory with care, respect, and authenticity.
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>30-90 minutes total</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Completely private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Emotionally supported</span>
            </div>
          </div>

          <Button 
            onClick={() => window.location.href = '/register'}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Creating Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Step-by-Step Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your Journey in Four Simple Steps
          </h2>
          
          <div className="grid gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Step {step.id}: {step.title}
                          </h3>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {step.duration}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Approach Selection Guide */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Choose Your Comfort Level
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Each approach is designed to honor your emotional needs while creating an authentic digital memory.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {approaches.map((approach) => (
              <Card key={approach.name} className={`bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 ${approach.recommended ? 'ring-2 ring-purple-300' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{approach.name}</CardTitle>
                    {approach.recommended && (
                      <Badge className="bg-purple-600 text-white">Recommended</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">{approach.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600 font-medium">{approach.duration}</span>
                    <span className="text-gray-500">{approach.difficulty}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What You'll Need */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What You'll Need</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <p className="text-gray-600 text-sm">Their name, your relationship, and what made them special to you.</p>
              </div>
              <div className="text-center">
                <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Memories (Optional)</h3>
                <p className="text-gray-600 text-sm">Photos, voice recordings, videos, or written memories that capture their essence.</p>
              </div>
              <div className="text-center">
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Time & Privacy</h3>
                <p className="text-gray-600 text-sm">A quiet space where you can reflect without interruption.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emotional Support Notice */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-16">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              You're Not Alone in This Journey
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Our AI interviewer Sarah is trained in grief-informed care, and we have licensed counselors available 
              if you need additional support. You can pause or stop at any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                View Crisis Resources
              </Button>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                Connect with Counselors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Start */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Begin?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Take the first step in preserving precious memories. You can always come back and add more later.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/community'}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}