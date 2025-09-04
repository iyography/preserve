import { Phone, MessageSquare, Heart, Clock, Shield, AlertTriangle, Headphones, Users, MapPin, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function CrisisResources() {
  const emergencyResources = [
    {
      name: "988 Suicide & Crisis Lifeline",
      description: "24/7 free and confidential emotional support",
      contact: "Call or text 988",
      website: "suicidepreventionlifeline.org",
      features: ["24/7 availability", "Multilingual support", "Crisis intervention", "Follow-up care"]
    },
    {
      name: "Crisis Text Line",
      description: "Text-based crisis support for any situation",
      contact: "Text HOME to 741741",
      website: "crisistextline.org", 
      features: ["Text-based support", "Trained counselors", "Anonymous", "Data privacy"]
    },
    {
      name: "National Alliance on Mental Illness (NAMI)",
      description: "Mental health support and resources",
      contact: "1-800-950-NAMI (6264)",
      website: "nami.org",
      features: ["Support groups", "Educational resources", "Family support", "Local chapters"]
    },
    {
      name: "The Trevor Project",
      description: "Crisis support for LGBTQ+ youth and young adults",
      contact: "1-866-488-7386",
      website: "thetrevorproject.org",
      features: ["LGBTQ+ specialized", "Youth focused", "Text and chat options", "Coming out resources"]
    }
  ];

  const griefSpecificResources = [
    {
      name: "GriefShare",
      description: "Grief recovery support groups and online resources",
      type: "Support Groups",
      contact: "Find local groups online",
      website: "griefshare.org"
    },
    {
      name: "Hospice Foundation of America",
      description: "Grief support and educational resources",
      type: "Educational Resources",
      contact: "1-800-854-3402",
      website: "hospicefoundation.org"
    },
    {
      name: "Center for Complicated Grief",
      description: "Specialized support for complicated grief",
      type: "Professional Treatment",
      contact: "212-851-2107",
      website: "complicatedgrief.columbia.edu"
    },
    {
      name: "What's Your Grief",
      description: "Online grief support community and resources",
      type: "Online Community",
      contact: "Online platform",
      website: "whatsyourgrief.com"
    }
  ];

  const warningSignsCategories = [
    {
      category: "Immediate Risk Signs",
      color: "red",
      signs: [
        "Talking about wanting to die or hurt oneself",
        "Looking for ways to kill oneself",
        "Talking about feeling hopeless or having no purpose",
        "Talking about feeling trapped or in unbearable pain",
        "Talking about being a burden to others",
        "Increasing use of alcohol or drugs"
      ]
    },
    {
      category: "Concerning Changes",
      color: "amber",
      signs: [
        "Withdrawing from activities or social connections",
        "Isolating from family and friends",
        "Sleeping too little or too much",
        "Giving away prized possessions",
        "Saying goodbye to loved ones",
        "Putting affairs in order, making a will"
      ]
    },
    {
      category: "Mood and Behavior",
      color: "yellow", 
      signs: [
        "Depression, anxiety, loss of interest",
        "Rage, anger, seeking revenge",
        "Acting reckless or engaging in risky activities",
        "Dramatic mood changes",
        "Eating too much or too little",
        "Fatigue or loss of energy"
      ]
    }
  ];

  const supportStrategies = [
    {
      title: "Listen Without Judgment",
      description: "Give your full attention and avoid trying to fix their feelings or minimize their pain.",
      icon: Headphones
    },
    {
      title: "Ask Direct Questions",
      description: "Don't be afraid to ask directly if they're thinking about suicide. This won't plant the idea.",
      icon: MessageSquare
    },
    {
      title: "Connect Them to Help",
      description: "Help them contact professional resources and offer to stay with them until help arrives.",
      icon: Phone
    },
    {
      title: "Follow Up",
      description: "Check in regularly and continue to show you care. Recovery is a process, not an event.",
      icon: Heart
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
            
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Shield className="w-3 h-3 mr-1" />
              Crisis Resources
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Emergency Banner */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-8">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              In Crisis? Get Help Immediately
            </h2>
            <p className="text-lg text-red-800 mb-6">
              If you or someone you know is in immediate danger, don't wait.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-lg py-4">
                <Phone className="w-5 h-5 mr-2" />
                Call 911
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-4">
                <Phone className="w-5 h-5 mr-2" />
                Call 988
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-lg py-4">
                <MessageSquare className="w-5 h-5 mr-2" />
                Text 741741
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Crisis Resources & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional crisis support resources for anyone experiencing emotional distress, 
            suicidal thoughts, or mental health emergencies. Help is available 24/7.
          </p>
        </div>

        {/* Emergency Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            24/7 Emergency Support
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {emergencyResources.map((resource, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{resource.name}</CardTitle>
                  <p className="text-gray-600">{resource.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Contact</p>
                        <p className="text-green-800">{resource.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Website</p>
                        <p className="text-blue-800">{resource.website}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {resource.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <Shield className="w-3 h-3 text-purple-600" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Grief-Specific Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Grief & Bereavement Support
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {griefSpecificResources.map((resource, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Heart className="w-8 h-8 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.name}
                      </h3>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 mb-3">
                        {resource.type}
                      </Badge>
                      <p className="text-gray-600 mb-4">
                        {resource.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{resource.contact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{resource.website}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Recognizing Warning Signs
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {warningSignsCategories.map((category, index) => {
              const borderColor = category.color === 'red' ? 'border-red-200' : 
                                 category.color === 'amber' ? 'border-amber-200' : 'border-yellow-200';
              const bgColor = category.color === 'red' ? 'bg-red-50' : 
                             category.color === 'amber' ? 'bg-amber-50' : 'bg-yellow-50';
              const textColor = category.color === 'red' ? 'text-red-900' : 
                               category.color === 'amber' ? 'text-amber-900' : 'text-yellow-900';
              
              return (
                <Card key={index} className={`bg-white/70 backdrop-blur-sm ${borderColor} shadow-lg`}>
                  <CardHeader className={bgColor}>
                    <CardTitle className={`text-lg text-center ${textColor}`}>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {category.signs.map((sign, signIndex) => (
                        <li key={signIndex} className="flex items-start space-x-2">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${category.color === 'red' ? 'text-red-500' : category.color === 'amber' ? 'text-amber-500' : 'text-yellow-500'}`} />
                          <span className="text-sm text-gray-700">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How to Help */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How to Help Someone in Crisis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {supportStrategies.map((strategy, index) => {
              const Icon = strategy.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {strategy.title}
                        </h3>
                        <p className="text-gray-600">
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Local Resources */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-16">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Find Local Resources
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Local Crisis Centers</h4>
                <p className="text-sm text-gray-600 mb-4">Find crisis intervention centers in your area</p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Search by Location
                </Button>
              </div>
              
              <div className="text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Support Groups</h4>
                <p className="text-sm text-gray-600 mb-4">Find local grief and mental health support groups</p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Find Groups
                </Button>
              </div>
              
              <div className="text-center">
                <Headphones className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Professional Counselors</h4>
                <p className="text-sm text-gray-600 mb-4">Connect with licensed mental health professionals</p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Find Counselors
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Support */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Additional Support?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help connect you with appropriate resources and support during difficult times.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Mail className="w-5 h-5 mr-2" />
              Contact Our Support Team
            </Button>
            
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium">
              <Users className="w-5 h-5 mr-2" />
              Join Our Community
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Available 24/7 • Confidential support • No judgment
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}