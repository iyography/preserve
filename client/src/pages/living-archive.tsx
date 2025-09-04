import { useState } from "react";
import { Users, Heart, Clock, Globe, Share2, ArrowRight, ChevronLeft, CheckCircle, User, Mail, Building, Calendar, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LifePeriod {
  id: string;
  name: string;
  years: string;
  description: string;
}

const lifePeriods: LifePeriod[] = [
  { id: 'childhood', name: 'Childhood', years: '0-12', description: 'Early years and formative experiences' },
  { id: 'adolescence', name: 'Adolescence', years: '13-18', description: 'School years and coming of age' },
  { id: 'young-adult', name: 'Young Adult', years: '19-30', description: 'Career start and early relationships' },
  { id: 'middle-years', name: 'Middle Years', years: '31-50', description: 'Career peak and family life' },
  { id: 'mature-years', name: 'Mature Years', years: '51-65', description: 'Wisdom years and mentoring' },
  { id: 'later-life', name: 'Later Life', years: '65+', description: 'Legacy and reflection years' }
];

export default function LivingArchive() {
  const [step, setStep] = useState<'intro' | 'foundation' | 'community-setup' | 'launch'>('intro');
  const [personaName, setPersonaName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profession, setProfession] = useState('');
  const [hometown, setHometown] = useState('');
  const [lifeMilestones, setLifeMilestones] = useState(['', '', '']);
  const [familyMembers, setFamilyMembers] = useState([{ name: '', email: '', relationship: '' }]);
  const [friends, setFriends] = useState([{ name: '', email: '', relationship: '' }]);
  const [colleagues, setColleagues] = useState([{ name: '', email: '', workplace: '' }]);
  const [communityMembers, setCommunityMembers] = useState([{ name: '', email: '', connection: '' }]);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const progress = step === 'intro' ? 25 : step === 'foundation' ? 50 : step === 'community-setup' ? 75 : 100;

  const handleNext = () => {
    if (step === 'intro') setStep('foundation');
    else if (step === 'foundation') {
      if (!personaName || !birthYear || !profession || !hometown) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required foundation information."
        });
        return;
      }
      setStep('community-setup');
    }
    else if (step === 'community-setup') setStep('launch');
    else {
      // Complete the archive setup
      toast({
        title: "Living Archive Created!",
        description: `${personaName}'s comprehensive life archive is ready. Community invitations are being sent.`
      });
      setLocation('/dashboard');
    }
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...lifeMilestones];
    newMilestones[index] = value;
    setLifeMilestones(newMilestones);
  };

  const addCommunityMember = (type: 'family' | 'friends' | 'colleagues' | 'community') => {
    if (type === 'family') {
      setFamilyMembers([...familyMembers, { name: '', email: '', relationship: '' }]);
    } else if (type === 'friends') {
      setFriends([...friends, { name: '', email: '', relationship: '' }]);
    } else if (type === 'colleagues') {
      setColleagues([...colleagues, { name: '', email: '', workplace: '' }]);
    } else {
      setCommunityMembers([...communityMembers, { name: '', email: '', connection: '' }]);
    }
  };

  const updateCommunityMember = (type: 'family' | 'friends' | 'colleagues' | 'community', index: number, field: string, value: string) => {
    if (type === 'family') {
      const updated = [...familyMembers];
      updated[index] = { ...updated[index], [field]: value };
      setFamilyMembers(updated);
    } else if (type === 'friends') {
      const updated = [...friends];
      updated[index] = { ...updated[index], [field]: value };
      setFriends(updated);
    } else if (type === 'colleagues') {
      const updated = [...colleagues];
      updated[index] = { ...updated[index], [field]: value };
      setColleagues(updated);
    } else {
      const updated = [...communityMembers];
      updated[index] = { ...updated[index], [field]: value };
      setCommunityMembers(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 bg-blue-300 rounded-full opacity-60"></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">∞</span>
              </div>
              <span className="text-gray-900 font-semibold text-lg">Preserving Connections</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                Living Archive Builder
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Community-Powered Life Documentation</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step 1: Introduction */}
        {step === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Living Archive Builder</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
                Create a comprehensive life documentation with contributions from extended family, friends, 
                colleagues, and community members. Build the complete story of who they were.
              </p>
              <p className="text-lg text-blue-700 font-medium">
                15 minutes to establish the foundation—then it grows organically with community participation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-8 h-8 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Comprehensive Coverage</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Professional life integration</li>
                    <li>• Community role documentation</li>
                    <li>• Childhood friends and stories</li>
                    <li>• Cultural and historical context</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Share2 className="w-8 h-8 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Crowdsourced Validation</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Multiple perspectives confirm memories</li>
                    <li>• Weighted trust system by relationship</li>
                    <li>• AI identifies inconsistencies for resolution</li>
                    <li>• Family moderator approves content</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Who Can Contribute</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Family & Friends:</strong></p>
                    <p>Personal memories and relationships</p>
                  </div>
                  <div>
                    <p><strong>Colleagues:</strong></p>
                    <p>Professional impact and work stories</p>
                  </div>
                  <div>
                    <p><strong>Community:</strong></p>
                    <p>Neighbors, volunteers, local impact</p>
                  </div>
                  <div>
                    <p><strong>Students/Clients:</strong></p>
                    <p>Those they mentored or served</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleNext}
              size="lg" 
              className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg px-8"
              data-testid="button-start-archive"
            >
              Build Their Archive
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Archive Foundation */}
        {step === 'foundation' && (
          <div className="space-y-8">
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-blue-600" />
                  <span>Archive Foundation</span>
                  <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="w-3 h-3 mr-1" />
                    15 minutes
                  </Badge>
                </CardTitle>
                <p className="text-gray-600">
                  Establish the framework that will guide community contributions.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="personaName" className="text-sm font-medium text-gray-700">Full name</Label>
                    <Input
                      id="personaName"
                      placeholder="Their full name"
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-persona-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthYear" className="text-sm font-medium text-gray-700">Birth year</Label>
                    <Input
                      id="birthYear"
                      placeholder="e.g., 1945"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-birth-year"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-sm font-medium text-gray-700">Primary profession/role</Label>
                    <Input
                      id="profession"
                      placeholder="e.g., teacher, engineer, homemaker"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-profession"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hometown" className="text-sm font-medium text-gray-700">Hometown/primary location</Label>
                    <Input
                      id="hometown"
                      placeholder="Where they lived most of their life"
                      value={hometown}
                      onChange={(e) => setHometown(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-hometown"
                    />
                  </div>
                </div>

                {/* Life Timeline with Major Milestones */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Life Timeline with Major Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lifePeriods.map((period) => (
                      <div key={period.id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h5 className="font-medium text-blue-900">{period.name}</h5>
                        <p className="text-xs text-blue-600 mb-2">{period.years} years • {period.description}</p>
                        <Button variant="outline" size="sm" className="w-full text-xs border-blue-200 text-blue-600">
                          Add Milestones
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Life Milestones */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Three most significant life milestones</Label>
                  <p className="text-xs text-gray-500 mb-3">Major achievements, life events, or turning points</p>
                  <div className="space-y-3">
                    {lifeMilestones.map((milestone, index) => (
                      <Input
                        key={index}
                        placeholder={`Milestone ${index + 1} (e.g., graduated college, started family business, became grandparent)`}
                        value={milestone}
                        onChange={(e) => updateMilestone(index, e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                        data-testid={`input-milestone-${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Link href="/onboarding">
                    <Button variant="outline" className="px-6">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6"
                    data-testid="button-setup-community"
                  >
                    Set Up Community
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Community Invitation Campaign */}
        {step === 'community-setup' && (
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Share2 className="w-6 h-6 text-blue-600" />
                  <span>Community Invitation Campaign</span>
                </CardTitle>
                <p className="text-gray-600">
                  Identify and invite the network of people who knew {personaName} in different contexts.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Family Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span>Family Members</span>
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addCommunityMember('family')}
                      className="border-blue-200 text-blue-600"
                    >
                      Add Family Member
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {familyMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateCommunityMember('family', index, 'name', e.target.value)}
                          className="border-red-200 focus:border-red-400"
                        />
                        <Input
                          placeholder="Email"
                          value={member.email}
                          onChange={(e) => updateCommunityMember('family', index, 'email', e.target.value)}
                          className="border-red-200 focus:border-red-400"
                        />
                        <Input
                          placeholder="Relationship (e.g., daughter, brother)"
                          value={member.relationship}
                          onChange={(e) => updateCommunityMember('family', index, 'relationship', e.target.value)}
                          className="border-red-200 focus:border-red-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Friends */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5 text-green-500" />
                      <span>Friends</span>
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addCommunityMember('friends')}
                      className="border-blue-200 text-blue-600"
                    >
                      Add Friend
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {friends.map((friend, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Input
                          placeholder="Name"
                          value={friend.name}
                          onChange={(e) => updateCommunityMember('friends', index, 'name', e.target.value)}
                          className="border-green-200 focus:border-green-400"
                        />
                        <Input
                          placeholder="Email"
                          value={friend.email}
                          onChange={(e) => updateCommunityMember('friends', index, 'email', e.target.value)}
                          className="border-green-200 focus:border-green-400"
                        />
                        <Input
                          placeholder="How they knew each other"
                          value={friend.relationship}
                          onChange={(e) => updateCommunityMember('friends', index, 'relationship', e.target.value)}
                          className="border-green-200 focus:border-green-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colleagues */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      <span>Colleagues & Professional Contacts</span>
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addCommunityMember('colleagues')}
                      className="border-blue-200 text-blue-600"
                    >
                      Add Colleague
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {colleagues.map((colleague, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Input
                          placeholder="Name"
                          value={colleague.name}
                          onChange={(e) => updateCommunityMember('colleagues', index, 'name', e.target.value)}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        <Input
                          placeholder="Email"
                          value={colleague.email}
                          onChange={(e) => updateCommunityMember('colleagues', index, 'email', e.target.value)}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        <Input
                          placeholder="Workplace/Organization"
                          value={colleague.workplace}
                          onChange={(e) => updateCommunityMember('colleagues', index, 'workplace', e.target.value)}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-purple-500" />
                      <span>Community Members</span>
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addCommunityMember('community')}
                      className="border-blue-200 text-blue-600"
                    >
                      Add Community Member
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Neighbors, volunteers, students, clients, church members, etc.</p>
                  <div className="space-y-3">
                    {communityMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateCommunityMember('community', index, 'name', e.target.value)}
                          className="border-purple-200 focus:border-purple-400"
                        />
                        <Input
                          placeholder="Email"
                          value={member.email}
                          onChange={(e) => updateCommunityMember('community', index, 'email', e.target.value)}
                          className="border-purple-200 focus:border-purple-400"
                        />
                        <Input
                          placeholder="Connection (e.g., neighbor, student, volunteer)"
                          value={member.connection}
                          onChange={(e) => updateCommunityMember('community', index, 'connection', e.target.value)}
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('foundation')}
                    className="px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6"
                    data-testid="button-launch-archive"
                  >
                    Launch Archive
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Archive Launch */}
        {step === 'launch' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Living Archive Created!</h3>
                <p className="text-gray-600 mb-6">
                  {personaName}'s comprehensive life archive is now established. 
                  Community invitations are being sent to gather the full spectrum of their impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Share2 className="w-6 h-6 text-blue-600" />
                  <span>What Happens Next</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Automated Outreach */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Automated Outreach System</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Email Invitations</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Personalized invitations with context about their relationship to {personaName}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Social Media Integration</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Shareable links for broader community reach
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contribution Types */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Expected Contributions</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-red-500" />
                        <span className="font-medium">From Family & Friends:</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Personal stories and relationships</li>
                        <li>• Voice messages and recordings</li>
                        <li>• Family photos and videos</li>
                        <li>• Holiday and celebration memories</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">From Colleagues:</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Professional accomplishments</li>
                        <li>• Work relationship stories</li>
                        <li>• Career impact and mentorship</li>
                        <li>• Industry contributions</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">From Community:</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Volunteer work and service</li>
                        <li>• Local impact stories</li>
                        <li>• Community leadership roles</li>
                        <li>• Cultural and historical context</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">From Students/Clients:</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Mentorship impact stories</li>
                        <li>• Life lessons learned</li>
                        <li>• Professional guidance received</li>
                        <li>• Inspiration and influence</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Memory Validation Process */}
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-3">Crowdsourced Memory Validation</h4>
                  <div className="space-y-3 text-sm text-indigo-700">
                    <p>• <strong>Multiple Confirmation:</strong> Important memories will be confirmed by multiple contributors</p>
                    <p>• <strong>Trust Weighting:</strong> Closer relationships have higher trust scores for validation</p>
                    <p>• <strong>AI Consistency Check:</strong> Automated detection of conflicting information for review</p>
                    <p>• <strong>Family Moderation:</strong> You approve all content before it becomes part of the archive</p>
                  </div>
                </div>

                {/* Archive Evolution */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Archive Evolution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Anniversary Memory Drives</span>
                      <span className="text-sm text-gray-500">- Special collection events on meaningful dates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Milestone Celebrations</span>
                      <span className="text-sm text-gray-500">- Recognition when archive reaches completion milestones</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Community Events</span>
                      <span className="text-sm text-gray-500">- Virtual storytelling gatherings and memorial celebrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Legacy Projects</span>
                      <span className="text-sm text-gray-500">- Scholarships, memorials, and charitable initiatives coordination</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('community-setup')}
                    className="px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6"
                    data-testid="button-complete-archive"
                  >
                    Enter Archive Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}