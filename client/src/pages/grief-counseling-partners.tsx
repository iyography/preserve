import { Heart, Users, Phone, Video, Calendar, Star, CheckCircle, Award, Shield, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function GriefCounselingPartners() {
  const counselors = [
    {
      name: "Dr. Sarah Rodriguez",
      credentials: "PhD, LMFT, Grief Counseling Specialist",
      location: "Available Nationwide (Telehealth)",
      specialties: ["Complicated Grief", "Family Therapy", "Digital Memory Integration", "Bereavement Support"],
      experience: "15 years",
      languages: ["English", "Spanish"],
      availability: "Monday-Friday, 9am-7pm EST",
      nextAvailable: "This week",
      rating: 4.9,
      reviews: 127,
      approach: "Integrative approach combining CBT, narrative therapy, and digital memory work to support healthy grieving."
    },
    {
      name: "Dr. Michael Chen",
      credentials: "PsyD, Licensed Clinical Psychologist",
      location: "West Coast & Telehealth", 
      specialties: ["Trauma & Loss", "PTSD", "Support Groups", "Men's Grief Issues"],
      experience: "12 years",
      languages: ["English", "Mandarin"],
      availability: "Tuesday-Saturday, 10am-8pm PST",
      nextAvailable: "Next week",
      rating: 4.8,
      reviews: 89,
      approach: "Evidence-based trauma therapy with specialized focus on grief-related PTSD and complicated bereavement."
    },
    {
      name: "Dr. Jennifer Williams",
      credentials: "MSW, LCSW, Thanatology Certified",
      location: "Eastern Seaboard & Telehealth",
      specialties: ["Child & Teen Grief", "Family Systems", "Suicide Loss", "Memory Work"],
      experience: "18 years",
      languages: ["English"],
      availability: "Monday-Thursday, 8am-6pm EST",
      nextAvailable: "Tomorrow",
      rating: 5.0,
      reviews: 203,
      approach: "Family-centered therapy helping children and families navigate loss together with age-appropriate interventions."
    },
    {
      name: "Dr. Lisa Thompson",
      credentials: "PhD, Licensed Marriage & Family Therapist",
      location: "Midwest & Telehealth",
      specialties: ["Anticipatory Grief", "Caregiver Support", "Chronic Illness", "End-of-Life Care"],
      experience: "20 years",
      languages: ["English"],
      availability: "Monday-Friday, 9am-5pm CST",
      nextAvailable: "Friday",
      rating: 4.9,
      reviews: 156,
      approach: "Supportive therapy for families facing terminal illness, helping with anticipatory grief and end-of-life planning."
    }
  ];

  const serviceTypes = [
    {
      icon: Video,
      title: "Individual Therapy",
      description: "One-on-one sessions focused on your specific grief journey and healing needs",
      duration: "50 minutes",
      frequency: "Weekly or bi-weekly",
      format: "Video, phone, or in-person"
    },
    {
      icon: Users,
      title: "Family Therapy",
      description: "Help your whole family navigate loss together and strengthen connections",
      duration: "60 minutes",
      frequency: "Weekly or monthly",
      format: "Video or in-person"
    },
    {
      icon: Heart,
      title: "Support Groups",
      description: "Connect with others who understand your experience in facilitated group settings",
      duration: "90 minutes",
      frequency: "Weekly",
      format: "Video or in-person"
    },
    {
      icon: Calendar,
      title: "Intensive Sessions",
      description: "Extended sessions for working through complex grief or trauma",
      duration: "2-3 hours",
      frequency: "As needed",
      format: "In-person preferred"
    }
  ];

  const specializations = [
    {
      category: "Types of Loss",
      areas: [
        "Sudden/unexpected death",
        "Suicide loss",
        "Death by overdose",
        "Infant/child loss",
        "Spouse/partner loss",
        "Parent loss",
        "Pet loss"
      ]
    },
    {
      category: "Grief Complications",
      areas: [
        "Complicated grief disorder",
        "Disenfranchised grief",
        "Anticipatory grief",
        "Traumatic grief",
        "Persistent complex bereavement",
        "Anniversary reactions"
      ]
    },
    {
      category: "Special Populations",
      areas: [
        "Children & adolescents",
        "LGBTQ+ individuals",
        "Military families",
        "Healthcare workers",
        "Caregivers",
        "Senior adults"
      ]
    },
    {
      category: "Therapeutic Approaches",
      areas: [
        "Cognitive Behavioral Therapy",
        "Narrative therapy",
        "EMDR for trauma",
        "Art/expressive therapy",
        "Mindfulness-based approaches",
        "Digital memory integration"
      ]
    }
  ];

  const getStartedSteps = [
    {
      step: 1,
      title: "Browse Counselors",
      description: "Review our network of grief-specialized therapists and their areas of expertise"
    },
    {
      step: 2,
      title: "Schedule Consultation",
      description: "Book a brief consultation call to ensure the therapist is a good fit"
    },
    {
      step: 3,
      title: "Begin Sessions",
      description: "Start your therapeutic journey with personalized grief support"
    },
    {
      step: 4,
      title: "Ongoing Support",
      description: "Continue sessions as needed with flexible scheduling and payment options"
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
              <Heart className="w-3 h-3 mr-1" />
              Grief Counseling Partners
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Grief Counseling Partners
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with licensed grief counselors and therapists who specialize in loss, bereavement, 
            and supporting families through their healing journey.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Licensed professionals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Grief specialists</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Compassionate care</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Find a Counselor
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Featured Counselors */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Featured Grief Counselors
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {counselors.map((counselor, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                        {counselor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {counselor.name}
                      </h3>
                      <p className="text-purple-600 font-medium mb-2">
                        {counselor.credentials}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{counselor.rating}</span>
                          <span>({counselor.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{counselor.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialties.map((specialty, specIndex) => (
                          <Badge key={specIndex} variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Experience:</span>
                        <p className="text-gray-600">{counselor.experience}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Languages:</span>
                        <p className="text-gray-600">{counselor.languages.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Availability:</span>
                        <p className="text-gray-600">{counselor.availability}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Next available:</span>
                        <p className="text-green-600 font-medium">{counselor.nextAvailable}</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Therapeutic Approach:</h4>
                      <p className="text-sm text-purple-800">{counselor.approach}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Session
                      </Button>
                      <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Video className="w-4 h-4 mr-2" />
                        Free Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Types of Grief Counseling Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {serviceTypes.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {service.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Duration:</span>
                            <p className="text-gray-600">{service.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Frequency:</span>
                            <p className="text-gray-600">{service.frequency}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-900">Format:</span>
                            <p className="text-gray-600">{service.format}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Areas of Specialization
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-center">{spec.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {spec.areas.map((area, areaIndex) => (
                      <li key={areaIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How to Get Started</CardTitle>
            <p className="text-gray-600 text-center">Simple steps to connect with the right grief counselor for you</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              {getStartedSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Pricing */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-16">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Insurance & Pricing Information
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Insurance Accepted</h4>
                <p className="text-sm text-gray-600 mb-4">Most major insurance plans accepted</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Aetna, Blue Cross Blue Shield</li>
                  <li>• Cigna, UnitedHealth</li>
                  <li>• Medicare, Medicaid</li>
                  <li>• Employee Assistance Programs</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Session Pricing</h4>
                <p className="text-sm text-gray-600 mb-4">Transparent, fair pricing for all services</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Individual: $120-180/session</li>
                  <li>• Family: $150-220/session</li>
                  <li>• Group: $40-60/session</li>
                  <li>• Sliding scale available</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Financial Support</h4>
                <p className="text-sm text-gray-600 mb-4">Making therapy accessible to all families</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Sliding scale fees</li>
                  <li>• Payment plans available</li>
                  <li>• Scholarship programs</li>
                  <li>• HSA/FSA accepted</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with a compassionate, licensed grief counselor who understands your journey 
            and can provide the support you need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Free Consultation
            </Button>
            
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium">
              <Phone className="w-5 h-5 mr-2" />
              Call (555) 123-4567
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Free 15-minute consultation • Evening & weekend appointments available • Telehealth options
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}