import { Phone, Mail, MessageSquare, Clock, HeadphonesIcon, Users, AlertTriangle, Heart, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";

export default function ContactSupport() {
  const [urgency, setUrgency] = useState("");
  const [category, setCategory] = useState("");

  const supportOptions = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our compassionate support team",
      availability: "Monday-Friday, 8am-8pm EST",
      contact: "(555) 123-4567",
      responseTime: "Immediate",
      bestFor: "Urgent issues, technical problems, billing questions"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send detailed questions and get comprehensive responses",
      availability: "24/7 submission, responses within 24 hours",
      contact: "support@preservingconnections.app",
      responseTime: "Within 24 hours",
      bestFor: "Account issues, feature requests, general questions"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Real-time chat support for immediate assistance",
      availability: "Monday-Friday, 9am-6pm EST",
      contact: "Chat widget on website",
      responseTime: "Under 5 minutes",
      bestFor: "Quick questions, technical support, guidance"
    },
    {
      icon: HeadphonesIcon,
      title: "Crisis Support",
      description: "Immediate support for emotional crisis situations",
      availability: "24/7 - Always available",
      contact: "Crisis hotline: (555) 911-HELP",
      responseTime: "Immediate",
      bestFor: "Emotional distress, grief crisis, urgent mental health needs"
    }
  ];

  const commonIssues = [
    {
      category: "Account & Billing",
      issues: [
        "Password reset and login problems",
        "Billing questions and payment issues",
        "Account settings and preferences",
        "Subscription management"
      ]
    },
    {
      category: "Technical Support",
      issues: [
        "App crashes or performance issues",
        "File upload and storage problems",
        "Persona creation difficulties",
        "Mobile app troubleshooting"
      ]
    },
    {
      category: "Persona & Memory",
      issues: [
        "Improving persona accuracy",
        "Adding or editing memories",
        "Family sharing and permissions",
        "Conversation quality concerns"
      ]
    },
    {
      category: "Privacy & Security",
      issues: [
        "Data privacy questions",
        "Security concerns",
        "Content moderation issues",
        "Account safety"
      ]
    }
  ];

  const responseTime = {
    "crisis": "Immediate response - within minutes",
    "urgent": "Priority response - within 2 hours",
    "normal": "Standard response - within 24 hours",
    "low": "Extended response - within 3 business days"
  };

  const supportHours = [
    {
      day: "Monday - Friday",
      phone: "8:00 AM - 8:00 PM EST",
      chat: "9:00 AM - 6:00 PM EST",
      email: "24/7 (responses within 24h)"
    },
    {
      day: "Saturday",
      phone: "10:00 AM - 4:00 PM EST",
      chat: "10:00 AM - 4:00 PM EST", 
      email: "24/7 (responses within 24h)"
    },
    {
      day: "Sunday",
      phone: "Closed (Crisis line available)",
      chat: "Closed",
      email: "24/7 (responses within 48h)"
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
              <HeadphonesIcon className="w-3 h-3 mr-1" />
              Contact Support
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Crisis Banner */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-8">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">In Crisis? Get Immediate Help</h3>
            <p className="text-red-800 mb-4">
              If you're experiencing a mental health crisis, please contact emergency services immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call 988 (Crisis Lifeline)
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call (555) 911-HELP
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our compassionate support team is here to help you navigate any challenges 
            and ensure you have the best possible experience with Preserving Connections.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Grief-informed support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>24/7 crisis support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Dedicated support team</span>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How We Can Help You
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {option.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Contact:</span>
                          <p className="text-purple-600">{option.contact}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Response Time:</span>
                          <p className="text-green-600">{option.responseTime}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900">Availability:</span>
                        <p className="text-gray-600">{option.availability}</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-3">
                        <span className="font-medium text-purple-900">Best For:</span>
                        <p className="text-sm text-purple-800">{option.bestFor}</p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                      Contact Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <p className="text-gray-600">Fill out the form below and we'll get back to you soon</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input placeholder="Enter your first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input placeholder="Enter your last name" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input type="email" placeholder="Enter your email address" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account & Billing</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="persona">Persona & Memory</SelectItem>
                      <SelectItem value="privacy">Privacy & Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crisis">Crisis - Immediate Help Needed</SelectItem>
                      <SelectItem value="urgent">Urgent - Within 2 Hours</SelectItem>
                      <SelectItem value="normal">Normal - Within 24 Hours</SelectItem>
                      <SelectItem value="low">Low Priority - Within 3 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {urgency && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Expected Response Time:</strong> {responseTime[urgency as keyof typeof responseTime]}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <Textarea 
                  placeholder="Please describe your question or concern in detail..."
                  className="min-h-[120px]"
                />
              </div>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle>Common Issues & Solutions</CardTitle>
                <p className="text-gray-600">Quick help for frequently asked questions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commonIssues.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                      <ul className="space-y-1">
                        {category.issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-sm text-gray-600">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-6 border-purple-200 text-purple-700 hover:bg-purple-50">
                  View Knowledge Base
                </Button>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                      <h4 className="font-medium text-gray-900 mb-1">{schedule.day}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span>{schedule.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chat:</span>
                          <span>{schedule.chat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span>{schedule.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Resources */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Crisis Support?
            </h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              If you're experiencing thoughts of self-harm or suicide, please reach out for help immediately. 
              You don't have to go through this alone.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call 988
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Text 741741
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Heart className="w-4 h-4 mr-2" />
                Crisis Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}