import { useState } from 'react';
import { Building, Heart, Shield, CheckCircle, Clock, Users, Archive, TreePine, Calendar, Brain, MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PartnerFormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  businessSize: string;
  currentGriefSupport: string;
  technologyComfort: string;
  revenueShareInterest: string;
  pilotCapacity: string;
  timeline: string;
  additionalInfo: string;
  ndaAgreed: boolean;
  botcheck?: string; // Honeypot field
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  relationshipToDeceased: string;
  timeSinceLoss: string;
  technologyComfort: string;
  professionalSupport: string;
  additionalInfo: string;
  botcheck?: string; // Honeypot field
}

export default function Waitlist() {
  const [showForms, setShowForms] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'partner' | 'family'>('partner');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const partnerForm = useForm<PartnerFormData>();
  const userForm = useForm<UserFormData>();

  const handlePartnerSubmit = async (data: PartnerFormData) => {
    try {
      // Add honeypot field
      const submitData = { ...data, botcheck: '' };
      
      const response = await apiRequest('POST', '/api/waitlist/partner', submitData);
      
      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: "Thank you for your interest in partnering with us. We'll be in touch within 48 hours.",
        });
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: errorData.message || "Too many submissions. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        // Handle validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          const firstError = errorData.details[0];
          toast({
            title: "Validation Error",
            description: firstError.message || "Please check your form data and try again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting partner application:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserSubmit = async (data: UserFormData) => {
    try {
      // Add honeypot field
      const submitData = { ...data, botcheck: '' };
      
      const response = await apiRequest('POST', '/api/waitlist/family', submitData);
      
      if (response.ok) {
        toast({
          title: "Application Submitted", 
          description: "Thank you for your interest. We'll review your application and contact you soon.",
        });
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: errorData.message || "Too many submissions. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        // Handle validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          const firstError = errorData.details[0];
          toast({
            title: "Validation Error",
            description: firstError.message || "Please check your form data and try again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting family application:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTrackSelection = (track: 'partner' | 'family') => {
    setSelectedTrack(track);
    setShowForms(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Interest</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your application has been submitted successfully. We'll be in touch soon.
            </p>
            <Button onClick={() => { setSubmitted(false); setShowForms(false); }} className="bg-purple-600 hover:bg-purple-700">
              Return to Waitlist
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Landing Screen - Beautiful flush design
  if (!showForms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-40 left-40 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Section */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Join the Future of 
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"> Grief Technology</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Be among the first to experience Preserving Connections. We're carefully selecting families and professional partners for our exclusive beta program.
            </p>

            {/* Call to Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Professional Partner CTA */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <div className="flex-grow">
                  <Building className="w-12 h-12 text-purple-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-4">Professional Partners</h3>
                  <p className="text-purple-100 text-lg mb-6">
                    Funeral directors, estate planners, hospice coordinators
                  </p>
                  <ul className="text-left text-purple-200 space-y-2 text-sm mb-6">
                    <li className="flex items-center"><Clock className="w-4 h-4 mr-3 flex-shrink-0" />Priority early access</li>
                    <li className="flex items-center"><Shield className="w-4 h-4 mr-3 flex-shrink-0" />Revenue sharing opportunity</li>
                    <li className="flex items-center"><Users className="w-4 h-4 mr-3 flex-shrink-0" />Co-development partnership</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => handleTrackSelection('partner')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 text-lg rounded-xl mt-auto"
                  data-testid="button-apply-partner"
                >
                  Apply as Partner
                </Button>
              </div>

              {/* Family Feedback CTA */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <div className="flex-grow">
                  <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-4">Join the Waitlist</h3>
                  <p className="text-purple-100 text-lg mb-6">
                    Families ready to experience the future of preserving connections and memories
                  </p>
                  <ul className="text-left text-purple-200 space-y-2 text-sm mb-6">
                    <li className="flex items-center"><Heart className="w-4 h-4 mr-3 flex-shrink-0" />Early platform access</li>
                    <li className="flex items-center"><Shield className="w-4 h-4 mr-3 flex-shrink-0" />Professional support available</li>
                    <li className="flex items-center"><Users className="w-4 h-4 mr-3 flex-shrink-0" />Help us perfect the experience</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => handleTrackSelection('family')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-lg rounded-xl mt-auto"
                  data-testid="button-apply-family"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>

            {/* Platform Benefits */}
            <div className="grid md:grid-cols-3 gap-6 text-center items-start">
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Archive className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Legacy That Lives On</h4>
                <p className="text-sm">Families aren't just storing files, they're building a living archive of advice, stories, and values.</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <TreePine className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Family Continuity Across Generations</h4>
                <p className="text-sm">PC isn't about grief alone — it's about helping kids, grandkids, and even future great-grandkids know who their family was.</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Calendar className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Ritualized Presence</h4>
                <p className="text-sm">PC surfaces memories on birthdays, anniversaries, and milestones → making loved ones "present" when it matters most.</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Brain className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">AI-Organized Wisdom</h4>
                <p className="text-sm">Instead of random videos or voice notes, PC structures memories into themes and guidance (work advice, recipes, faith lessons, etc.).</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Optional AI Conversations</h4>
                <p className="text-sm">For those who want it, PC offers the chance to "ask" a loved one how they might have responded, based on their words and stories.</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Lock className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Security & Ownership (Trust Factor)</h4>
                <p className="text-sm">Families own their vault. Encrypted, private, and never sold.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forms Section - Only shown after CTA click
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setShowForms(false)}
            className="text-purple-600 hover:text-purple-700"
            data-testid="button-back-to-landing"
          >
            ← Back to Main Page
          </Button>
        </div>

        {/* Form Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedTrack === 'partner' ? 'Professional Partner Application' : 'Join the Waitlist'}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedTrack === 'partner' 
              ? 'Apply to become an exclusive launch partner with revenue sharing opportunities'
              : 'Join our waitlist to be among the first to experience Preserving Connections'
            }
          </p>
        </div>

        {/* Partner Form */}
        {selectedTrack === 'partner' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Professional Partner Application</CardTitle>
              <CardDescription>
                This application is for funeral directors, estate planners, hospice coordinators, 
                and elder care facilities interested in offering Preserving Connections to their clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={partnerForm.handleSubmit(handlePartnerSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input 
                      id="businessName"
                      {...partnerForm.register('businessName', { required: true })}
                      data-testid="input-business-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input 
                      id="contactName"
                      {...partnerForm.register('contactName', { required: true })}
                      data-testid="input-contact-name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      {...partnerForm.register('email', { required: true })}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone"
                      {...partnerForm.register('phone', { required: true })}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select onValueChange={(value) => partnerForm.setValue('businessType', value)}>
                      <SelectTrigger data-testid="select-business-type">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funeral-home">Funeral Home</SelectItem>
                        <SelectItem value="estate-planning">Estate Planning</SelectItem>
                        <SelectItem value="hospice">Hospice Care</SelectItem>
                        <SelectItem value="elder-care">Elder Care Facility</SelectItem>
                        <SelectItem value="other">Other Professional Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="businessSize">Business Size *</Label>
                    <Select onValueChange={(value) => partnerForm.setValue('businessSize', value)}>
                      <SelectTrigger data-testid="select-business-size">
                        <SelectValue placeholder="Select business size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo Practice</SelectItem>
                        <SelectItem value="small">Small (2-10 employees)</SelectItem>
                        <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                        <SelectItem value="large">Large (50+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentGriefSupport">Current Grief Support Offerings</Label>
                  <Textarea 
                    id="currentGriefSupport"
                    placeholder="Describe any grief support services you currently offer to families"
                    {...partnerForm.register('currentGriefSupport')}
                    data-testid="textarea-grief-support"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="technologyComfort">Technology Comfort Level *</Label>
                    <Select onValueChange={(value) => partnerForm.setValue('technologyComfort', value)}>
                      <SelectTrigger data-testid="select-tech-comfort">
                        <SelectValue placeholder="Select comfort level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pilotCapacity">Pilot Program Capacity *</Label>
                    <Select onValueChange={(value) => partnerForm.setValue('pilotCapacity', value)}>
                      <SelectTrigger data-testid="select-pilot-capacity">
                        <SelectValue placeholder="How many families can you test with?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 families</SelectItem>
                        <SelectItem value="6-15">6-15 families</SelectItem>
                        <SelectItem value="16-30">16-30 families</SelectItem>
                        <SelectItem value="30+">30+ families</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea 
                    id="additionalInfo"
                    placeholder="Any additional information about your interest in partnering with us"
                    {...partnerForm.register('additionalInfo')}
                    data-testid="textarea-additional-info"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ndaAgreed"
                    {...partnerForm.register('ndaAgreed', { required: true })}
                    data-testid="checkbox-nda"
                  />
                  <Label htmlFor="ndaAgreed" className="text-sm">
                    I agree to sign an NDA before accessing platform details and demos *
                  </Label>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Next Steps</h4>
                  <p className="text-sm text-purple-700">
                    After submitting your application, our team will review it and contact you within 48 hours. 
                    Qualified partners will receive an NDA for signature and access to our white-label demo.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-submit-partner"
                >
                  Submit Partner Application
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Family Form */}
        {selectedTrack === 'family' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
              <CardDescription>
                Join our waitlist to be among the first families to experience Preserving Connections 
                when we launch our platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-amber-600 mr-2" />
                  <h4 className="font-semibold text-amber-800">Emotional Safety Notice</h4>
                </div>
                <p className="text-sm text-amber-700">
                  We prioritize your emotional well-being. This program is designed for those who are 
                  at least 6 months past their loss and have professional support systems in place.
                </p>
              </div>

              <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Your Name *</Label>
                    <Input 
                      id="userName"
                      {...userForm.register('name', { required: true })}
                      data-testid="input-user-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email Address *</Label>
                    <Input 
                      id="userEmail"
                      type="email"
                      {...userForm.register('email', { required: true })}
                      data-testid="input-user-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="userPhone">Phone Number (Optional)</Label>
                  <Input 
                    id="userPhone"
                    {...userForm.register('phone')}
                    data-testid="input-user-phone"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relationshipToDeceased">Relationship to Deceased Person *</Label>
                    <Select onValueChange={(value) => userForm.setValue('relationshipToDeceased', value)}>
                      <SelectTrigger data-testid="select-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="friend">Close Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeSinceLoss">Time Since Loss *</Label>
                    <Select onValueChange={(value) => userForm.setValue('timeSinceLoss', value)}>
                      <SelectTrigger data-testid="select-time-since-loss">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-12-months">6-12 months</SelectItem>
                        <SelectItem value="1-2-years">1-2 years</SelectItem>
                        <SelectItem value="2-5-years">2-5 years</SelectItem>
                        <SelectItem value="5-plus-years">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="userTechnologyComfort">Technology Comfort Level *</Label>
                  <Select onValueChange={(value) => userForm.setValue('technologyComfort', value)}>
                    <SelectTrigger data-testid="select-user-tech-comfort">
                      <SelectValue placeholder="Select comfort level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (email, basic apps)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (social media, online shopping)</SelectItem>
                      <SelectItem value="advanced">Advanced (comfortable with new technology)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="professionalSupport">Current Professional Support *</Label>
                  <Select onValueChange={(value) => userForm.setValue('professionalSupport', value)}>
                    <SelectTrigger data-testid="select-professional-support">
                      <SelectValue placeholder="Select support type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapist">Working with therapist/counselor</SelectItem>
                      <SelectItem value="support-group">Attending support group</SelectItem>
                      <SelectItem value="both">Both therapist and support group</SelectItem>
                      <SelectItem value="none">No formal support currently</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <Label htmlFor="userAdditionalInfo">Additional Information</Label>
                  <Textarea 
                    id="userAdditionalInfo"
                    placeholder="Anything else you'd like us to know about your experience or interest in this platform"
                    {...userForm.register('additionalInfo')}
                    data-testid="textarea-user-additional-info"
                  />
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">What to Expect</h4>
                  <p className="text-sm text-indigo-700">
                    After joining our waitlist, we'll keep you informed about our launch timeline and 
                    be in touch when early access becomes available.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  data-testid="button-submit-user"
                >
                  Join Waitlist
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}