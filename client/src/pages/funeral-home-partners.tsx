import { Building, Handshake, Heart, Users, Phone, Mail, MapPin, Star, CheckCircle, ArrowRight, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function FuneralHomePartners() {
  const partnerPrograms = [
    {
      name: "Certified Partner Program",
      description: "Full training and certification for funeral directors to offer digital memory services",
      benefits: [
        "Comprehensive staff training",
        "Marketing materials provided",
        "Dedicated support team",
        "Revenue sharing model",
        "Professional certification"
      ],
      ideal: "Established funeral homes ready to expand digital services"
    },
    {
      name: "Referral Partner Program", 
      description: "Simple referral program for funeral homes to recommend our services to families",
      benefits: [
        "Easy referral process",
        "Family introduction materials",
        "Referral compensation",
        "No technical requirements",
        "Minimal time commitment"
      ],
      ideal: "Funeral homes wanting to offer additional support without direct service"
    },
    {
      name: "White Label Partnership",
      description: "Fully branded solution allowing funeral homes to offer services under their own brand",
      benefits: [
        "Complete brand customization",
        "Your funeral home branding",
        "Direct customer relationship",
        "Premium revenue model",
        "Exclusive territory rights"
      ],
      ideal: "Large funeral home chains or those with strong digital presence"
    }
  ];

  const currentPartners = [
    {
      name: "Heritage Memorial Services",
      location: "Portland, Oregon",
      yearsPartner: 3,
      families: 150,
      testimonial: "Preserving Connections has transformed how we support grieving families. The digital memory service provides ongoing comfort beyond the funeral service."
    },
    {
      name: "Sunset Valley Funeral Home",
      location: "Austin, Texas", 
      yearsPartner: 2,
      families: 89,
      testimonial: "Our families appreciate the thoughtful approach to digital memory preservation. It's become an essential part of our services."
    },
    {
      name: "Garden of Peace Memorial",
      location: "Denver, Colorado",
      yearsPartner: 4,
      families: 210,
      testimonial: "The partnership has allowed us to offer something truly meaningful - a way for families to stay connected with their loved ones."
    }
  ];

  const supportServices = [
    {
      icon: Users,
      title: "Staff Training Program",
      description: "Comprehensive training for funeral directors and staff on grief-informed digital memory services"
    },
    {
      icon: Heart,
      title: "Family Support Materials",
      description: "Professionally designed brochures, guides, and materials to help families understand the service"
    },
    {
      icon: Phone,
      title: "24/7 Partner Support",
      description: "Dedicated support line for funeral home staff to get immediate assistance with any questions"
    },
    {
      icon: Shield,
      title: "Compliance & Ethics",
      description: "Full compliance with funeral industry regulations and ethical guidelines for digital services"
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
              <Building className="w-3 h-3 mr-1" />
              Funeral Home Partners
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Funeral Home Partners
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Partner with us to offer families a meaningful way to preserve their loved one's memory 
            beyond the funeral service. Expand your care and support into the digital age.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Handshake className="w-4 h-4 text-purple-600" />
              <span>Trusted by 50+ funeral homes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Industry certified program</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Family-focused approach</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Become a Partner
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Partnership Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partnership Programs
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {partnerPrograms.map((program, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{program.name}</CardTitle>
                  <p className="text-gray-600 text-center">{program.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Program Benefits:</h4>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Ideal For:</h4>
                    <p className="text-sm text-purple-800">{program.ideal}</p>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Partners */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Trusted Partners
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {currentPartners.map((partner, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {partner.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{partner.location}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{partner.yearsPartner}</div>
                        <div className="text-xs text-gray-500">Years Partner</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{partner.families}</div>
                        <div className="text-xs text-gray-500">Families Served</div>
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-sm text-gray-600 italic text-center">
                    "{partner.testimonial}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partner Support Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {supportServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Partnership Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-16">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Why Partner with Preserving Connections?
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  $
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Additional Revenue</h4>
                <p className="text-sm text-gray-600">Generate new income streams while providing valuable services to families</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  +
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Extended Care</h4>
                <p className="text-sm text-gray-600">Support families beyond the funeral service with ongoing comfort</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  ★
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Competitive Edge</h4>
                <p className="text-sm text-gray-600">Differentiate your funeral home with innovative digital memory services</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  ♥
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Meaningful Impact</h4>
                <p className="text-sm text-gray-600">Help families preserve precious memories and continue relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Getting Started is Simple</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Initial Consultation</h3>
                <p className="text-sm text-gray-600">Discuss your needs and choose the right partnership program</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Agreement & Training</h3>
                <p className="text-sm text-gray-600">Sign partnership agreement and complete staff training program</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Launch & Marketing</h3>
                <p className="text-sm text-gray-600">Launch services with our marketing materials and support</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ongoing Support</h3>
                <p className="text-sm text-gray-600">Receive continuous support and training for your team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our network of funeral home partners and start offering meaningful digital memory 
            services to the families you serve.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600">(555) 123-4567</p>
                <p className="text-sm text-gray-500">Monday - Friday, 8am - 6pm EST</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">partners@preservingconnections.app</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Building className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Partnership Portal</h3>
                <p className="text-gray-600">Schedule consultation</p>
                <p className="text-sm text-gray-500">Online application available</p>
              </CardContent>
            </Card>
          </div>
          
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Apply to Become a Partner
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}