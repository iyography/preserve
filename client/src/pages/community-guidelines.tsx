import { Shield, Heart, Users, AlertTriangle, CheckCircle, MessageSquare, Flag, Lock, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function CommunityGuidelines() {
  const coreValues = [
    {
      icon: Heart,
      title: "Compassion First",
      description: "Every interaction should be guided by empathy, understanding, and kindness toward those who are grieving.",
      examples: ["Listen without judgment", "Offer support, not advice unless asked", "Acknowledge different grief experiences"]
    },
    {
      icon: Shield,
      title: "Respect & Safety",
      description: "Create a safe space where everyone feels comfortable sharing their memories and experiences.",
      examples: ["No harassment or bullying", "Respect privacy boundaries", "Report concerning behavior"]
    },
    {
      icon: Users,
      title: "Inclusive Community",
      description: "Welcome all families, regardless of background, beliefs, or type of loss experienced.",
      examples: ["Embrace diverse perspectives", "Use inclusive language", "Support marginalized voices"]
    },
    {
      icon: Star,
      title: "Authentic Sharing",
      description: "Share genuine memories and experiences while respecting the dignity of those we've lost.",
      examples: ["Share real memories", "Avoid sensationalizing loss", "Honor privacy wishes"]
    }
  ];

  const guidelines = [
    {
      category: "Sharing Memories",
      icon: Heart,
      rules: [
        {
          do: "Share genuine, heartfelt memories that honor your loved one",
          dont: "Post fabricated or exaggerated stories"
        },
        {
          do: "Include context that helps others understand the significance",
          dont: "Share memories without permission from other family members"
        },
        {
          do: "Use appropriate content warnings for difficult topics",
          dont: "Share graphic details of death or illness"
        },
        {
          do: "Respect cultural and religious differences in grieving",
          dont: "Judge others' grieving processes or timelines"
        }
      ]
    },
    {
      category: "Supporting Others",
      icon: Users,
      rules: [
        {
          do: "Offer gentle support and validation of others' feelings",
          dont: "Give unsolicited advice about grief or healing"
        },
        {
          do: "Share resources when appropriate and helpful",
          dont: "Promote unproven treatments or 'cures' for grief"
        },
        {
          do: "Listen actively and respond with empathy",
          dont: "Make comparisons or minimize others' losses"
        },
        {
          do: "Respect boundaries when someone declines support",
          dont: "Push religious or spiritual beliefs on others"
        }
      ]
    },
    {
      category: "Communication Standards",
      icon: MessageSquare,
      rules: [
        {
          do: "Use respectful, compassionate language",
          dont: "Use offensive, discriminatory, or hateful language"
        },
        {
          do: "Stay on topic and contribute meaningfully to discussions",
          dont: "Spam, self-promote, or post irrelevant content"
        },
        {
          do: "Disagree respectfully when perspectives differ",
          dont: "Engage in arguments, personal attacks, or harassment"
        },
        {
          do: "Use private messages for personal or sensitive conversations",
          dont: "Share private information publicly without permission"
        }
      ]
    },
    {
      category: "Privacy & Safety",
      icon: Lock,
      rules: [
        {
          do: "Protect your own and others' personal information",
          dont: "Share contact information, addresses, or financial details"
        },
        {
          do: "Report concerning behavior to moderators",
          dont: "Ignore signs of self-harm or threatening behavior"
        },
        {
          do: "Respect photo and story sharing permissions",
          dont: "Download or reuse others' shared memories without permission"
        },
        {
          do: "Use platform features to control your privacy settings",
          dont: "Share login credentials or account access with others"
        }
      ]
    }
  ];

  const prohibitedContent = [
    {
      category: "Completely Prohibited",
      severity: "high",
      items: [
        "Hate speech, discrimination, or harassment",
        "Threats, violence, or self-harm content",
        "Spam, scams, or fraudulent activities",
        "Commercial solicitation or unauthorized advertising",
        "Sexually explicit or inappropriate content",
        "Illegal activities or content"
      ]
    },
    {
      category: "Requires Moderation",
      severity: "medium",
      items: [
        "Graphic descriptions of death or dying",
        "Personal attacks or aggressive language",
        "Off-topic or disruptive posts",
        "Unsolicited medical or legal advice",
        "Religious or political proselytizing",
        "Private information sharing"
      ]
    },
    {
      category: "Use with Caution",
      severity: "low",
      items: [
        "Detailed mental health struggles (use content warnings)",
        "Financial hardship requests (direct to appropriate resources)",
        "Family conflicts or disputes (consider private discussion)",
        "Critical opinions about funeral homes or services",
        "Personal relationship advice",
        "Controversial grief practices or beliefs"
      ]
    }
  ];

  const reportingProcess = [
    {
      step: 1,
      title: "Identify the Issue",
      description: "Determine if content violates community guidelines or poses safety concerns",
      action: "Review guidelines to confirm violation"
    },
    {
      step: 2,
      title: "Use Reporting Tools",
      description: "Use built-in reporting features to flag problematic content or behavior",
      action: "Click report button and select appropriate category"
    },
    {
      step: 3,
      title: "Provide Details",
      description: "Give specific information about the violation to help moderators understand",
      action: "Include context and specific examples when possible"
    },
    {
      step: 4,
      title: "Follow Up",
      description: "Our moderation team reviews reports and takes appropriate action within 24 hours",
      action: "Check for confirmation and additional information requests"
    }
  ];

  const consequences = [
    {
      level: "Warning",
      description: "First-time or minor violations result in a warning and guidance",
      actions: ["Educational message", "Temporary content removal", "Guidance on guidelines"]
    },
    {
      level: "Temporary Restriction",
      description: "Repeated or moderate violations may result in temporary restrictions",
      actions: ["Limited posting ability", "Temporary suspension", "Required guidelines review"]
    },
    {
      level: "Permanent Removal",
      description: "Serious or repeated violations result in permanent community removal",
      actions: ["Account termination", "Content removal", "Appeal process available"]
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
              <BookOpen className="w-3 h-3 mr-1" />
              Community Guidelines
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our community guidelines ensure that everyone feels safe, supported, and respected 
            as we share memories and support each other through grief.
          </p>
          
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">Our Commitment</h3>
              <p className="text-purple-800 text-sm">
                These guidelines help us maintain a compassionate space where everyone can 
                share memories and find support during difficult times.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Core Community Values
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {value.description}
                        </p>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">In Practice:</h4>
                          <ul className="space-y-1">
                            {value.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-sm text-gray-600">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Community Guidelines
          </h2>
          
          <Tabs defaultValue="memories" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="memories">Sharing Memories</TabsTrigger>
              <TabsTrigger value="support">Supporting Others</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Safety</TabsTrigger>
            </TabsList>

            {guidelines.map((guideline, index) => (
              <TabsContent key={index} value={guideline.category.toLowerCase().split(' ')[0]} className="space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <guideline.icon className="w-6 h-6 text-purple-600" />
                      <span>{guideline.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          Please Do
                        </h4>
                        <ul className="space-y-3">
                          {guideline.rules.map((rule, ruleIndex) => (
                            <li key={ruleIndex} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-800">{rule.do}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          Please Don't
                        </h4>
                        <ul className="space-y-3">
                          {guideline.rules.map((rule, ruleIndex) => (
                            <li key={ruleIndex} className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-sm text-red-800">{rule.dont}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Prohibited Content */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Content Standards
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {prohibitedContent.map((content, index) => {
              const severityColors = {
                high: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-600' },
                medium: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-600' },
                low: { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-600' }
              };
              
              const colors = severityColors[content.severity as keyof typeof severityColors];
              
              return (
                <Card key={index} className={`bg-white/70 backdrop-blur-sm ${colors.border} shadow-lg`}>
                  <CardHeader className={colors.bg}>
                    <CardTitle className={`text-lg ${colors.text} flex items-center justify-between`}>
                      {content.category}
                      <Badge className={`${colors.badge} text-white text-xs`}>
                        {content.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      {content.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${content.severity === 'high' ? 'text-red-500' : content.severity === 'medium' ? 'text-amber-500' : 'text-yellow-500'}`} />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reporting Process */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-3">
              <Flag className="w-6 h-6 text-purple-600" />
              <span>How to Report Violations</span>
            </CardTitle>
            <p className="text-gray-600 text-center">Help us maintain a safe community by reporting problematic content</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              {reportingProcess.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-purple-800 font-medium">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Enforcement & Consequences
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {consequences.map((consequence, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-center">{consequence.level}</CardTitle>
                  <p className="text-gray-600 text-center text-sm">{consequence.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {consequence.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact & Support */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About Guidelines?
            </h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              If you have questions about our community guidelines or need help with a specific situation, 
              our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Contact Support Team
              </Button>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                Join Community Discussion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}