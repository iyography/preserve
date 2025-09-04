import { Heart, Users, Clock, Shield, Headphones, Calendar, FileText, Video, CheckCircle, ArrowRight, Stethoscope, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function ElderCareIntegration() {
  const careSettings = [
    {
      icon: Home,
      title: "Senior Living Communities",
      description: "Integrate memory preservation into daily activities and family engagement programs",
      features: [
        "Group memory sessions",
        "Family visit enhancements", 
        "Legacy project activities",
        "Digital storytelling workshops"
      ]
    },
    {
      icon: Stethoscope,
      title: "Healthcare Facilities",
      description: "Support therapeutic goals through meaningful memory work and family connection",
      features: [
        "Therapeutic memory sessions",
        "Family communication tools",
        "Care team integration",
        "Progress documentation"
      ]
    },
    {
      icon: Heart,
      title: "Hospice Care",
      description: "Create lasting memories while supporting both patients and families through difficult times",
      features: [
        "Legacy preservation sessions",
        "Family healing support",
        "End-of-life comfort",
        "Memorial creation assistance"
      ]
    },
    {
      icon: Users,
      title: "Adult Day Programs",
      description: "Engage seniors in meaningful memory activities that support cognitive health",
      features: [
        "Cognitive stimulation activities",
        "Intergenerational programs",
        "Memory sharing circles",
        "Digital literacy support"
      ]
    }
  ];

  const programs = [
    {
      name: "Memory Preservation Program",
      description: "Comprehensive program for capturing and preserving residents' life stories",
      duration: "Ongoing",
      participants: "Individual or group",
      outcomes: ["Personal legacy creation", "Family engagement", "Cognitive stimulation", "Emotional well-being"]
    },
    {
      name: "Living History Project",
      description: "Document residents' historical experiences and community connections",
      duration: "6-8 weeks",
      participants: "Small groups",
      outcomes: ["Community storytelling", "Intergenerational bonding", "Cultural preservation", "Sense of purpose"]
    },
    {
      name: "Family Connection Portal",
      description: "Digital platform for families to stay connected and share memories with residents",
      duration: "Continuous",
      participants: "Families and residents",
      outcomes: ["Improved family relationships", "Reduced isolation", "Shared memory creation", "Virtual presence"]
    }
  ];

  const benefits = [
    {
      category: "For Residents",
      items: [
        "Cognitive stimulation through memory recall",
        "Sense of purpose and legacy",
        "Improved mood and emotional well-being",
        "Enhanced family connections",
        "Preservation of personal history"
      ]
    },
    {
      category: "For Families",
      items: [
        "Meaningful ways to connect",
        "Preserved stories and memories",
        "Support during difficult times",
        "Continued relationship opportunities",
        "Peace of mind about legacy"
      ]
    },
    {
      category: "For Care Providers",
      items: [
        "Enhanced therapeutic programming",
        "Improved family satisfaction",
        "Differentiated care offerings",
        "Staff engagement opportunities",
        "Quality of life improvements"
      ]
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Assessment & Planning",
      description: "Evaluate your facility's needs and develop a customized integration plan",
      timeframe: "1-2 weeks"
    },
    {
      step: 2,
      title: "Staff Training",
      description: "Train care staff on memory preservation techniques and platform usage",
      timeframe: "2-3 weeks"
    },
    {
      step: 3,
      title: "Pilot Program",
      description: "Launch with a small group of residents and families to refine the approach",
      timeframe: "4-6 weeks"
    },
    {
      step: 4,
      title: "Full Implementation",
      description: "Roll out the program facility-wide with ongoing support and monitoring",
      timeframe: "2-4 weeks"
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
              Elder Care Integration
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Elder Care Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Enhance the quality of life in elder care settings through meaningful memory preservation, 
            family connection, and therapeutic storytelling programs.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Therapeutic approach</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Family-centered care</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Dignity-preserving</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Learn About Integration
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Care Settings */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Elder Care Settings We Serve
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {careSettings.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {setting.title}
                        </h3>
                        <p className="text-gray-600">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {setting.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Available Programs
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <p className="text-gray-600">{program.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Duration:</span>
                      <p className="text-gray-600">{program.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Format:</span>
                      <p className="text-gray-600">{program.participants}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expected Outcomes:</h4>
                    <ul className="space-y-1">
                      {program.outcomes.map((outcome, outcomeIndex) => (
                        <li key={outcomeIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-sm text-gray-600">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Benefits for Everyone
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{benefit.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Process */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Integration Process</CardTitle>
            <p className="text-gray-600 text-center">Our proven four-step approach to successful program implementation</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              {integrationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                    {step.timeframe}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Case Study */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-16">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Success Story: Sunrise Manor Memory Care
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">The Challenge:</h4>
                <p className="text-gray-700 mb-4">
                  Sunrise Manor wanted to improve family engagement and provide meaningful activities 
                  for residents with dementia while preserving their life stories.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3">The Solution:</h4>
                <p className="text-gray-700">
                  Implemented our Memory Preservation Program with specialized training for staff 
                  and regular family participation sessions.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Results After 6 Months:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">85% increase in family visit frequency</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">Improved resident mood and engagement</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">50+ completed life story projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">95% family satisfaction rate</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Elder Care Program?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a consultation to learn how memory preservation can enhance the quality of life 
            for your residents and strengthen family connections.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Button>
            
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium">
              <FileText className="w-5 h-5 mr-2" />
              Download Program Guide
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Free consultation • Custom implementation plan • Ongoing support included
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}