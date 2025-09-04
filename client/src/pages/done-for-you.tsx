import { Users, Phone, Calendar, Heart, CheckCircle, Clock, Star, ArrowRight, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function DoneForYou() {
  const services = [
    {
      icon: Phone,
      title: "Personal Memory Interview",
      description: "Our certified specialists conduct gentle, one-on-one interviews to gather your loved one's memories.",
      duration: "2-3 hours",
      included: ["Professional interviewer", "Audio recording", "Transcription", "Memory organization"]
    },
    {
      icon: Users,
      title: "Family Coordination Service",
      description: "We manage the entire family engagement process, ensuring everyone can contribute their memories.",
      duration: "1-2 weeks",
      included: ["Family outreach", "Memory collection", "Conflict resolution", "Progress updates"]
    },
    {
      icon: Heart,
      title: "Full Persona Creation",
      description: "Our team handles everything from memory collection to persona testing and refinement.",
      duration: "2-4 weeks",
      included: ["Memory gathering", "Persona development", "Quality testing", "Family approval"]
    },
    {
      icon: Headphones,
      title: "Ongoing Support & Updates",
      description: "Continuous support for updates, family additions, and technical assistance.",
      duration: "Ongoing",
      included: ["Monthly check-ins", "Update assistance", "Technical support", "Memory additions"]
    }
  ];

  const packages = [
    {
      name: "Essential Package",
      price: "$2,999",
      description: "Perfect for individuals who want professional help creating their first persona",
      features: [
        "2-hour memory interview",
        "Basic persona creation",
        "1 month of support",
        "Email assistance",
        "Basic quality assurance"
      ],
      popular: false
    },
    {
      name: "Family Package",
      price: "$4,999",
      description: "Comprehensive service for families wanting to create a rich, collaborative memory",
      features: [
        "Up to 5 family interviews",
        "Family coordination service",
        "Advanced persona creation",
        "3 months of support",
        "Phone & email assistance",
        "Premium quality assurance",
        "Family review sessions"
      ],
      popular: true
    },
    {
      name: "Legacy Package",
      price: "$7,999",
      description: "Complete white-glove service for creating the most comprehensive digital memory",
      features: [
        "Unlimited family interviews",
        "Professional video sessions",
        "Premium persona creation",
        "6 months of support",
        "Dedicated specialist",
        "Priority assistance",
        "Legacy documentation",
        "Memorial website creation"
      ],
      popular: false
    }
  ];

  const specialists = [
    {
      name: "Dr. Sarah Chen",
      title: "Senior Memory Specialist",
      credentials: "PhD in Psychology, Grief Counseling Certified",
      experience: "12 years experience in family therapy and memory preservation",
      specialties: ["Family dynamics", "Grief counseling", "Memory psychology"]
    },
    {
      name: "Michael Rodriguez",
      title: "Technology Integration Specialist", 
      credentials: "MS Computer Science, AI Ethics Certified",
      experience: "8 years in AI development and human-computer interaction",
      specialties: ["AI persona development", "Technology accessibility", "Quality assurance"]
    },
    {
      name: "Linda Williams",
      title: "Family Coordination Specialist",
      credentials: "MSW Social Work, Family Mediation Certified",
      experience: "15 years in family social work and mediation",
      specialties: ["Family mediation", "Communication facilitation", "Conflict resolution"]
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
              <Users className="w-3 h-3 mr-1" />
              Professional Service
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Done-For-You Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Let our certified specialists handle everything. From memory collection to persona creation, 
            we provide white-glove service for families who prefer professional assistance.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Certified specialists</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Grief-informed approach</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>100% satisfaction guarantee</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Schedule Free Consultation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Professional Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {service.title}
                        </h3>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 mb-3">
                          {service.duration}
                        </Badge>
                        <p className="text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">What's Included:</h4>
                      <ul className="space-y-2">
                        {service.included.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Service Packages
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 ${pkg.popular ? 'ring-2 ring-purple-300 scale-105' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    {pkg.popular && (
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className={`w-full ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-200 text-purple-700 hover:bg-purple-50'}`} variant={pkg.popular ? 'default' : 'outline'}>
                    {pkg.popular ? 'Get Started' : 'Learn More'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Meet Our Specialists */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Meet Our Certified Specialists
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {specialists.map((specialist, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg text-center">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {specialist.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {specialist.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-2">
                    {specialist.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {specialist.credentials}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {specialist.experience}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Specialties:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {specialist.specialties.map((specialty, specIndex) => (
                        <Badge key={specIndex} variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process Timeline */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How Our Process Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Consultation</h3>
                <p className="text-sm text-gray-600">Free 30-minute call to understand your needs and recommend the best approach.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Memory Collection</h3>
                <p className="text-sm text-gray-600">Our specialists conduct interviews and coordinate with your family to gather memories.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Persona Creation</h3>
                <p className="text-sm text-gray-600">We develop and refine the digital persona, testing for accuracy and authenticity.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery & Support</h3>
                <p className="text-sm text-gray-600">Your completed persona is delivered with training and ongoing support included.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guarantee */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-16">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              100% Satisfaction Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              We're so confident in our service that we offer a complete satisfaction guarantee. 
              If you're not completely happy with your persona, we'll work with you until it's perfect 
              or provide a full refund.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-green-800">
              <div>
                <h4 className="font-semibold mb-2">Unlimited Revisions</h4>
                <p className="text-sm">We'll refine your persona until it feels authentic</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">30-Day Review Period</h4>
                <p className="text-sm">Full month to test and request changes</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Money-Back Promise</h4>
                <p className="text-sm">Full refund if you're not satisfied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to discuss your needs and learn how our specialists 
            can help you create a beautiful digital memory of your loved one.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Free Consultation
            </Button>
            
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium">
              <Phone className="w-5 h-5 mr-2" />
              Call (555) 123-4567
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Free consultation • No obligation • Available 7 days a week
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}