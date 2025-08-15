import { useState } from "react";
import { Heart, Plus, Upload, MessageCircle, Clock, Shield, Calendar, Settings, Play, Bookmark, Share, Download, Mic, FileText, Video, Camera, Sparkles, Users, BarChart3, CheckCircle, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export default function Dashboard() {
  const [selectedPersona, setSelectedPersona] = useState('grandma-rose');
  const [mode, setMode] = useState<'grief' | 'legacy'>('grief');
  const [voiceSimilarity] = useState(82);
  
  // Sample data - in real app this would come from API
  const personas = [
    {
      id: 'grandma-rose',
      name: 'Grandma Rose',
      avatar: '👵',
      totalMemories: 47,
      lastInteraction: '3 days ago',
      voiceTag: 'Warm & Nurturing',
      completionPercent: 85,
      recentMemories: [
        { type: 'voice', title: 'Sunday dinner stories', date: '2 days ago', category: 'love' },
        { type: 'photo', title: 'Family vacation photos', date: '5 days ago', category: 'wisdom' },
        { type: 'text', title: 'Recipe collection', date: '1 week ago', category: 'humor' }
      ]
    }
  ];

  const currentPersona = personas.find(p => p.id === selectedPersona) || personas[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">∞</span>
                </div>
                <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
              </Link>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Dashboard
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-gray-600" />
                <Switch
                  checked={mode === 'legacy'}
                  onCheckedChange={(checked) => setMode(checked ? 'legacy' : 'grief')}
                />
                <Sun className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 capitalize">{mode} Mode</span>
              </div>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Memory Overview Panel */}
        <div className="mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl shadow-lg">
                    {currentPersona.avatar}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentPersona.name}</h1>
                    <p className="text-purple-600 font-medium mb-2">{currentPersona.voiceTag}</p>
                    <div className="flex items-center text-gray-600 text-sm space-x-4">
                      <span>{currentPersona.totalMemories} memories preserved</span>
                      <span>•</span>
                      <span>You last spoke with {currentPersona.name} {currentPersona.lastInteraction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continue Conversation
                  </Button>
                  <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Light a Memory
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 bg-purple-50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="memories">Memory Builder</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Memory Stats */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-purple-600" />
                    Memory Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-purple-700">{currentPersona.totalMemories}</div>
                  <p className="text-sm text-gray-600">Total memories preserved</p>
                  <Progress value={currentPersona.completionPercent} className="h-2" />
                  <p className="text-xs text-gray-500">{currentPersona.completionPercent}% persona complete</p>
                </CardContent>
              </Card>

              {/* Voice Similarity */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Mic className="w-5 h-5 mr-2 text-purple-600" />
                    Voice Fidelity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-purple-700">{voiceSimilarity}%</div>
                  <p className="text-sm text-gray-600">Voice similarity achieved</p>
                  <Progress value={voiceSimilarity} className="h-2" />
                  <Button variant="outline" size="sm" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Test Voice Sample
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentPersona.recentMemories.slice(0, 3).map((memory, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        {memory.type === 'voice' && <Mic className="w-4 h-4 text-purple-600" />}
                        {memory.type === 'photo' && <Camera className="w-4 h-4 text-purple-600" />}
                        {memory.type === 'text' && <FileText className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{memory.title}</p>
                        <p className="text-xs text-gray-500">{memory.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Emotional Categories */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl">Emotional Memory Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { category: 'Love', count: 18, color: 'bg-pink-500', icon: '💕' },
                    { category: 'Wisdom', count: 12, color: 'bg-blue-500', icon: '🧠' },
                    { category: 'Humor', count: 10, color: 'bg-yellow-500', icon: '😄' },
                    { category: 'Faith', count: 7, color: 'bg-purple-500', icon: '🙏' }
                  ].map((item) => (
                    <div key={item.category} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Builder Tab */}
          <TabsContent value="memories" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl">Add a New Memory</CardTitle>
                  <p className="text-gray-600">Upload and organize precious moments</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Video className="w-6 h-6" />
                      <span className="text-xs">Video</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Mic className="w-6 h-6" />
                      <span className="text-xs">Audio</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="w-6 h-6" />
                      <span className="text-xs">Text</span>
                    </Button>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Moment from Today
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Uploads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentPersona.recentMemories.map((memory, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          {memory.type === 'voice' && <Mic className="w-4 h-4 text-purple-600" />}
                          {memory.type === 'photo' && <Camera className="w-4 h-4 text-purple-600" />}
                          {memory.type === 'text' && <FileText className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{memory.title}</p>
                          <p className="text-sm text-gray-500">{memory.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {memory.category}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personality & Voice Training Tab */}
          <TabsContent value="personality" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl">Voice & Personality Training</CardTitle>
                <p className="text-gray-600">Fine-tune how your loved one communicates</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personality Traits</h3>
                    {[
                      { trait: 'Compassionate', value: [85] },
                      { trait: 'Witty', value: [60] },
                      { trait: 'Firm', value: [40] },
                      { trait: 'Poetic', value: [70] }
                    ].map((item) => (
                      <div key={item.trait} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.trait}</span>
                          <span className="text-sm text-gray-500">{item.value[0]}%</span>
                        </div>
                        <Slider value={item.value} max={100} step={1} className="w-full" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Key Phrases</h3>
                    <div className="space-y-2">
                      {[
                        "Don't forget your keys!",
                        "Remember to eat something, dear",
                        "I'm so proud of you",
                        "Take care of yourself"
                      ].map((phrase, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm">
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Key Phrase
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quick Train with Latest Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation Review Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Conversations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Morning chat about garden", date: "2 hours ago", bookmarked: true },
                    { title: "Advice about work situation", date: "1 day ago", bookmarked: false },
                    { title: "Sharing childhood memories", date: "3 days ago", bookmarked: true },
                    { title: "Recipe discussion", date: "5 days ago", bookmarked: false }
                  ].map((conv, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{conv.title}</p>
                        <p className="text-sm text-gray-500">{conv.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conv.bookmarked && <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />}
                        <Button variant="ghost" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download as PDF Legacy
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Create Memory Reel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="w-4 h-4 mr-2" />
                    Generate Shareable Snippet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Ethics Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-600" />
                  Privacy & Ethical Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Consent & Permissions</h3>
                    <div className="space-y-3">
                      {[
                        { permission: "Voice Recreation", granted: true },
                        { permission: "Family Sharing", granted: true },
                        { permission: "Legacy Mode Access", granted: false },
                        { permission: "External Sharing", granted: false }
                      ].map((item) => (
                        <div key={item.permission} className="flex items-center justify-between">
                          <span className="text-sm">{item.permission}</span>
                          <div className="flex items-center space-x-2">
                            {item.granted ? 
                              <CheckCircle className="w-4 h-4 text-green-500" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Emotional Safeguards</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Therapist Mode</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Realism Limiter</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Privacy Lock</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    All memories are encrypted and stored securely. Your data is never used to train public AI models.
                  </p>
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Review Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Memory Growth Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { milestone: "First Voice Sample", date: "3 weeks ago", type: "voice", description: "Added initial voice recording" },
                    { milestone: "Video Collection", date: "2 weeks ago", type: "video", description: "Uploaded family dinner videos" },
                    { milestone: "Personality Complete", date: "1 week ago", type: "achievement", description: "Reached 80% personality training" },
                    { milestone: "First Conversation", date: "5 days ago", type: "chat", description: "Had first meaningful dialogue" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {item.type === 'voice' && <Mic className="w-4 h-4 text-purple-600" />}
                        {item.type === 'video' && <Video className="w-4 h-4 text-purple-600" />}
                        {item.type === 'achievement' && <Sparkles className="w-4 h-4 text-purple-600" />}
                        {item.type === 'chat' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.milestone}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Memory from Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}