import { useState, useEffect } from "react";
import { Heart, Plus, Upload, MessageCircle, Clock, Shield, Calendar, Settings, Play, Bookmark, Share, Download, Mic, FileText, Video, Camera, Sparkles, Users, BarChart3, CheckCircle, Moon, Sun, Edit, Trash2, X, Menu, User2, LogOut, Bell, Home, ChevronRight, Brain, Archive, HelpCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import UserProfile from "@/components/UserProfile";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Persona } from "@shared/schema";

export default function Dashboard() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('personas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch real personas data
  const { data: personas = [], isLoading: personasLoading } = useQuery<Persona[]>({
    queryKey: ['/api/personas'],
    enabled: !!user && !loading,
  });

  // Delete persona mutation
  const deletePersonaMutation = useMutation({
    mutationFn: async (personaId: string) => {
      const response = await apiRequest('DELETE', `/api/personas/${personaId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personas'] });
      setSelectedPersona(null);
      toast({
        title: "Success",
        description: "Persona deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete persona error:', error);
      toast({
        title: "Error",
        description: "Failed to delete persona",
        variant: "destructive",
      });
    },
  });

  // Update persona mutation
  const updatePersonaMutation = useMutation({
    mutationFn: async ({ personaId, updates }: { personaId: string; updates: Partial<Persona> }) => {
      const response = await apiRequest('PUT', `/api/personas/${personaId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personas'] });
      setEditingPersona(null);
      setEditName('');
      toast({
        title: "Success",
        description: "Persona updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update persona error:', error);
      toast({
        title: "Error",
        description: "Failed to update persona",
        variant: "destructive",
      });
    },
  });

  // Helper functions for edit functionality
  const startEditing = (persona: Persona) => {
    setEditingPersona(persona.id);
    setEditName(persona.name);
  };

  const cancelEditing = () => {
    setEditingPersona(null);
    setEditName('');
  };

  const saveEdit = () => {
    if (editingPersona && editName.trim()) {
      updatePersonaMutation.mutate({
        personaId: editingPersona,
        updates: { name: editName.trim() }
      });
    }
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/sign-in';
    }
  }, [user, loading]);

  // Loading state
  if (loading || personasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">∞</span>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'personas',
      label: 'My Personas',
      icon: Heart,
      count: personas.length,
      active: activeSection === 'personas'
    },
    {
      id: 'memories',
      label: 'Memory Archive',
      icon: Archive,
      active: activeSection === 'memories'
    },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: MessageCircle,
      active: activeSection === 'conversations'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: activeSection === 'analytics'
    }
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: activeSection === 'settings'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      active: activeSection === 'billing'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      active: activeSection === 'help'
    }
  ];

  // Extract photo from onboarding data if available
  const getPersonaPhoto = (persona: Persona) => {
    const onboardingData = persona.onboardingData as any;
    return onboardingData?.photoBase64 || null;
  };

  // Extract adjectives from onboarding data
  const getPersonaAdjectives = (persona: Persona) => {
    const onboardingData = persona.onboardingData as any;
    return onboardingData?.adjectives || [];
  };

  // Sidebar component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo and Brand */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">∞</span>
          </div>
          {!isSidebarCollapsed && (
            <span className="text-gray-900 font-semibold text-lg">Preserving</span>
          )}
        </Link>
      </div>

      {/* User Profile Section */}
      <div className={cn("px-4 py-6 border-b", isSidebarCollapsed && "px-2")}>
        <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "space-x-3")}>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            {!isSidebarCollapsed && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main
              </h3>
            )}
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-2 py-2 rounded-lg transition-colors",
                      item.active
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100",
                      isSidebarCollapsed && "justify-center"
                    )}
                    data-testid={`sidebar-${item.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            {item.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            {!isSidebarCollapsed && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
            )}
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-2 py-2 rounded-lg transition-colors",
                      item.active
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100",
                      isSidebarCollapsed && "justify-center"
                    )}
                    data-testid={`sidebar-${item.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    {!isSidebarCollapsed && (
                      <span className="ml-3 flex-1 text-left">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            window.location.href = '/sign-in';
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 flex">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                {/* Desktop Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  <Menu className="w-5 h-5" />
                </Button>

                <h1 className="text-xl font-semibold text-gray-900">
                  {activeSection === 'personas' && 'My Personas'}
                  {activeSection === 'memories' && 'Memory Archive'}
                  {activeSection === 'conversations' && 'Conversations'}
                  {activeSection === 'analytics' && 'Analytics'}
                  {activeSection === 'settings' && 'Settings'}
                  {activeSection === 'billing' && 'Billing'}
                  {activeSection === 'help' && 'Help & Support'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* My Personas Section */}
          {activeSection === 'personas' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Personas</h2>
                  <p className="text-gray-600 mt-1">Manage and interact with your preserved connections</p>
                </div>
                <Link href="/gradual-awakening">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Persona
                  </Button>
                </Link>
              </div>

              {/* Personas Grid */}
              {personas.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="py-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Personas Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start preserving memories by creating your first AI persona of a loved one.
                    </p>
                    <Link href="/gradual-awakening">
                      <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Persona
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personas.map((persona) => {
                    const photo = getPersonaPhoto(persona);
                    const adjectives = getPersonaAdjectives(persona);
                    
                    return (
                      <Card 
                        key={persona.id} 
                        className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => setSelectedPersona(persona.id)}
                        data-testid={`card-persona-${persona.id}`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {photo ? (
                                <img 
                                  src={photo}
                                  alt={persona.name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                                  data-testid={`image-persona-${persona.id}`}
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                                  <Heart className="w-6 h-6 text-purple-600" />
                                </div>
                              )}
                              <div>
                                {editingPersona === persona.id ? (
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8 text-sm"
                                      data-testid={`input-edit-name-${persona.id}`}
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveEdit();
                                      }}
                                      data-testid={`button-save-edit-${persona.id}`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEditing();
                                      }}
                                      data-testid={`button-cancel-edit-${persona.id}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <CardTitle className="text-lg" data-testid={`text-persona-name-${persona.id}`}>
                                      {persona.name}
                                    </CardTitle>
                                    <CardDescription data-testid={`text-persona-relationship-${persona.id}`}>
                                      {persona.relationship}
                                    </CardDescription>
                                  </>
                                )}
                              </div>
                            </div>
                            {!editingPersona && (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(persona);
                                  }}
                                  data-testid={`button-edit-${persona.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => e.stopPropagation()}
                                      data-testid={`button-delete-${persona.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{persona.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deletePersonaMutation.mutate(persona.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {adjectives.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {adjectives.map((adj: string, idx: number) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-700"
                                  data-testid={`badge-adjective-${persona.id}-${idx}`}
                                >
                                  {adj}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Completeness</span>
                              <span className="font-medium text-purple-700">
                                {persona.status === 'completed' ? '100%' : '50%'}
                              </span>
                            </div>
                            <Progress 
                              value={persona.status === 'completed' ? 100 : 50} 
                              className="h-2" 
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/chat/${persona.id}`);
                              }}
                              data-testid={`button-chat-${persona.id}`}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add memory functionality
                              }}
                              data-testid={`button-add-memory-${persona.id}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Memory
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Other Sections */}
          {activeSection === 'memories' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Memory Archive</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <Archive className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Memory Archive Coming Soon</h3>
                  <p className="text-gray-600">
                    Your memories and stories will be organized here.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'conversations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Conversations Yet</h3>
                  <p className="text-gray-600">
                    Start chatting with your personas to see conversations here.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Track your memory building progress and insights.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
                  <p className="text-gray-600">
                    Configure your preferences and account settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Billing & Subscription</h3>
                  <p className="text-gray-600">
                    Manage your subscription and billing preferences.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'help' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="py-16 text-center">
                  <HelpCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">How Can We Help?</h3>
                  <p className="text-gray-600">
                    Find answers to common questions or contact support.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}