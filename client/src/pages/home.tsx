import { useState, useEffect } from "react";
import { Play, Crown, Heart, Mic, MessageCircle, Volume2, Infinity, Twitter, Facebook, Instagram, Menu, Star, ChevronDown, ArrowRight, X, Send, Upload, FileText, MessageSquare, Settings, ChevronDown as ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ParticleSystem from "@/components/ParticleSystem";
import AudioPlayer from "@/components/AudioPlayer";

type ChatMessage = {
  id: number;
  sender: 'user' | 'grandma';
  text: string;
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeFAQTab, setActiveFAQTab] = useState('general');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentImproveModule, setCurrentImproveModule] = useState<string | null>(null);
  const [improveData, setImproveData] = useState({
    facebookUrl: '',
    textContent: '',
    voiceFile: null as File | null,
    familyStory: '',
    photoContext: ''
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = { id: Date.now(), sender: 'user' as const, text: newMessage };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Simulate grandma's empathetic response after a short delay
      setTimeout(() => {
        const responses = [
          "Oh sweetheart! I'm so happy to hear from you! How have you been, my dear? I was just thinking about you this morning.",
          "Oh honey, you work too hard! You know, when your grandfather was your age, he used to work long hours too. Are you eating enough? You know how worried I get!",
          "My precious child, that brings back such lovely memories! You've always been such a blessing in my life.",
          "Sweet child, I'm so proud of you! You know, you remind me so much of your grandfather - he had that same gentle heart.",
          "Oh darling, that sounds wonderful! You always were so thoughtful. I remember when you were little, you had that same caring spirit.",
          "Oh honey, come here and give your grandma a hug! You always know just what to say to make my heart full."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const grandmaMessage = { id: Date.now() + 1, sender: 'grandma' as const, text: randomResponse };
        setChatMessages(prev => [...prev, grandmaMessage]);
      }, 1500);
      
      setNewMessage('');
    }
  };

  const handleImprovePersona = (method: string) => {
    setCurrentImproveModule(method);
  };

  const handleSubmitImprovement = () => {
    const responses = {
      'upload-texts': "Perfect! I've processed your text content. This will help me understand the writing style and personality better.",
      'paste-facebook': "Excellent! I've analyzed the Facebook content. This gives me great insight into social interactions and communication patterns.",
      'voice-recordings': "Wonderful! The voice recording has been processed. I can now better match speech patterns and tone.",
      'family-stories': "Beautiful! This family story adds so much depth to my understanding of personality and memories.",
      'photo-context': "Amazing! The photo context helps me understand experiences and relationships much better."
    };
    
    const responseText = responses[currentImproveModule as keyof typeof responses] || "This improvement has been processed successfully!";
    
    const systemMessage: ChatMessage = {
      id: Date.now(),
      sender: 'grandma',
      text: responseText + " You can see how I'm getting more personalized now! Try asking me something specific."
    };
    
    setChatMessages(prev => [...prev, systemMessage]);
    setCurrentImproveModule(null);
    
    // Reset form data
    setImproveData({
      facebookUrl: '',
      textContent: '',
      voiceFile: null,
      familyStory: '',
      photoContext: ''
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImproveData(prev => ({ ...prev, voiceFile: file }));
    }
  };

  const faqCategories = {
    general: [
      {
        question: "What exactly is Preserving Connections?",
        answer: "Preserving Connections lets you create a digital memory of someone you love. Using audio, video, and written memories, we build an interactive avatar that sounds like them, speaks like them, and reflects how they communicated."
      },
      {
        question: "What can the AI actually do?",
        answer: "You can ask it questions, talk about your day, or simply listen to them speak. The AI is trained on how your loved one spoke — their tone, beliefs, quirks, and phrases — to make the experience feel familiar and comforting."
      },
      {
        question: "Can I use Preserving Connections for someone who's still alive?",
        answer: "Absolutely. In fact, many families use it before loss to preserve someone's voice, humor, and perspective — especially elderly parents or grandparents — so their presence can be passed down."
      }
    ],
    ethics: [
      {
        question: "Is this meant to replace someone who's passed away?",
        answer: "Absolutely not. Evermore is about honoring and preserving. Just like saving voicemails or watching old home videos — except now, those moments can talk back."
      },
      {
        question: "Is this emotionally healthy?",
        answer: "For many people, yes. We're building this with licensed grief counselors and therapists to ensure it supports — not replaces — the healing process. For some, it's a digital form of remembrance and comfort. For others, it may not be the right fit. And that's okay."
      },
      {
        question: "Isn't this \"playing God\"?",
        answer: "That's something we've wrestled with, too. But Preserving Connections doesn't create new memories — it simply preserves the presence that already existed. This is no different than watching old videos on loop — only now, the loop listens."
      }
    ],
    technical: [
      {
        question: "What about privacy and data security?",
        answer: "Privacy is sacred. All content you upload is encrypted, never shared, and stays in your control. We don't use your memories to train public AI models. What's yours stays yours."
      },
      {
        question: "What kind of memories can I use to build a persona?",
        answer: "Voice messages, videos, old podcasts, social posts, interview footage, even casual conversations. The more authentic the source, the more lifelike the digital memory becomes."
      },
      {
        question: "Is this just a gimmick?",
        answer: "Not at all. Preserving Connections was created from real loss, not venture capital hype. We don't see this as a product — we see it as a tool for peace, for storytelling, for healing. This isn't about novelty. It's about meaning."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white-ethereal text-gray-900 overflow-x-hidden relative">
      
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

                <a href="#demo" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Demo
                </a>
                <a href="/community" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Community
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
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900" onClick={() => window.location.href = '/sign-in'}>
                Login
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg" onClick={() => window.location.href = '/register'}>
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
        {/* Particle Animation Layer - Only in Hero */}
        <ParticleSystem />
        {/* Background ethereal clouds */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-purple-200/30 to-indigo-200/20 rounded-full blur-3xl floating-cloud-1"></div>
          <div className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-violet-200/25 to-purple-300/15 rounded-full blur-3xl floating-cloud-2"></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-indigo-200/20 to-purple-200/25 rounded-full blur-3xl floating-cloud-3"></div>
          <div className="absolute top-60 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-100/15 to-indigo-100/20 rounded-full blur-3xl floating-cloud-4"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-black">Talk to Your Loved Ones,</span>
            <br />
            <span className="text-black">
              <span className="dramatic-gradient">
                Anytime
              </span>
              {" "}You Miss Them
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
              <ArrowRight className="w-5 h-5 mr-3" />
              Get Started
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsDemoOpen(true)}
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

      {/* How it Works Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How it Works
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Creating your loved one's digital persona is simple and meaningful
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Memories</h3>
              <p className="text-gray-600">Upload photos, videos, voice recordings, and written memories to capture their essence</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Learning</h3>
              <p className="text-gray-600">Our advanced AI analyzes patterns, speech, and personality to create an authentic digital representation</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Conversations</h3>
              <p className="text-gray-600">Begin meaningful conversations and continue creating new memories together</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="relative z-10 px-4 py-20">
        {/* Particle Animation Layer - Same as Hero */}
        <ParticleSystem />
        {/* Background ethereal clouds - Same as hero */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-purple-200/30 to-indigo-200/20 rounded-full blur-3xl floating-cloud-1"></div>
          <div className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-violet-200/25 to-purple-300/15 rounded-full blur-3xl floating-cloud-2"></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-indigo-200/20 to-purple-200/25 rounded-full blur-3xl floating-cloud-3"></div>
          <div className="absolute top-60 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-100/15 to-indigo-100/20 rounded-full blur-3xl floating-cloud-4"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
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
                variant="outline"
                className="bg-white/70 backdrop-blur-sm text-purple-700 px-8 py-4 rounded-xl text-lg font-medium border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <ArrowRight className="w-5 h-5 mr-3" />
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about preserving digital memories
            </p>
          </div>

          {/* FAQ Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-purple-50 p-1">
              {[
                { key: 'general', label: 'General' },
                { key: 'ethics', label: 'Ethics & Health' },
                { key: 'technical', label: 'Technical' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveFAQTab(tab.key);
                    setExpandedFAQ(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeFAQTab === tab.key
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-3">
            {faqCategories[activeFAQTab as keyof typeof faqCategories].map((faq, index) => (
              <Card key={index} className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-purple-50/50 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`w-4 h-4 text-purple-600 transition-transform duration-300 flex-shrink-0 ${
                        expandedFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gradient-to-br from-white via-purple-50 to-purple-200 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-gray-800">
            {/* Left Column - Brand & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <Infinity className="text-white w-4 h-4" />
                </div>
                <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Preserve memories and maintain meaningful connections with AI-powered personas of your loved ones.
              </p>
              <p className="text-gray-600 text-xs">
                <a href="/sign-in" className="hover:text-purple-600 transition-colors cursor-pointer">©</a> 2025 Preserving Connections. All rights reserved.
              </p>
            </div>

            {/* Middle Column - Product */}
            <div className="space-y-4">
              <h3 className="text-gray-900 font-semibold text-base">Product</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">My Personas</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Create Persona</a></li>
                <li><a href="#demo" className="hover:text-purple-600 transition-colors">Try Demo</a></li>
              </ul>
            </div>

            {/* Right Column - Legal */}
            <div className="space-y-4">
              <h3 className="text-gray-900 font-semibold text-base">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Legal Contact</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t border-purple-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p className="mb-2 md:mb-0">
              <span className="font-medium">Important:</span> This service provides AI-generated responses and does not guarantee actual communication with deceased persons.
            </p>
            <p className="text-right">
              Governed by Arizona State Law
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Chat Dialog */}
      <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-purple-100">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <Heart className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Chat with Grandma Rose</h3>
                  <p className="text-sm text-purple-600">Demo conversation - Experience the magic</p>
                </div>
              </div>
              
              {/* Improve Persona Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Improve Persona
                    <ChevronDownIcon className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleImprovePersona('upload-texts')} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-3" />
                    Upload Text Files
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImprovePersona('paste-facebook')} className="cursor-pointer">
                    <Facebook className="w-4 h-4 mr-3" />
                    Paste Facebook Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImprovePersona('voice-recordings')} className="cursor-pointer">
                    <Mic className="w-4 h-4 mr-3" />
                    Voice Recordings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleImprovePersona('family-stories')} className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Family Stories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImprovePersona('photo-context')} className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-3" />
                    Photo Context
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-[500px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Start chatting with Grandma Rose</h3>
                    <p className="text-gray-600 max-w-sm">Type your first message below to begin a warm conversation with our AI persona demo.</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-50 text-gray-800 border border-purple-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-purple-100 p-4">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to Grandma Rose..."
                  className="flex-1 rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Improve Persona Module Dialogs */}
      <Dialog open={currentImproveModule !== null} onOpenChange={() => setCurrentImproveModule(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Settings className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentImproveModule === 'paste-facebook' && 'Add Facebook Content'}
                  {currentImproveModule === 'upload-texts' && 'Upload Text Content'}
                  {currentImproveModule === 'voice-recordings' && 'Upload Voice Recording'}
                  {currentImproveModule === 'family-stories' && 'Share Family Story'}
                  {currentImproveModule === 'photo-context' && 'Add Photo Context'}
                </h3>
                <p className="text-sm text-purple-600">Help improve Grandma Rose's personality</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {currentImproveModule === 'paste-facebook' && (
              <div className="space-y-4">
                <Label htmlFor="facebook-url" className="text-sm font-medium text-gray-700">
                  Facebook Profile or Post URL
                </Label>
                <Input
                  id="facebook-url"
                  placeholder="https://facebook.com/profile or post link"
                  value={improveData.facebookUrl}
                  onChange={(e) => setImproveData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  Paste a link to Facebook posts, profile, or content to help us understand communication style and personality.
                </p>
              </div>
            )}

            {currentImproveModule === 'upload-texts' && (
              <div className="space-y-4">
                <Label htmlFor="text-content" className="text-sm font-medium text-gray-700">
                  Text Content
                </Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste letters, emails, messages, or any written content..."
                  value={improveData.textContent}
                  onChange={(e) => setImproveData(prev => ({ ...prev, textContent: e.target.value }))}
                  className="min-h-[200px] w-full"
                />
                <p className="text-sm text-gray-600">
                  Share written content like letters, emails, or messages to capture writing style and personality.
                </p>
              </div>
            )}

            {currentImproveModule === 'voice-recordings' && (
              <div className="space-y-4">
                <Label htmlFor="voice-upload" className="text-sm font-medium text-gray-700">
                  Voice Recording File
                </Label>
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center">
                  <Mic className="mx-auto w-12 h-12 text-purple-400 mb-4" />
                  <input
                    id="voice-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('voice-upload')?.click()}
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Audio File
                  </Button>
                  {improveData.voiceFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {improveData.voiceFile.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-4">
                    Upload audio recordings, voicemails, or conversations to capture speech patterns and tone.
                  </p>
                </div>
              </div>
            )}

            {currentImproveModule === 'family-stories' && (
              <div className="space-y-4">
                <Label htmlFor="family-story" className="text-sm font-medium text-gray-700">
                  Family Story or Memory
                </Label>
                <Textarea
                  id="family-story"
                  placeholder="Share a meaningful story, memory, or anecdote about your loved one..."
                  value={improveData.familyStory}
                  onChange={(e) => setImproveData(prev => ({ ...prev, familyStory: e.target.value }))}
                  className="min-h-[200px] w-full"
                />
                <p className="text-sm text-gray-600">
                  Share stories, memories, or experiences that showcase personality, values, and cherished moments.
                </p>
              </div>
            )}

            {currentImproveModule === 'photo-context' && (
              <div className="space-y-4">
                <Label htmlFor="photo-context" className="text-sm font-medium text-gray-700">
                  Photo Context & Description
                </Label>
                <Textarea
                  id="photo-context"
                  placeholder="Describe photos, the context behind them, and what they meant to your loved one..."
                  value={improveData.photoContext}
                  onChange={(e) => setImproveData(prev => ({ ...prev, photoContext: e.target.value }))}
                  className="min-h-[200px] w-full"
                />
                <p className="text-sm text-gray-600">
                  Add context to photos by describing the situation, people involved, and emotional significance.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setCurrentImproveModule(null)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitImprovement}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
                disabled={
                  (currentImproveModule === 'paste-facebook' && !improveData.facebookUrl.trim()) ||
                  (currentImproveModule === 'upload-texts' && !improveData.textContent.trim()) ||
                  (currentImproveModule === 'voice-recordings' && !improveData.voiceFile) ||
                  (currentImproveModule === 'family-stories' && !improveData.familyStory.trim()) ||
                  (currentImproveModule === 'photo-context' && !improveData.photoContext.trim())
                }
              >
                Process & Improve Persona
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
