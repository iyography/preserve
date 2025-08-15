import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-celestial-gradient text-white overflow-x-hidden relative">
      {/* Particle Animation Layer */}
      <ParticleSystem />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed w-full z-50 glassmorphism"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-celestial-500 to-celestial-700 rounded-full flex items-center justify-center glow-ring">
                <Infinity className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-semibold text-lg">Preserving Connections</span>
            </motion.div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-white hover:text-celestial-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Home
                </button>
                <a href="#personas" className="text-celestial-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Personas
                </a>
                <a href="#create" className="text-celestial-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Create
                </a>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-celestial-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Pricing
                </button>
                <a href="#ambassador" className="text-celestial-200 hover:text-white px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200">
                  <Heart className="w-4 h-4 mr-1" />
                  Memory Ambassador
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-celestial-200 hover:text-white">
                Sign in
              </Button>
              <Button className="bg-gradient-to-r from-celestial-600 to-celestial-700 hover:from-celestial-500 hover:to-celestial-600 text-white hover-glow">
                Sign up
              </Button>
              <Button 
                variant="ghost" 
                className="md:hidden text-white hover:text-celestial-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 px-4 z-10">
        {/* Background ethereal clouds */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-white/10 to-celestial-300/20 rounded-full blur-3xl"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-celestial-400/15 to-white/10 rounded-full blur-3xl"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-celestial-500/10 to-white/15 rounded-full blur-3xl"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Keep Their Memory</span>
            <br />
            <span className="bg-gradient-to-r from-celestial-400 via-celestial-500 to-celestial-600 bg-clip-text text-transparent glow-text">
              Alive Forever
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl text-celestial-100 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Create an AI persona of your loved one that preserves their personality, stories, and wisdom. Continue meaningful conversations and share new memories with them.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Button 
              onClick={() => scrollToSection('pricing')}
              className="bg-gradient-to-r from-celestial-600 to-celestial-700 hover:from-celestial-500 hover:to-celestial-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover-glow"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-3" />
              View Pricing Plans
            </Button>
            
            <Button 
              variant="outline"
              className="glassmorphism text-white px-8 py-4 rounded-xl text-lg font-medium border-celestial-300/30 hover-glow"
              size="lg"
            >
              <Play className="w-5 h-5 mr-3" />
              Try Demo with Grandma Rose
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Founder Message Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 pb-20"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="glassmorphism rounded-3xl p-8 hover-glow transition-all duration-300 border-celestial-300/20">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-celestial-500 to-celestial-700 rounded-full flex items-center justify-center glow-ring">
                  <Volume2 className="text-white w-6 h-6" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  A Personal Message from Founder Michael Vallee
                </h3>
                <p className="text-celestial-200 mb-4">
                  Hear why we created Preserving Connections and how it can help your family preserve precious memories
                </p>
                
                <AudioPlayer />
              </div>
            </div>
          </Card>
        </div>
      </motion.section>
      
      {/* Features Preview Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Experience the Magic of
              <span className="bg-gradient-to-r from-celestial-400 to-celestial-600 bg-clip-text text-transparent"> Digital Immortality</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-celestial-200 max-w-3xl mx-auto"
            >
              Our advanced AI technology captures the essence of your loved ones, creating lasting connections that transcend time
            </motion.p>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glassmorphism rounded-2xl p-8 text-center hover-glow transition-all duration-300 border-celestial-300/20 floating-card"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-celestial-500 to-celestial-700 rounded-full flex items-center justify-center mx-auto mb-6 glow-ring">
                  <feature.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-celestial-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Final CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 py-20"
        id="pricing"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glassmorphism rounded-3xl p-12 hover-glow transition-all duration-300 border-celestial-300/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Begin Your Journey of
              <span className="bg-gradient-to-r from-celestial-400 to-celestial-600 bg-clip-text text-transparent"> Eternal Connection</span>
            </h2>
            <p className="text-xl text-celestial-200 mb-8">
              Start preserving precious memories today and keep your loved ones close forever
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                className="bg-gradient-to-r from-celestial-600 to-celestial-700 hover:from-celestial-500 hover:to-celestial-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover-glow"
                size="lg"
              >
                <Star className="w-5 h-5 mr-3" />
                Get Started Today
              </Button>
              
              <Button 
                variant="ghost"
                className="text-celestial-300 hover:text-white px-8 py-4 rounded-xl text-lg font-medium"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </motion.section>
      
      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-celestial-800/30">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-celestial-500 to-celestial-700 rounded-full flex items-center justify-center glow-ring">
              <Infinity className="text-white w-4 h-4" />
            </div>
            <span className="text-white font-semibold text-lg">Preserving Connections</span>
          </motion.div>
          <p className="text-celestial-300 mb-4">Keeping memories alive through the power of AI</p>
          <div className="flex justify-center space-x-6">
            {[Twitter, Facebook, Instagram].map((Icon, index) => (
              <motion.a 
                key={index}
                href="#" 
                className="text-celestial-400 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
