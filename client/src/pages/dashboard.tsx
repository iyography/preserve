import React, { useState, useEffect, useRef } from "react";
import { Heart, Plus, Upload, MessageCircle, Clock, Shield, Calendar, Settings, Play, Bookmark, Share, Download, Mic, FileText, Video, Camera, Sparkles, Users, BarChart3, CheckCircle, Moon, Sun, Edit, Trash2, X, Menu, User2, LogOut, Bell, Home, ChevronRight, Brain, Archive, HelpCircle, CreditCard, Search, Tag, MicOff, Save, Hash } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import UserProfile from "@/components/UserProfile";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Persona, Memory, Conversation, Message, UserSettings } from "@shared/schema";
import { insertMemorySchema, insertUserSettingsSchema } from "@shared/schema";

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }

  var SpeechRecognition: {
    new(): SpeechRecognition;
  };

  var webkitSpeechRecognition: {
    new(): SpeechRecognition;
  };
}

export default function Dashboard() {
  // Theme management state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      return savedTheme || systemPreference;
    }
    return 'light';
  });

  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('personas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Memory-related state
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemoryPersona, setSelectedMemoryPersona] = useState<string | null>(null);
  
  // Conversation-related state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingConversationTitle, setEditingConversationTitle] = useState('');
  
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Speech recognition ref
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  // Memory form schema - keep tags as string for form input, transform to array on submit
  const memoryFormSchema = insertMemorySchema.omit({ tags: true }).extend({
    tags: z.string().optional().default('')
  });

  type MemoryFormValues = z.infer<typeof memoryFormSchema>;

  // Memory queries and mutations
  const { data: memories = [], isLoading: memoriesLoading } = useQuery<Memory[]>({
    queryKey: ['/api/memories', selectedMemoryPersona],
    queryFn: async () => {
      if (!selectedMemoryPersona) return [];
      const response = await fetch(`/api/memories?personaId=${selectedMemoryPersona}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.json();
    },
    enabled: !!selectedMemoryPersona && !!user && !loading,
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: Omit<z.infer<typeof insertMemorySchema>, 'personaId'> & { personaId: string }) => {
      const response = await apiRequest('POST', '/api/memories', memoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memories', selectedMemoryPersona] });
      setIsAddMemoryOpen(false);
      toast({
        title: "Success",
        description: "Memory added successfully",
      });
    },
    onError: (error) => {
      console.error('Create memory error:', error);
      toast({
        title: "Error",
        description: "Failed to add memory",
        variant: "destructive",
      });
    },
  });

  const updateMemoryMutation = useMutation({
    mutationFn: async ({ memoryId, updates }: { memoryId: string; updates: Partial<Memory> }) => {
      const response = await apiRequest('PUT', `/api/memories/${memoryId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memories', selectedMemoryPersona] });
      setEditingMemory(null);
      toast({
        title: "Success",
        description: "Memory updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update memory error:', error);
      toast({
        title: "Error",
        description: "Failed to update memory",
        variant: "destructive",
      });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      const response = await apiRequest('DELETE', `/api/memories/${memoryId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memories', selectedMemoryPersona] });
      toast({
        title: "Success",
        description: "Memory deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete memory error:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      });
    },
  });

  // Conversation queries and mutations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user && !loading,
  });

  const { data: selectedConversationData } = useQuery<Conversation>({
    queryKey: ['/api/conversations', selectedConversation],
    enabled: !!selectedConversation,
  });

  const { data: conversationMessages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ personaId, title }: { personaId: string; title?: string }) => {
      const response = await apiRequest('POST', '/api/conversations', { personaId, title });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setSelectedConversation(data.id);
      toast({
        title: "Success",
        description: "New conversation started",
      });
    },
    onError: (error) => {
      console.error('Create conversation error:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: async ({ conversationId, updates }: { conversationId: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/conversations/${conversationId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation] });
      setEditingConversationId(null);
      setEditingConversationTitle('');
      toast({
        title: "Success",
        description: "Conversation updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update conversation error:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiRequest('DELETE', `/api/conversations/${conversationId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setSelectedConversation(null);
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete conversation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiRequest('POST', '/api/messages', { conversationId, content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setNewMessageContent('');
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Helper functions for conversations
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!selectedConversation || !newMessageContent.trim() || isSendingMessage) return;
    
    setIsSendingMessage(true);
    setIsTyping(true);
    
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: newMessageContent.trim(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = (messages: Message[]) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content || '';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  const groupConversationsByPersona = () => {
    const grouped: { [personaId: string]: Conversation[] } = {};
    conversations.forEach(conv => {
      if (!grouped[conv.personaId]) {
        grouped[conv.personaId] = [];
      }
      grouped[conv.personaId].push(conv);
    });
    return grouped;
  };

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auto scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Memory form
  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: {
      content: '',
      type: 'episodic',
      tags: '',
      salience: 1.0,
      source: 'user_input',
    },
  });

  // Speech recognition functionality
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window.SpeechRecognition || window.webkitSpeechRecognition) as {
        new(): SpeechRecognition;
      };
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        form.setValue('content', form.getValues('content') + ' ' + transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        toast({
          title: "Speech Recognition Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current = recognition;
    }
  };

  const startRecording = () => {
    try {
      if (recognitionRef.current) {
        (recognitionRef.current as SpeechRecognition).start();
      } else {
        initializeSpeechRecognition();
        if (recognitionRef.current) {
          (recognitionRef.current as SpeechRecognition).start();
        }
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Speech Recognition Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as SpeechRecognition).stop();
    }
  };

  // Initialize speech recognition on component mount
  useEffect(() => {
    initializeSpeechRecognition();
  }, []);

  // Memory form submission
  const onSubmitMemory = async (values: MemoryFormValues) => {
    if (!selectedMemoryPersona) {
      toast({
        title: "Error",
        description: "Please select a persona first",
        variant: "destructive",
      });
      return;
    }

    // Transform tags string to array
    const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const memoryData = {
      content: values.content,
      type: values.type,
      source: values.source,
      salience: values.salience,
      tags: tagsArray,
      personaId: selectedMemoryPersona,
    };
    
    createMemoryMutation.mutate(memoryData);
  };

  // Filter memories based on search term
  const filteredMemories = memories.filter(memory => 
    memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    memory.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get memory type icon
  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'episodic': return FileText;
      case 'semantic': return Brain;
      case 'preference': return Heart;
      case 'boundary': return Shield;
      case 'relationship': return Users;
      default: return FileText;
    }
  };

  // Get memory type color
  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'episodic': return 'bg-blue-100 text-blue-800';
      case 'semantic': return 'bg-green-100 text-green-800';
      case 'preference': return 'bg-purple-100 text-purple-800';
      case 'boundary': return 'bg-red-100 text-red-800';
      case 'relationship': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
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
      <div className="p-4 border-t space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
              isSidebarCollapsed && "mx-auto"
            )}
            data-testid="theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-500" />
            )}
          </Button>
        </div>
        
        {/* Sign Out Button */}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
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
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-purple-100 dark:border-gray-700 sticky top-0 z-40">
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
              {/* Memory Archive Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Memory Archive</h2>
                <Dialog open={isAddMemoryOpen} onOpenChange={setIsAddMemoryOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                      data-testid="button-add-memory"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Memory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Memory</DialogTitle>
                      <DialogDescription>
                        Add a memory for your persona. You can type or use voice-to-text.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitMemory)} className="space-y-4">
                        {/* Persona Selection */}
                        <FormField
                          control={form.control}
                          name="personaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Persona</FormLabel>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedMemoryPersona(value);
                              }} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-persona">
                                    <SelectValue placeholder="Select a persona" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {personas.map((persona) => (
                                    <SelectItem key={persona.id} value={persona.id}>
                                      {persona.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Memory Content with Voice Input */}
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Memory Content</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Textarea 
                                    placeholder="Type your memory here or use the microphone to record..."
                                    className="min-h-[120px] pr-12"
                                    data-testid="textarea-memory-content"
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isRecording ? "destructive" : "outline"}
                                  className="absolute top-2 right-2"
                                  onClick={isRecording ? stopRecording : startRecording}
                                  data-testid="button-voice-recording"
                                >
                                  {isRecording ? (
                                    <MicOff className="w-4 h-4" />
                                  ) : (
                                    <Mic className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              <FormDescription>
                                {isRecording ? "Recording... Click the microphone to stop." : "Click the microphone to start voice recording."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Memory Type */}
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Memory Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-memory-type">
                                    <SelectValue placeholder="Select memory type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="episodic">Episodic (Events & Experiences)</SelectItem>
                                  <SelectItem value="semantic">Semantic (Facts & Knowledge)</SelectItem>
                                  <SelectItem value="preference">Preference (Likes & Dislikes)</SelectItem>
                                  <SelectItem value="boundary">Boundary (Limits & Rules)</SelectItem>
                                  <SelectItem value="relationship">Relationship (Connections & People)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tags */}
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="family, childhood, hobbies (comma separated)"
                                  data-testid="input-memory-tags"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Add tags to organize and search your memories (comma separated)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddMemoryOpen(false);
                              form.reset();
                            }}
                            data-testid="button-cancel-memory"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createMemoryMutation.isPending}
                            data-testid="button-save-memory"
                          >
                            {createMemoryMutation.isPending ? "Saving..." : "Save Memory"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Persona Selection for Memory View */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Select Persona</CardTitle>
                  <CardDescription>Choose a persona to view and manage their memories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedMemoryPersona} value={selectedMemoryPersona || ""}>
                    <SelectTrigger data-testid="select-memory-persona">
                      <SelectValue placeholder="Select a persona to view memories" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Search and Filter */}
              {selectedMemoryPersona && (
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search memories by content, tags, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-memories"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Memory Display */}
              {selectedMemoryPersona ? (
                memoriesLoading ? (
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="py-16 text-center">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Archive className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-gray-600">Loading memories...</p>
                    </CardContent>
                  </Card>
                ) : filteredMemories.length === 0 ? (
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="py-16 text-center">
                      <Archive className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {searchTerm ? "No memories found" : "No memories yet"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm 
                          ? "Try adjusting your search terms or create a new memory."
                          : "Start building memories for this persona by clicking 'Add Memory'."
                        }
                      </p>
                      {!searchTerm && (
                        <Button 
                          onClick={() => setIsAddMemoryOpen(true)}
                          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                          data-testid="button-add-first-memory"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Memory
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredMemories.map((memory) => {
                      const TypeIcon = getMemoryTypeIcon(memory.type);
                      return (
                        <Card key={memory.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* Memory Type and Date */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <TypeIcon className="w-4 h-4 text-purple-600" />
                                    <Badge className={cn("text-xs", getMemoryTypeColor(memory.type))}>
                                      {memory.type}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(memory.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Memory Content */}
                                <p className="text-gray-900 mb-3 leading-relaxed">
                                  {memory.content}
                                </p>

                                {/* Tags */}
                                {memory.tags && memory.tags.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    {memory.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Memory Metadata */}
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                  <span>Salience: {memory.salience}</span>
                                  {memory.usageCount > 0 && (
                                    <span>Used {memory.usageCount} times</span>
                                  )}
                                  {memory.lastUsedAt && (
                                    <span>Last used: {new Date(memory.lastUsedAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMemory(memory);
                                    form.reset({
                                      content: memory.content,
                                      type: memory.type,
                                      tags: memory.tags ? memory.tags.join(', ') : '',
                                      salience: memory.salience,
                                      source: memory.source,
                                    });
                                    setSelectedMemoryPersona(memory.personaId);
                                    setIsAddMemoryOpen(true);
                                  }}
                                  data-testid={`button-edit-memory-${memory.id}`}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      data-testid={`button-delete-memory-${memory.id}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Memory</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this memory? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMemoryMutation.mutate(memory.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                        data-testid={`button-confirm-delete-memory-${memory.id}`}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="py-16 text-center">
                    <Archive className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Persona</h3>
                    <p className="text-gray-600">
                      Choose a persona above to view and manage their memories.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeSection === 'conversations' && (
            <div className="flex flex-col lg:flex-row h-full gap-6">
              {/* Left Panel - Conversation List */}
              <div className="w-full lg:w-1/3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    data-testid="button-new-conversation"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                <ScrollArea className="h-[600px]">
                  {conversationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-white/70 backdrop-blur-sm border-purple-100">
                          <CardContent className="p-4">
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : Object.keys(groupConversationsByPersona()).length === 0 ? (
                    <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                      <CardContent className="py-8 text-center">
                        <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">
                          No conversations yet. Start chatting with your personas!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupConversationsByPersona()).map(([personaId, convs]) => {
                        const persona = personas.find(p => p.id === personaId);
                        if (!persona) return null;

                        return (
                          <div key={personaId} className="space-y-2">
                            {/* Persona Header */}
                            <div className="flex items-center justify-between px-2 py-1">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                                    {persona.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm text-gray-700">{persona.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => createConversationMutation.mutate({ personaId })}
                                disabled={createConversationMutation.isPending}
                                data-testid={`button-new-conversation-${personaId}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Conversations for this persona */}
                            <div className="space-y-1 ml-4">
                              {convs.map((conversation) => (
                                <Card
                                  key={conversation.id}
                                  className={cn(
                                    "cursor-pointer transition-all duration-200 border-purple-100",
                                    selectedConversation === conversation.id
                                      ? "bg-purple-50 border-purple-300 shadow-md"
                                      : "bg-white/70 backdrop-blur-sm hover:bg-purple-25 hover:border-purple-200"
                                  )}
                                  onClick={() => setSelectedConversation(conversation.id)}
                                  data-testid={`conversation-${conversation.id}`}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        {editingConversationId === conversation.id ? (
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              value={editingConversationTitle}
                                              onChange={(e) => setEditingConversationTitle(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  updateConversationMutation.mutate({
                                                    conversationId: conversation.id,
                                                    updates: { title: editingConversationTitle }
                                                  });
                                                } else if (e.key === 'Escape') {
                                                  setEditingConversationId(null);
                                                  setEditingConversationTitle('');
                                                }
                                              }}
                                              className="h-6 text-sm"
                                              autoFocus
                                              data-testid={`input-edit-conversation-title-${conversation.id}`}
                                            />
                                          </div>
                                        ) : (
                                          <h4 className="font-medium text-sm text-gray-900 truncate">
                                            {conversation.title}
                                          </h4>
                                        )}
                                        
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                          {getLastMessagePreview([])}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {formatMessageTime(conversation.lastMessageAt)}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center space-x-1 ml-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingConversationId(conversation.id);
                                            setEditingConversationTitle(conversation.title);
                                          }}
                                          className="h-6 w-6 p-0 hover:bg-purple-100"
                                          data-testid={`button-edit-conversation-${conversation.id}`}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => e.stopPropagation()}
                                              className="h-6 w-6 p-0 hover:bg-red-100"
                                              data-testid={`button-delete-conversation-${conversation.id}`}
                                            >
                                              <Trash2 className="w-3 h-3 text-red-600" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete "{conversation.title}"? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => deleteConversationMutation.mutate(conversation.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                                data-testid={`button-confirm-delete-conversation-${conversation.id}`}
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Right Panel - Chat Interface */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <Card className="flex-1 bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg flex flex-col">
                    {/* Chat Header */}
                    <CardHeader className="border-b border-purple-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedConversationData && (
                            <>
                              {(() => {
                                const persona = personas.find(p => p.id === selectedConversationData.personaId);
                                return persona ? (
                                  <>
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {persona.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">{selectedConversationData.title}</h3>
                                      <p className="text-sm text-gray-500">Chatting with {persona.name}</p>
                                    </div>
                                  </>
                                ) : null;
                              })()}
                            </>
                          )}
                        </div>
                        
                        {isTyping && (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">AI is thinking...</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 p-4 overflow-hidden">
                      <ScrollArea className="h-full">
                        {messagesLoading ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : conversationMessages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <MessageCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                              <p className="text-gray-500">Start a conversation!</p>
                              <p className="text-sm text-gray-400 mt-1">Send a message to begin chatting.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 pb-4">
                            {conversationMessages.map((message, index) => (
                              <div
                                key={message.id}
                                className={cn(
                                  "flex items-start space-x-3",
                                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                )}
                                data-testid={`message-${message.id}`}
                              >
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback
                                    className={cn(
                                      "text-sm",
                                      message.role === 'user'
                                        ? "bg-blue-100 text-blue-700"
                                        : message.role === 'persona'
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-700"
                                    )}
                                  >
                                    {message.role === 'user' ? 'You' : 
                                     message.role === 'persona' ? 
                                     (selectedConversationData && personas.find(p => p.id === selectedConversationData.personaId)?.name.slice(0, 2).toUpperCase()) || 'AI' : 
                                     'SYS'}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className={cn(
                                  "flex-1 max-w-[80%]",
                                  message.role === 'user' ? 'text-right' : 'text-left'
                                )}>
                                  <div
                                    className={cn(
                                      "rounded-lg p-3 shadow-sm",
                                      message.role === 'user'
                                        ? "bg-blue-500 text-white ml-auto"
                                        : message.role === 'persona'
                                        ? "bg-white border border-gray-200"
                                        : "bg-gray-100 text-gray-600"
                                    )}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                  <p className={cn(
                                    "text-xs text-gray-400 mt-1",
                                    message.role === 'user' ? 'text-right' : 'text-left'
                                  )}>
                                    {formatMessageTime(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t border-purple-100 p-4">
                      <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                        <div className="flex-1">
                          <Textarea
                            value={newMessageContent}
                            onChange={(e) => setNewMessageContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                            disabled={isSendingMessage}
                            data-testid="input-message"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!newMessageContent.trim() || isSendingMessage}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-2"
                          data-testid="button-send-message"
                        >
                          {isSendingMessage ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </form>
                      <p className="text-xs text-gray-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="flex-1 bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                        <p className="text-gray-600 mb-4">
                          Choose a conversation from the list or start a new chat with any of your personas.
                        </p>
                        {personas.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">Quick start:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {personas.slice(0, 3).map((persona) => (
                                <Button
                                  key={persona.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => createConversationMutation.mutate({ personaId: persona.id })}
                                  disabled={createConversationMutation.isPending}
                                  data-testid={`button-quick-start-${persona.id}`}
                                >
                                  Chat with {persona.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
            <SettingsSection />
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

// Comprehensive Settings Component
function SettingsSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  // User settings form schema
  const settingsFormSchema = insertUserSettingsSchema.partial().extend({
    displayName: z.string().optional(),
    preferredLanguage: z.string().optional(),
    timezone: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    conversationNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    dataSharing: z.boolean().optional(),
    analyticsOptIn: z.boolean().optional(),
    allowPersonaSharing: z.boolean().optional(),
    publicProfile: z.boolean().optional(),
    preferredModel: z.string().optional(),
    responseLength: z.string().optional(),
    conversationStyle: z.string().optional(),
    creativityLevel: z.number().min(0).max(1).optional(),
    defaultPersonaVisibility: z.string().optional(),
    defaultMemoryRetention: z.string().optional(),
    autoGenerateInsights: z.boolean().optional(),
    theme: z.string().optional(),
    compactMode: z.boolean().optional(),
    sidebarCollapsed: z.boolean().optional()
  });

  type SettingsFormValues = z.infer<typeof settingsFormSchema>;

  // Fetch user settings
  const { data: userSettings, isLoading: settingsLoading, refetch } = useQuery<UserSettings>({
    queryKey: ['/api/user/settings'],
    enabled: !!user,
  });

  // Settings form
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      displayName: "",
      preferredLanguage: "en",
      timezone: "UTC",
      emailNotifications: true,
      pushNotifications: true,
      conversationNotifications: true,
      weeklyDigest: true,
      dataSharing: false,
      analyticsOptIn: true,
      allowPersonaSharing: false,
      publicProfile: false,
      preferredModel: "gpt-3.5-turbo",
      responseLength: "medium",
      conversationStyle: "balanced",
      creativityLevel: 0.7,
      defaultPersonaVisibility: "private",
      defaultMemoryRetention: "forever",
      autoGenerateInsights: true,
      theme: "system",
      compactMode: false,
      sidebarCollapsed: false
    },
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (userSettings) {
      settingsForm.reset({
        displayName: userSettings.displayName || "",
        preferredLanguage: userSettings.preferredLanguage || "en",
        timezone: userSettings.timezone || "UTC",
        emailNotifications: userSettings.emailNotifications ?? true,
        pushNotifications: userSettings.pushNotifications ?? true,
        conversationNotifications: userSettings.conversationNotifications ?? true,
        weeklyDigest: userSettings.weeklyDigest ?? true,
        dataSharing: userSettings.dataSharing ?? false,
        analyticsOptIn: userSettings.analyticsOptIn ?? true,
        allowPersonaSharing: userSettings.allowPersonaSharing ?? false,
        publicProfile: userSettings.publicProfile ?? false,
        preferredModel: userSettings.preferredModel || "gpt-3.5-turbo",
        responseLength: userSettings.responseLength || "medium",
        conversationStyle: userSettings.conversationStyle || "balanced",
        creativityLevel: userSettings.creativityLevel ?? 0.7,
        defaultPersonaVisibility: userSettings.defaultPersonaVisibility || "private",
        defaultMemoryRetention: userSettings.defaultMemoryRetention || "forever",
        autoGenerateInsights: userSettings.autoGenerateInsights ?? true,
        theme: userSettings.theme || "system",
        compactMode: userSettings.compactMode ?? false,
        sidebarCollapsed: userSettings.sidebarCollapsed ?? false
      });
    }
  }, [userSettings, settingsForm]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest('PUT', '/api/user/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle settings form submission
  const onSettingsSubmit = async (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-6" data-testid="settings-tabs">
          <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy</TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">AI Preferences</TabsTrigger>
          <TabsTrigger value="persona" data-testid="tab-persona">Persona Defaults</TabsTrigger>
          <TabsTrigger value="export" data-testid="tab-export">Export/Import</TabsTrigger>
        </TabsList>

        <Form {...settingsForm}>
          <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
            
            {/* Account Settings Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User2 className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your display name" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            data-testid="input-display-name"
                          />
                        </FormControl>
                        <FormDescription className="dark:text-gray-400">
                          This is how your name will appear throughout the app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-language">
                              <SelectValue placeholder="Select your preferred language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-timezone">
                              <SelectValue placeholder="Select your timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-theme">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          Choose your preferred color theme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Email Notifications</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Receive important updates via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-email-notifications"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Push Notifications</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Receive push notifications in your browser
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-push-notifications"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="conversationNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Conversation Notifications</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Get notified about new messages and responses
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-conversation-notifications"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="weeklyDigest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Weekly Digest</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Receive a weekly summary of your interactions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-weekly-digest"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="w-5 h-5" />
                    Privacy Controls
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Manage your privacy and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="dataSharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Data Sharing</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Allow anonymized data to be used for improving the service
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-data-sharing"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="analyticsOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Analytics</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Help us improve by sharing usage analytics
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-analytics-opt-in"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="allowPersonaSharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Persona Sharing</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Allow family members to access your personas (when implemented)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-persona-sharing"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="publicProfile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Public Profile</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Make your profile visible to other users (when implemented)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-public-profile"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Preferences Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Brain className="w-5 h-5" />
                    AI Model Preferences
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Customize how AI responds to you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="preferredModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Preferred AI Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-preferred-model">
                              <SelectValue placeholder="Select AI model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4 (High Quality)</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          Choose your preferred AI model for conversations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="responseLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Response Length</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-response-length">
                              <SelectValue placeholder="Select response length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="short">Short & Concise</SelectItem>
                            <SelectItem value="medium">Medium Length</SelectItem>
                            <SelectItem value="long">Detailed & Comprehensive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          How long should AI responses typically be?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="conversationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Conversation Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-conversation-style">
                              <SelectValue placeholder="Select conversation style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="formal">Formal & Professional</SelectItem>
                            <SelectItem value="casual">Casual & Friendly</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          Preferred tone for AI conversations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="creativityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">
                          Creativity Level: {field.value ? Math.round(field.value * 100) : 70}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[field.value || 0.7]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                            data-testid="slider-creativity-level"
                          />
                        </FormControl>
                        <FormDescription className="dark:text-gray-400">
                          Higher values make responses more creative and varied
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Persona Defaults Tab */}
            <TabsContent value="persona" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5" />
                    Persona Defaults
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Set default settings for new personas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="defaultPersonaVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Default Persona Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-default-persona-visibility">
                              <SelectValue placeholder="Select default visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="private">Private (Only You)</SelectItem>
                            <SelectItem value="family">Family Members</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          Who can access new personas by default
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="defaultMemoryRetention"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Memory Retention</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600" data-testid="select-default-memory-retention">
                              <SelectValue placeholder="Select memory retention" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                            <SelectItem value="forever">Forever</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="dark:text-gray-400">
                          How long to retain conversation memories
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="autoGenerateInsights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base dark:text-gray-200">Auto-Generate Insights</FormLabel>
                          <FormDescription className="dark:text-gray-400">
                            Automatically generate conversation insights and patterns
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-auto-generate-insights"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export/Import Tab */}
            <TabsContent value="export" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Download className="w-5 h-5" />
                    Data Export & Import
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Export your data or import from backups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Your Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download all your personas, conversations, and memories in JSON format.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        toast({
                          title: "Export feature",
                          description: "Data export functionality will be available soon.",
                        });
                      }}
                      data-testid="button-export-data"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Import your data from a previous backup or export file.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        toast({
                          title: "Import feature",
                          description: "Data import functionality will be available soon.",
                        });
                      }}
                      data-testid="button-import-data"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Actions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => {
                        toast({
                          title: "Account deletion",
                          description: "This feature will be available soon. Please contact support for account deletion.",
                        });
                      }}
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Save Button - Always Visible */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  settingsForm.reset();
                  refetch();
                }}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-cancel-settings"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}