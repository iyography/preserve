import { useState } from 'react';
import { Building, Heart, Shield, CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

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
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  relationshipToDeceased: string;
  timeSinceLoss: string;
  technologyComfort: string;
  feedbackCommitment: boolean;
  monthlyCheckIns: boolean;
  professionalSupport: string;
  caseStudyConsent: boolean;
  additionalInfo: string;
}

export default function Waitlist() {
  const [showForms, setShowForms] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'partner' | 'family'>('partner');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const partnerForm = useForm<PartnerFormData>();
  const userForm = useForm<UserFormData>();

  const handlePartnerSubmit = (data: PartnerFormData) => {
    console.log('Partner application:', data);
    toast({
      title: "Application Submitted",
      description: "Thank you for your interest in partnering with us. We'll be in touch within 48 hours.",
    });
    setSubmitted(true);
  };

  const handleUserSubmit = (data: UserFormData) => {
    console.log('User application:', data);
    toast({
      title: "Application Submitted", 
      description: "Thank you for your interest. We'll review your application and contact you soon.",
    });
    setSubmitted(true);
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
                    <li className="flex items-center"><Clock className="w-4 h-4 mr-3 flex-shrink-0" />6-month exclusive access</li>
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
                  <h3 className="text-2xl font-bold text-white mb-4">Family Feedback</h3>
                  <p className="text-purple-100 text-lg mb-6">
                    Families who have experienced loss and want to help us build something meaningful
                  </p>
                  <ul className="text-left text-purple-200 space-y-2 text-sm mb-6">
                    <li className="flex items-center"><Heart className="w-4 h-4 mr-3 flex-shrink-0" />Free platform access</li>
                    <li className="flex items-center"><Shield className="w-4 h-4 mr-3 flex-shrink-0" />Professional support available</li>
                    <li className="flex items-center"><Users className="w-4 h-4 mr-3 flex-shrink-0" />Shape the future of grief tech</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => handleTrackSelection('family')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-lg rounded-xl mt-auto"
                  data-testid="button-apply-family"
                >
                  Join as Family
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid md:grid-cols-3 gap-6 text-center items-start">
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Shield className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Emotional Safety First</h4>
                <p className="text-sm">Professional counselors review all applications</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Users className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Quality Over Quantity</h4>
                <p className="text-sm">Carefully selected participants for meaningful feedback</p>
              </div>
              <div className="text-purple-200 flex flex-col items-center h-full">
                <Heart className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Medical-Grade Process</h4>
                <p className="text-sm">Clinical trial-level consent and safety protocols</p>
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
            {selectedTrack === 'partner' ? 'Professional Partner Application' : 'Family Feedback Application'}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedTrack === 'partner' 
              ? 'Apply to become an exclusive launch partner with revenue sharing opportunities'
              : 'Join our selective feedback group to help shape the future of grief technology'
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
              <CardTitle className="text-2xl">Family Feedback Application</CardTitle>
              <CardDescription>
                This application is for families who have experienced loss and are interested in 
                helping us develop a platform that truly serves those who are grieving.
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

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="feedbackCommitment"
                      {...userForm.register('feedbackCommitment', { required: true })}
                      data-testid="checkbox-feedback-commitment"
                    />
                    <Label htmlFor="feedbackCommitment" className="text-sm">
                      I am willing to provide weekly feedback via email for 8 weeks *
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="monthlyCheckIns"
                      {...userForm.register('monthlyCheckIns', { required: true })}
                      data-testid="checkbox-monthly-checkins"
                    />
                    <Label htmlFor="monthlyCheckIns" className="text-sm">
                      I am available for 30-minute monthly video check-ins *
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="caseStudyConsent"
                      {...userForm.register('caseStudyConsent')}
                      data-testid="checkbox-case-study"
                    />
                    <Label htmlFor="caseStudyConsent" className="text-sm">
                      I consent to anonymized case study usage (optional)
                    </Label>
                  </div>
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
                  <h4 className="font-semibold text-indigo-800 mb-2">Professional Support Available</h4>
                  <p className="text-sm text-indigo-700">
                    Throughout the feedback program, you'll have access to licensed grief counselors. 
                    Your emotional well-being is our highest priority.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  data-testid="button-submit-user"
                >
                  Submit Family Application
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}