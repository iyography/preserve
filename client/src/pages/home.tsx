import { useState, useEffect } from "react";
import { Play, Crown, Heart, Mic, MessageCircle, Volume2, Infinity, Twitter, Facebook, Instagram, Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
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
    <div className="min-h-screen bg-white-ethereal text-gray-900 overflow-x-hidden relative">
      {/* Particle Animation Layer */}
      <ParticleSystem />
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <Infinity className="text-white w-4 h-4" />
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  How it Works
                </a>
                <a href="#story" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Our Story
                </a>
                <a href="#demo" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Demo
                </a>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Pricing
                </button>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  FAQ
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg">
                Register
              </Button>
              <Button 
                variant="ghost" 
                className="md:hidden text-gray-900 hover:text-purple-600"
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
        {/* Background ethereal clouds */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-purple-200/30 to-indigo-200/20 rounded-full blur-3xl floating-cloud-1"></div>
          <div className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-violet-200/25 to-purple-300/15 rounded-full blur-3xl floating-cloud-2"></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-indigo-200/20 to-purple-200/25 rounded-full blur-3xl floating-cloud-3"></div>
          <div className="absolute top-60 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-100/15 to-indigo-100/20 rounded-full blur-3xl floating-cloud-4"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Talk to Your Loved Ones,</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent glow-text">
              Anytime You Miss Them
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
            Create an AI persona of your loved one that preserves their personality, stories, and wisdom. Continue meaningful conversations and share new memories with them.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              onClick={() => scrollToSection('pricing')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-3" />
              View Pricing Plans
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/70 backdrop-blur-sm text-purple-700 px-8 py-4 rounded-xl text-lg font-medium border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-lg transition-all duration-300"
              size="lg"
            >
              <Play className="w-5 h-5 mr-3" />
              Try Demo with Grandma Rose
            </Button>
          </div>

          {/* Audio Message Section moved to bottom of hero */}
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl transition-all duration-300 border-purple-100 hover:shadow-2xl hover:bg-white/80">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                    <Volume2 className="text-white w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    A Personal Message from Founder Michael Vallee
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Hear why we created Preserving Connections and how it can help your family preserve precious memories
                  </p>
                  
                  <AudioPlayer />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      

      
      {/* Features Preview Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Experience the Magic of
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Digital Immortality</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our advanced AI technology captures the essence of your loved ones, creating lasting connections that transcend time
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Voice & Personality",
                description: "Capture their unique speaking patterns, stories, and wisdom for future generations",
                delay: 0
              },
              {
                icon: Heart,
                title: "Share New Memories",
                description: "Continue creating meaningful moments and sharing life updates with your loved ones",
                delay: 0.2
              },
              {
                icon: MessageCircle,
                title: "Natural Conversations",
                description: "Experience realistic interactions that feel authentic and provide comfort",
                delay: 0.4
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-purple-100 floating-card hover:bg-white/80"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
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
          <Card className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl transition-all duration-300 border-purple-100 hover:shadow-2xl hover:bg-white/80">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Begin Your Journey of
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Eternal Connection</span>
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Start preserving precious memories today and keep your loved ones close forever
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Star className="w-5 h-5 mr-3" />
                Get Started Today
              </Button>
              
              <Button 
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-purple-50 transition-all duration-300"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-purple-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <Infinity className="text-white w-4 h-4" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
          </div>
          <p className="text-gray-600 mb-4">Keeping memories alive through the power of AI</p>
          <div className="flex justify-center space-x-6">
            {[Twitter, Facebook, Instagram].map((Icon, index) => (
              <a 
                key={index}
                href="#" 
                className="text-purple-500 hover:text-purple-700 transition-colors duration-200"
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
