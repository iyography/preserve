import { useState, useEffect } from "react";
import { Play, Crown, Heart, Mic, MessageCircle, Volume2, Infinity, Twitter, Facebook, Instagram, Menu, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ParticleSystem from "@/components/ParticleSystem";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeFAQTab, setActiveFAQTab] = useState('general');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
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

      {/* Our Story Section */}
      <section id="story" className="relative z-10 py-24 px-4 bg-gradient-to-b from-purple-50/30 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-purple-700 font-medium">
              A Message from Michael Vallee, Founder of Preserving Connections
            </p>
          </div>

          <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
            <p className="text-xl mb-8 text-center font-medium text-gray-900">
              Preserving Connections was born from something deeply personal.
            </p>
            
            <p className="text-lg mb-6">
              I lost my son.
            </p>
            
            <p className="text-lg mb-8">
              And while grief changes form over time, what I missed most weren't the big milestones. It was the everyday conversations — the way he said my name, the small jokes, his unique way of seeing me. That longing — to feel close, to stay connected — never went away.
            </p>
            
            <p className="text-lg mb-8">
              I founded Preserving Connections because we now live in a time where technology can help us preserve what matters most: voice, presence, personality. Not just through photos or videos, but through living, interactive experiences. You can talk, ask questions, hear their voice again — shaped by how they spoke, what they believed, and how they loved.
            </p>
            
            <div className="text-center my-12">
              <p className="text-xl font-semibold text-gray-900 mb-2">
                Preserving Connections isn't about replacing anyone.
              </p>
              <p className="text-xl font-semibold text-purple-700">
                It's about continuing the connection, when you need it most.
              </p>
            </div>
            
            <p className="text-lg mb-8">
              We work with grief experts, therapists, and ethical AI researchers to make sure every interaction is built with care. Whether you're preserving someone still with you or honoring someone you've lost, this platform exists for one reason: to help you feel close again.
            </p>
            
            <p className="text-lg mb-12">
              For anyone who's ever said, "I just wish I could talk to them one more time," — Preserving Connections is for you.
            </p>
            
            <div className="text-right border-t border-purple-100 pt-8">
              <p className="text-lg font-medium text-gray-900 mb-2">
                With peace,
              </p>
              <p className="text-lg font-semibold text-gray-900">
                Michael Vallee
              </p>
              <p className="text-base text-purple-600">
                Founder, Preserving Connections
              </p>
            </div>
          </div>
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
