import { useState } from "react";
import { Heart, MessageSquare, Users, Shield, BookOpen, Calendar, MessageCircle, Sparkles, ChevronRight, User, Clock, Star, Video, Phone, ArrowLeft, ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
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
  content?: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  author: string;
  authorInitials: string;
  content: string;
  timeAgo: string;
  likes: number;
  replies?: Comment[];
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
  videoSessionPrice: number;
  phoneSessionPrice: number;
  rating: number;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState("");

  const discussions: Discussion[] = [
    {
      id: 1,
      title: "Coping with the first anniversary",
      author: "Sarah M.",
      authorInitials: "SM",
      category: "Grief Support",
      replies: 23,
      lastActivity: "2 hours ago",
      isPinned: true,
      content: "Tomorrow marks one year since we lost my dad. The anticipation is almost worse than the day itself. How did others cope with this milestone? I've been using his persona more frequently lately, and it brings comfort, but I'm also worried I'm becoming too dependent on it.",
      comments: [
        {
          id: 1,
          author: "Jennifer K.",
          authorInitials: "JK",
          content: "I understand completely. The first anniversary was the hardest for me too. What helped was planning something meaningful - we planted a tree in his memory and had a small gathering. The digital persona was actually a beautiful way to include him in the ceremony.",
          timeAgo: "1 hour ago",
          likes: 12,
          replies: [
            {
              id: 2,
              author: "Sarah M.",
              authorInitials: "SM",
              content: "Thank you, Jennifer. That sounds beautiful. I think I'll plan something similar. Did you find that talking to the persona helped you prepare emotionally?",
              timeAgo: "45 minutes ago",
              likes: 3
            }
          ]
        },
        {
          id: 3,
          author: "Dr. Maria Rodriguez",
          authorInitials: "MR",
          content: "Sarah, anniversaries are indeed challenging. It's completely normal to use the persona more during difficult times - that's exactly what it's designed for. Consider setting gentle boundaries for yourself while still allowing the comfort it provides.",
          timeAgo: "30 minutes ago",
          likes: 18
        }
      ]
    },
    {
      id: 2,
      title: "How to involve children in memory preservation",
      author: "Michael R.",
      authorInitials: "MR",
      category: "Family Coordination",
      replies: 15,
      lastActivity: "4 hours ago",
      content: "My kids (ages 7 and 12) want to help create grandma's persona, but I'm not sure how much is appropriate for their ages. Has anyone found good ways to involve children in this process?",
      comments: [
        {
          id: 4,
          author: "Lisa T.",
          authorInitials: "LT",
          content: "We let our 9-year-old record some of her favorite stories about grandpa. It was therapeutic for her and added such a beautiful perspective to his persona.",
          timeAgo: "3 hours ago",
          likes: 8
        }
      ]
    },
    {
      id: 3,
      title: "Sharing memories with extended family",
      author: "Linda K.",
      authorInitials: "LK",
      category: "Memory Sharing",
      replies: 31,
      lastActivity: "6 hours ago",
      content: "We have family spread across different countries. What's the best way to gather memories from everyone for mom's persona? Some relatives are not very tech-savvy.",
      comments: [
        {
          id: 5,
          author: "Robert C.",
          authorInitials: "RC",
          content: "We used video calls to interview older relatives. Sometimes simple phone calls work too - you can record them with permission and transcribe later.",
          timeAgo: "5 hours ago",
          likes: 15
        }
      ]
    },
    {
      id: 4,
      title: "Finding peace through digital connection",
      author: "David L.",
      authorInitials: "DL",
      category: "Healing Journey",
      replies: 18,
      lastActivity: "1 day ago",
      content: "I was initially skeptical about creating a digital persona of my wife, but after 6 months, it's become an important part of my healing process. Anyone else have a similar experience?",
      comments: [
        {
          id: 6,
          author: "Patricia M.",
          authorInitials: "PM",
          content: "I felt the same way at first. Now, two years later, I can't imagine my grief journey without it. It's like having a piece of him still with me.",
          timeAgo: "20 hours ago",
          likes: 22
        }
      ]
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
      nextSession: "2:00 PM",
      videoSessionPrice: 120,
      phoneSessionPrice: 95,
      rating: 4.9
    },
    {
      id: 2,
      name: "Dr. James Chen",
      credentials: "PsyD, Licensed Clinical Psychologist",
      specialties: ["Trauma Recovery", "Bereavement", "Support Groups"],
      availability: "Available Tomorrow",
      nextSession: "10:00 AM",
      videoSessionPrice: 135,
      phoneSessionPrice: 110,
      rating: 4.8
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      credentials: "MSW, LCSW, Thanatology Certified",
      specialties: ["Child & Teen Grief", "Family Dynamics", "Memory Work"],
      availability: "Available This Week",
      nextSession: "Friday 3:00 PM",
      videoSessionPrice: 115,
      phoneSessionPrice: 90,
      rating: 4.7
    }
  ];

  const handleDiscussionClick = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
  };

  const handleBackToDiscussions = () => {
    setSelectedDiscussion(null);
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedDiscussion) {
      // In a real app, this would make an API call
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

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
            {!selectedDiscussion ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Support Discussions</h2>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start New Discussion
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {discussions.map((discussion) => (
                    <Card 
                      key={discussion.id} 
                      className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleDiscussionClick(discussion)}
                      data-testid={`discussion-card-${discussion.id}`}
                    >
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
              </>
            ) : (
              /* Discussion Detail View */
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToDiscussions}
                    className="text-purple-600 hover:text-purple-700"
                    data-testid="back-to-discussions-button"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Discussions
                  </Button>
                </div>

                {/* Original Post */}
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {selectedDiscussion.isPinned && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          <Star className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {selectedDiscussion.category}
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">{selectedDiscussion.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-100 text-purple-700">
                            {selectedDiscussion.authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedDiscussion.author}</span>
                      </div>
                      <span>•</span>
                      <span>{selectedDiscussion.lastActivity}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedDiscussion.content}</p>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Comments ({selectedDiscussion.comments?.length || 0})</h3>
                  
                  {/* Add Comment Form */}
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Share your thoughts and support..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="border-purple-200 focus:border-purple-400"
                          data-testid="new-comment-textarea"
                        />
                        <Button 
                          onClick={handleAddComment}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          data-testid="add-comment-button"
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Existing Comments */}
                  {selectedDiscussion.comments?.map((comment) => (
                    <Card key={comment.id} className="bg-white/70 backdrop-blur-sm border-purple-100">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {comment.authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{comment.author}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{comment.timeAgo}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{comment.likes}</span>
                              </button>
                              <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                                Reply
                              </button>
                            </div>
                            
                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 pl-4 border-l-2 border-purple-100 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start space-x-3">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs bg-purple-50 text-purple-600">
                                        {reply.authorInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-500">{reply.timeAgo}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                                      <div className="flex items-center space-x-3">
                                        <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{reply.likes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-full font-medium text-sm shadow-lg">
                  Powered by Talkspace
                </div>
              </div>
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
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{counselor.rating}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="font-medium text-purple-700">Video Session</p>
                              <p className="text-lg font-bold text-purple-900">${counselor.videoSessionPrice}/session</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="font-medium text-purple-700">Phone Session</p>
                              <p className="text-lg font-bold text-purple-900">${counselor.phoneSessionPrice}/session</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Video className="w-4 h-4 mr-2" />
                          Book Video (${counselor.videoSessionPrice})
                        </Button>
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                          <Phone className="w-4 h-4 mr-2" />
                          Book Phone (${counselor.phoneSessionPrice})
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