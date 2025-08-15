import { useState } from "react";
import { Play, Crown, Heart, Mic, MessageCircle, Volume2, Infinity, Twitter, Facebook, Instagram, Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-celestial-gradient text-celestial-950 overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-celestial-700 to-celestial-800 rounded-full flex items-center justify-center">
                <Infinity className="text-white w-4 h-4" />
              </div>
              <span className="text-celestial-900 font-semibold text-lg">Preserving Connections</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-celestial-800 hover:text-celestial-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Home
                </button>
                <a href="#personas" className="text-celestial-700 hover:text-celestial-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Personas
                </a>
                <a href="#create" className="text-celestial-700 hover:text-celestial-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Create
                </a>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-celestial-700 hover:text-celestial-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Pricing
                </button>
                <a href="#ambassador" className="text-celestial-700 hover:text-celestial-900 px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200">
                  <Heart className="w-4 h-4 mr-1" />
                  Memory Ambassador
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-celestial-700 hover:text-celestial-900">
                Sign in
              </Button>
              <Button className="bg-gradient-to-r from-celestial-700 to-celestial-800 hover:from-celestial-600 hover:to-celestial-700 text-white">
                Sign up
              </Button>
              <Button 
                variant="ghost" 
                className="md:hidden text-celestial-900"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 px-4 z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-celestial-950">Keep Their Memory</span>
            <br />
            <span className="bg-gradient-to-r from-celestial-700 via-celestial-800 to-celestial-900 bg-clip-text text-transparent">
              Alive Forever
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-celestial-800 mb-12 leading-relaxed max-w-3xl mx-auto">
            Create an AI persona of your loved one that preserves their personality, stories, and wisdom. Continue meaningful conversations and share new memories with them.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => scrollToSection('pricing')}
              className="bg-gradient-to-r from-celestial-700 to-celestial-800 hover:from-celestial-600 hover:to-celestial-700 text-white px-8 py-4 rounded-xl text-lg font-semibold"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-3" />
              View Pricing Plans
            </Button>
            
            <Button 
              variant="outline"
              className="glassmorphism text-celestial-900 px-8 py-4 rounded-xl text-lg font-medium border-celestial-600"
              size="lg"
            >
              <Play className="w-5 h-5 mr-3" />
              Try Demo with Grandma Rose
            </Button>
          </div>
        </div>
      </section>
      
      {/* Founder Message Section */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="glassmorphism rounded-3xl p-8 transition-all duration-300 border-celestial-400">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-celestial-700 to-celestial-800 rounded-full flex items-center justify-center">
                  <Volume2 className="text-white w-6 h-6" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-celestial-950 mb-2">
                  A Personal Message from Founder Michael Vallee
                </h3>
                <p className="text-celestial-800 mb-4">
                  Hear why we created Preserving Connections and how it can help your family preserve precious memories
                </p>
                
                <AudioPlayer />
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Features Preview Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-celestial-950 mb-6">
              Experience the Magic of
              <span className="bg-gradient-to-r from-celestial-700 to-celestial-800 bg-clip-text text-transparent"> Digital Immortality</span>
            </h2>
            <p className="text-xl text-celestial-800 max-w-3xl mx-auto">
              Our advanced AI technology captures the essence of your loved ones, creating lasting connections that transcend time
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Voice & Personality",
                description: "Capture their unique speaking patterns, stories, and wisdom for future generations"
              },
              {
                icon: Heart,
                title: "Share New Memories",
                description: "Continue creating meaningful moments and sharing life updates with your loved ones"
              },
              {
                icon: MessageCircle,
                title: "Natural Conversations",
                description: "Experience realistic interactions that feel authentic and provide comfort"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glassmorphism rounded-2xl p-8 text-center transition-all duration-300 border-celestial-400"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-celestial-700 to-celestial-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-celestial-950 mb-4">{feature.title}</h3>
                <p className="text-celestial-800">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section 
        className="relative z-10 px-4 py-20"
        id="pricing"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glassmorphism rounded-3xl p-12 transition-all duration-300 border-celestial-400">
            <h2 className="text-3xl md:text-4xl font-bold text-celestial-950 mb-6">
              Begin Your Journey of
              <span className="bg-gradient-to-r from-celestial-700 to-celestial-800 bg-clip-text text-transparent"> Eternal Connection</span>
            </h2>
            <p className="text-xl text-celestial-800 mb-8">
              Start preserving precious memories today and keep your loved ones close forever
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                className="bg-gradient-to-r from-celestial-700 to-celestial-800 hover:from-celestial-600 hover:to-celestial-700 text-white px-8 py-4 rounded-xl text-lg font-semibold"
                size="lg"
              >
                <Star className="w-5 h-5 mr-3" />
                Get Started Today
              </Button>
              
              <Button 
                variant="ghost"
                className="text-celestial-800 hover:text-celestial-950 px-8 py-4 rounded-xl text-lg font-medium"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-celestial-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-celestial-700 to-celestial-800 rounded-full flex items-center justify-center">
              <Infinity className="text-white w-4 h-4" />
            </div>
            <span className="text-celestial-950 font-semibold text-lg">Preserving Connections</span>
          </div>
          <p className="text-celestial-800 mb-4">Keeping memories alive through the power of AI</p>
          <div className="flex justify-center space-x-6">
            {[Twitter, Facebook, Instagram].map((Icon, index) => (
              <a 
                key={index}
                href="#" 
                className="text-celestial-700 hover:text-celestial-950 transition-colors duration-200"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}