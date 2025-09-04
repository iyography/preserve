import { Heart, Users, Shield, Lightbulb, Award, Target, Globe, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function AboutMission() {
  const coreValues = [
    {
      icon: Heart,
      title: "Love First",
      description: "Every decision we make is guided by love—love for families, love for memories, and love for the human experience of connection.",
      principle: "Technology should serve love, not replace it"
    },
    {
      icon: Shield,
      title: "Do No Harm",
      description: "We are committed to ethical technology that supports healing and never exploits grief or vulnerability.",
      principle: "Our 'do no evil' approach guides every product decision"
    },
    {
      icon: Users,
      title: "Dignity & Respect",
      description: "We honor the dignity of those who have passed and respect the sacred nature of memory and grief.",
      principle: "Every digital memory is treated as sacred"
    },
    {
      icon: Globe,
      title: "Accessibility for All",
      description: "Preserving memories should not be limited by technical skill, financial means, or digital literacy.",
      principle: "Technology barriers should never prevent memory preservation"
    }
  ];

  const missionPillars = [
    {
      title: "Therapeutic Foundation",
      description: "Every feature is designed with grief-informed care principles and therapeutic best practices.",
      details: [
        "Licensed counselor consultation",
        "Trauma-informed design",
        "Emotional safety protocols",
        "Professional ethics compliance"
      ]
    },
    {
      title: "Privacy & Security",
      description: "Memories are sacred and private. We use military-grade security to protect what matters most.",
      details: [
        "End-to-end encryption",
        "Zero-knowledge architecture",
        "GDPR & CCPA compliant",
        "Regular security audits"
      ]
    },
    {
      title: "Authentic Connection",
      description: "We use advanced AI to create authentic representations that honor who your loved one truly was.",
      details: [
        "Behavioral psychology integration",
        "Context-aware responses",
        "Personality preservation",
        "Continuous learning capabilities"
      ]
    },
    {
      title: "Family-Centered Approach",
      description: "Memories are shared treasures. Our platform supports collaborative family memory creation.",
      details: [
        "Multi-contributor support",
        "Family coordination tools",
        "Shared memory spaces",
        "Generational preservation"
      ]
    }
  ];

  const ourStory = [
    {
      year: "2022",
      title: "Founded from Personal Loss",
      description: "Our founder Todd experienced the profound loss of his father and realized that traditional memorialization wasn't enough. The desire to have one more conversation sparked the vision for Preserving Connections."
    },
    {
      year: "2023", 
      title: "Grief-Informed Development",
      description: "We partnered with licensed grief counselors and therapists to ensure our technology supports healing rather than hindering it. Every feature was designed with therapeutic principles in mind."
    },
    {
      year: "2024",
      title: "Community Beta Launch", 
      description: "We launched with a small community of beta families, learning from their experiences and refining our approach based on real-world feedback and emotional needs."
    },
    {
      year: "2024",
      title: "Public Launch",
      description: "Today, we serve families worldwide, maintaining our commitment to ethical technology, therapeutic support, and authentic memory preservation."
    }
  ];

  const teamMembers = [
    {
      name: "Todd Williams",
      role: "Founder & CEO",
      background: "Former tech executive who lost his father and couldn't find meaningful ways to preserve their relationship.",
      focus: "Ensuring technology serves families with dignity and respect"
    },
    {
      name: "Dr. Sarah Chen",
      role: "Chief Psychology Officer",
      background: "Licensed grief counselor with 15 years experience in bereavement therapy and family counseling.",
      focus: "Therapeutic design and emotional safety protocols"
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      background: "AI researcher specializing in human-computer interaction and ethical artificial intelligence.",
      focus: "Building authentic, secure, and respectful AI systems"
    },
    {
      name: "Dr. Linda Kim",
      role: "Chief Ethics Officer",
      background: "Bioethicist and digital rights advocate with expertise in end-of-life technology ethics.",
      focus: "Ensuring all products meet the highest ethical standards"
    }
  ];

  const achievements = [
    {
      icon: Users,
      number: "10,000+",
      label: "Families Served",
      description: "Helping families preserve precious memories worldwide"
    },
    {
      icon: Award,
      number: "50+",
      label: "Healthcare Partners",
      description: "Funeral homes, hospices, and elder care facilities"
    },
    {
      icon: Shield,
      number: "99.9%",
      label: "Uptime",
      description: "Reliable access to your loved ones' memories"
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Family Satisfaction",
      description: "Average rating from families using our service"
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
              Our Mission
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We believe that love transcends physical presence. Our mission is to help families 
            preserve and continue meaningful relationships with those they've lost, using technology 
            that honors dignity, respects grief, and serves love.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Founding Principle</h2>
            <blockquote className="text-lg italic text-gray-700">
              "Technology should serve love, not replace it. We're not trying to bring people back—
              we're helping love continue in new ways that honor both memory and healing."
            </blockquote>
            <p className="text-sm text-gray-600 mt-4">— Todd Williams, Founder</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Core Values
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {value.description}
                        </p>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-sm text-purple-800 font-medium italic">
                            "{value.principle}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission Pillars */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How We Fulfill Our Mission
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {missionPillars.map((pillar, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{pillar.title}</CardTitle>
                  <p className="text-gray-600">{pillar.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pillar.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Story
          </h2>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-200"></div>
            <div className="space-y-8">
              {ourStory.map((milestone, index) => (
                <div key={index} className="relative flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {milestone.year}
                  </div>
                  <Card className="flex-1 bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Leadership Team
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-purple-600 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {member.background}
                      </p>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-purple-800">
                          <strong>Focus:</strong> {member.focus}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Impact
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg text-center">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {achievement.number}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {achievement.label}
                    </div>
                    <p className="text-xs text-gray-600">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commitment Statement */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-16">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Commitment to Families
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-green-900 mb-2">We Promise:</h4>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>To never exploit grief for profit</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>To maintain the highest ethical standards</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>To protect your privacy absolutely</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>To support you through your grief journey</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">We Will Never:</h4>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Use your data for advertising or selling</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Share your memories with third parties</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Pressure you into decisions during grief</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Compromise on security or privacy</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're preserving memories, partnering with us, or supporting our mission, 
            you're helping families continue love beyond loss.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => window.location.href = '/create-first-persona'}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Preserving Memories
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/partner-with-us'}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}