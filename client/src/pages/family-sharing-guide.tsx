import { Users, Share, Heart, Shield, Mail, Calendar, Camera, FileText, ArrowRight, CheckCircle, UserPlus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function FamilySharingGuide() {
  const sharingSteps = [
    {
      title: "Prepare Your Family",
      description: "Have gentle conversations about the persona project before inviting participation.",
      icon: MessageSquare,
      details: [
        "Explain the purpose and benefits of creating a digital memory",
        "Address any concerns about technology or privacy",
        "Respect different comfort levels with the concept",
        "Set clear expectations about the time commitment"
      ]
    },
    {
      title: "Send Invitations",
      description: "Use our built-in tools to invite family members with personalized messages.",
      icon: Mail,
      details: [
        "Customize invitation messages for each family member",
        "Include context about why their memories are important",
        "Provide clear instructions on how to participate",
        "Set optional deadlines for contributions"
      ]
    },
    {
      title: "Coordinate Contributions",
      description: "Help family members understand how to share their unique memories.",
      icon: Calendar,
      details: [
        "Schedule virtual family memory sessions",
        "Create shared folders for photos and documents",
        "Assign specific memory themes to different relatives",
        "Provide templates for written memory submissions"
      ]
    },
    {
      title: "Review & Integrate",
      description: "Combine all family contributions into a richer, more complete persona.",
      icon: CheckCircle,
      details: [
        "Review all submitted memories for consistency",
        "Resolve any conflicting memories through family discussion",
        "Test the enhanced persona with contributing family members",
        "Make final adjustments based on family feedback"
      ]
    }
  ];

  const privacyGuidelines = [
    {
      title: "Family Consent",
      description: "Ensure all contributing family members understand and consent to the persona creation.",
      icon: Shield
    },
    {
      title: "Memory Ownership",
      description: "Respect that different family members may have different perspectives on the same events.",
      icon: Heart
    },
    {
      title: "Access Control",
      description: "Decide together who will have access to the persona and under what circumstances.",
      icon: Users
    },
    {
      title: "Future Updates",
      description: "Establish a process for how the persona can be updated or modified over time.",
      icon: Share
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
              <Users className="w-3 h-3 mr-1" />
              Family Guide
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Family Sharing Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bring your whole family together to create a richer, more complete digital memory that captures 
            different perspectives and cherished moments from everyone who loved them.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="coordination">Coordination</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Ethics</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Four Steps to Family Collaboration
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A thoughtful approach to including your entire family in preserving precious memories together.
              </p>
            </div>

            <div className="grid gap-8">
              {sharingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Step {index + 1}: {step.title}
                          </h3>
                          <p className="text-gray-600 text-lg mb-4">
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Coordination */}
          <TabsContent value="coordination" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                    <span>Invitation Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Pre-written, sensitive invitation messages for different family relationships.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">For Siblings</h4>
                      <p className="text-sm text-purple-800">
                        "I'm creating a digital memory of [Name] and would love to include your stories and memories..."
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">For Extended Family</h4>
                      <p className="text-sm text-purple-800">
                        "Our family is preserving [Name]'s memory through a special project..."
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View All Templates
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span>Memory Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Schedule virtual gatherings where family members can share memories together.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800 font-medium">Childhood Memories</span>
                      <Badge variant="outline" className="bg-white">Scheduled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800 font-medium">Holiday Traditions</span>
                      <Badge variant="outline" className="bg-white">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800 font-medium">Life Lessons</span>
                      <Badge variant="outline" className="bg-white">Open</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 text-purple-600" />
                    <span>Shared Collections</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Create shared spaces where family members can upload photos, videos, and documents.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm text-purple-800">Photos</span>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm text-purple-800">Documents</span>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Create Collection
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Share className="w-6 h-6 text-purple-600" />
                    <span>Progress Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Keep track of who has contributed and what memories are still needed.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Sarah (Sister)</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Michael (Brother)</span>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Aunt Linda</span>
                      <Badge className="bg-gray-100 text-gray-600">Invited</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Send Reminders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Ethics */}
          <TabsContent value="privacy" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Privacy & Family Ethics
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Guidelines for respectful, ethical family collaboration in memory preservation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {privacyGuidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Icon className="w-8 h-8 text-purple-600 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {guideline.title}
                          </h3>
                          <p className="text-gray-600">
                            {guideline.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3" />
                  Important Considerations
                </h3>
                <div className="space-y-4 text-amber-800">
                  <p>
                    <strong>Conflicting Memories:</strong> Family members may remember the same events differently. 
                    This is normal and doesn't mean anyone is wrong—memories are personal and subjective.
                  </p>
                  <p>
                    <strong>Sensitive Content:</strong> Some family members may have difficult or painful memories. 
                    Create space for these while maintaining the overall positive nature of the persona.
                  </p>
                  <p>
                    <strong>Ongoing Consent:</strong> Family members should be able to modify or remove their 
                    contributions at any time, even after the persona is created.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>Family Meeting Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    A structured agenda for discussing the persona project with your family.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>Memory Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Questions to help family members recall and share meaningful memories.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Prompts
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>Technical Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Help for family members who may need assistance with the technology.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Get Help
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>Family Coordinator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Connect with a specialist who can help facilitate your family's collaboration.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Request Coordinator
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Bring Your Family Together?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start the conversation with your family and begin creating a collaborative memory together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Family Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/community'}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium"
            >
              Join Community
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}