import { useState } from "react";
import { Heart, MessageSquare, Users, Shield, BookOpen, Calendar, MessageCircle, Sparkles, ChevronRight, User, Clock, Star, Video, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParticleSystem from "@/components/ParticleSystem";
import { Link } from "wouter";

interface Discussion {
  id: number;
  title: string;
  author: string;
  authorInitials: string;
  category: string;
  replies: number;
  lastActivity: string;
  isPinned?: boolean;
}

interface MemoryPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorInitials: string;
  timeAgo: string;
  likes: number;
  comments: number;
}

interface Counselor {
  id: number;
  name: string;
  credentials: string;
  specialties: string[];
  availability: string;
  nextSession: string;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const discussions: Discussion[] = [
    {
      id: 1,
      title: "Coping with the first anniversary",
      author: "Sarah M.",
      authorInitials: "SM",
      category: "Grief Support",
      replies: 23,
      lastActivity: "2 hours ago",
      isPinned: true
    },
    {
      id: 2,
      title: "How to involve children in memory preservation",
      author: "Michael R.",
      authorInitials: "MR",
      category: "Family Coordination",
      replies: 15,
      lastActivity: "4 hours ago"
    },
    {
      id: 3,
      title: "Sharing memories with extended family",
      author: "Linda K.",
      authorInitials: "LK",
      category: "Memory Sharing",
      replies: 31,
      lastActivity: "6 hours ago"
    },
    {
      id: 4,
      title: "Finding peace through digital connection",
      author: "David L.",
      authorInitials: "DL",
      category: "Healing Journey",
      replies: 18,
      lastActivity: "1 day ago"
    }
  ];

  const memoryPosts: MemoryPost[] = [
    {
      id: 1,
      title: "Dad's Sunday Pancake Tradition",
      content: "Every Sunday, Dad would wake up early and make his famous blueberry pancakes. The whole house would smell amazing, and we'd all gather around the kitchen table...",
      author: "Jennifer W.",
      authorInitials: "JW",
      timeAgo: "3 hours ago",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: "Grandma's Garden Wisdom",
      content: "She always said 'Plants are like people, dear. They need love, patience, and the right conditions to bloom.' I think about this every time I tend to my own garden now...",
      author: "Robert C.",
      authorInitials: "RC",
      timeAgo: "5 hours ago",
      likes: 42,
      comments: 12
    },
    {
      id: 3,
      title: "Mom's Bedtime Stories",
      content: "She had this magical way of telling stories that made even the simplest fairy tale feel like an epic adventure. Her voice would change for every character...",
      author: "Emily T.",
      authorInitials: "ET",
      timeAgo: "1 day ago",
      likes: 18,
      comments: 6
    }
  ];

  const counselors: Counselor[] = [
    {
      id: 1,
      name: "Dr. Maria Rodriguez",
      credentials: "PhD, LMFT, Grief Counseling Specialist",
      specialties: ["Grief & Loss", "Family Therapy", "Digital Memorialization"],
      availability: "Available Today",
      nextSession: "2:00 PM"
    },
    {
      id: 2,
      name: "Dr. James Chen",
      credentials: "PsyD, Licensed Clinical Psychologist",
      specialties: ["Trauma Recovery", "Bereavement", "Support Groups"],
      availability: "Available Tomorrow",
      nextSession: "10:00 AM"
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      credentials: "MSW, LCSW, Thanatology Certified",
      specialties: ["Child & Teen Grief", "Family Dynamics", "Memory Work"],
      availability: "Available This Week",
      nextSession: "Friday 3:00 PM"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 via-indigo-50/20 to-purple-100/50 animate-gradient-xy"></div>
      
      {/* Moving gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-200/20 via-transparent to-indigo-200/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-100/10 to-transparent animate-bounce-slow"></div>
      </div>

      {/* Fairy Particles */}
      <ParticleSystem />

      {/* Floating gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-64 bg-gradient-to-r from-purple-200/20 to-indigo-200/15 rounded-full blur-3xl floating-cloud-1"></div>
        <div className="absolute top-40 right-20 w-80 h-48 bg-gradient-to-l from-violet-200/15 to-purple-300/10 rounded-full blur-3xl floating-cloud-2"></div>
        <div className="absolute bottom-40 left-1/3 w-72 h-40 bg-gradient-to-r from-indigo-200/15 to-purple-200/20 rounded-full blur-3xl floating-cloud-3"></div>
      </div>

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
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Users className="w-3 h-3 mr-1" />
                Community
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with others on similar journeys, share precious memories, and find professional support when you need it most.
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="discussions" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Memory Sharing</span>
            </TabsTrigger>
            <TabsTrigger value="coordination" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Family Help</span>
            </TabsTrigger>
            <TabsTrigger value="counselors" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Professional Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Grief Support Discussions */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Support Discussions</h2>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start New Discussion
              </Button>
            </div>
            
            <div className="grid gap-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              <Star className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {discussion.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                                {discussion.authorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span>{discussion.author}</span>
                          </div>
                          <span>•</span>
                          <span>{discussion.replies} replies</span>
                          <span>•</span>
                          <span>{discussion.lastActivity}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Memory Sharing */}
          <TabsContent value="memories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Shared Memories</h2>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Heart className="w-4 h-4 mr-2" />
                Share a Memory
              </Button>
            </div>

            {/* Create New Memory Post */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Share a Precious Memory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Give your memory a title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
                <Textarea
                  placeholder="Tell us about a special moment, tradition, or story..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Share Memory
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid gap-6">
              {memoryPosts.map((post) => (
                <Card key={post.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {post.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <span className="text-sm text-gray-500">by {post.author}</span>
                        </div>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.timeAgo}</span>
                          </span>
                          <button className="flex items-center space-x-1 hover:text-purple-600">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-purple-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Family Coordination Help */}
          <TabsContent value="coordination" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Family Coordination</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Resources and guidance for involving family members in the memory preservation process.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <span>Family Invitation Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Invite family members to contribute memories and help build a richer persona together.
                  </p>
                  <Button variant="outline" className="w-full">
                    Send Family Invitations
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <span>Coordination Guides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Step-by-step guides for organizing family memory-gathering sessions.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Guides
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
                    Schedule virtual family gatherings to share memories together.
                  </p>
                  <Button variant="outline" className="w-full">
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <span>Collaborative Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Shared spaces for collecting photos, stories, and memories from all family members.
                  </p>
                  <Button variant="outline" className="w-full">
                    Create Shared Space
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professional Counselor Support */}
          <TabsContent value="counselors" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Support</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Connect with licensed grief counselors and therapists who understand the journey of digital memorialization.
              </p>
            </div>

            <div className="grid gap-6">
              {counselors.map((counselor) => (
                <Card key={counselor.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                              {counselor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{counselor.name}</h3>
                            <p className="text-gray-600">{counselor.credentials}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                          <div className="flex flex-wrap gap-2">
                            {counselor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{counselor.availability}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Next available: {counselor.nextSession}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Video className="w-4 h-4 mr-2" />
                          Video Session
                        </Button>
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Support */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Crisis Support</h3>
                </div>
                <p className="text-red-800 mb-4">
                  If you're experiencing a mental health crisis, please reach out immediately:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">24/7 Crisis Hotline</h4>
                    <p className="text-red-800 font-semibold">988 - Suicide & Crisis Lifeline</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Crisis Text Line</h4>
                    <p className="text-red-800 font-semibold">Text HOME to 741741</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}