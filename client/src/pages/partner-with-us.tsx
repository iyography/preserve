import { Handshake, Building, Heart, Users, Award, TrendingUp, CheckCircle, ArrowRight, Mail, Phone, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";

export default function PartnerWithUs() {
  const [partnershipType, setPartnershipType] = useState("");

  const partnershipTypes = [
    {
      icon: Building,
      title: "Funeral Home Partnership",
      description: "Integrate digital memory services into your funeral home offerings",
      benefits: [
        "Additional service offerings",
        "Enhanced family support",
        "Differentiation from competitors",
        "Ongoing family relationships"
      ],
      requirements: ["Licensed funeral director", "Established business", "Commitment to training", "Family-focused approach"]
    },
    {
      icon: Heart,
      title: "Healthcare Partnership", 
      description: "Bring memory preservation to hospice, elder care, and healthcare settings",
      benefits: [
        "Therapeutic programming enhancement",
        "Family engagement tools",
        "Quality of life improvement",
        "Grief support resources"
      ],
      requirements: ["Healthcare facility", "Patient/family focus", "Staff training availability", "Commitment to care quality"]
    },
    {
      icon: Users,
      title: "Technology Partnership",
      description: "Integrate our AI and memory preservation technology into your platform",
      benefits: [
        "Advanced AI capabilities",
        "Proven technology stack",
        "Comprehensive API access",
        "Co-development opportunities"
      ],
      requirements: ["Technology company", "Complementary services", "Technical integration capability", "Aligned values"]
    },
    {
      icon: Award,
      title: "Professional Services",
      description: "Become a certified provider of our Done-For-You services",
      benefits: [
        "Certified specialist status",
        "Training and certification",
        "Referral network access",
        "Premium service opportunities"
      ],
      requirements: ["Relevant professional background", "Grief counseling experience", "Client service excellence", "Certification completion"]
    }
  ];

  const partnerBenefits = [
    {
      category: "Growth Opportunities",
      benefits: [
        "Multiple partnership models",
        "Subscription and per-service options",
        "Performance-based opportunities",
        "Exclusive territory access"
      ]
    },
    {
      category: "Training & Support",
      benefits: [
        "Comprehensive partner training programs",
        "Ongoing education and certification",
        "24/7 technical and customer support",
        "Marketing materials and resources"
      ]
    },
    {
      category: "Technology Access",
      benefits: [
        "State-of-the-art AI technology",
        "Regular platform updates and improvements",
        "Integration support and APIs",
        "Data analytics and insights"
      ]
    },
    {
      category: "Mission Alignment",
      benefits: [
        "Join a meaningful, purpose-driven mission",
        "Make a real difference in families' lives",
        "Build lasting community relationships",
        "Contribute to grief support innovation"
      ]
    }
  ];

  const partnershipProcess = [
    {
      step: 1,
      title: "Initial Application",
      description: "Submit your partnership interest and background information",
      duration: "5-10 minutes"
    },
    {
      step: 2,
      title: "Discovery Call",
      description: "Discuss your needs, goals, and how we can work together",
      duration: "30-45 minutes"
    },
    {
      step: 3,
      title: "Partnership Proposal",
      description: "Receive a customized partnership proposal and agreement",
      duration: "1-2 weeks"
    },
    {
      step: 4,
      title: "Onboarding & Training",
      description: "Complete training program and begin offering services",
      duration: "2-4 weeks"
    }
  ];

  const successStories = [
    {
      partner: "Heritage Memorial Services",
      type: "Funeral Home",
      location: "Portland, Oregon",
      results: [
        "150+ families served in first year",
        "25% increase in family satisfaction",
        "Significant business growth",
        "Expanded into 3 additional locations"
      ]
    },
    {
      partner: "Sunrise Elder Care",
      type: "Healthcare Facility",
      location: "Austin, Texas",
      results: [
        "Enhanced family engagement by 85%",
        "Improved resident mood and participation",
        "Recognition for innovation in care",
        "Expanded to sister facilities"
      ]
    },
    {
      partner: "TechCare Solutions",
      type: "Technology Partner",
      location: "Denver, Colorado",
      results: [
        "Successful API integration",
        "30% increase in platform value",
        "Joint product development",
        "Expanded market reach"
      ]
    }
  ];

  const requirements = [
    {
      category: "General Requirements",
      items: [
        "Commitment to our mission and values",
        "High standards of professional service",
        "Willingness to complete training programs",
        "Dedication to family-centered care"
      ]
    },
    {
      category: "Business Requirements",
      items: [
        "Established business or professional practice",
        "Good standing in your industry",
        "Financial stability and growth mindset",
        "Commitment to ethical business practices"
      ]
    },
    {
      category: "Service Standards",
      items: [
        "Compassionate, grief-informed approach",
        "Respect for privacy and dignity",
        "Continuous improvement mindset",
        "Collaborative working relationship"
      ]
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
              <Handshake className="w-3 h-3 mr-1" />
              Partner With Us
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Partner With Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join our mission to help families preserve precious memories and continue meaningful relationships. 
            Together, we can provide compassionate support when it matters most.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Growing market opportunity</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Meaningful work</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Industry-leading technology</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Explore Partnership Opportunities
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Partnership Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partnership Opportunities
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {partnershipTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {type.title}
                        </h3>
                        <p className="text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {type.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Requirements:</h4>
                        <ul className="space-y-2">
                          {type.requirements.map((requirement, reqIndex) => (
                            <li key={reqIndex} className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-600">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                      Learn More About This Partnership
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Partner Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Partner With Preserving Connections?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerBenefits.map((category, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-center">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partner Success Stories
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{story.partner}</h3>
                    <p className="text-purple-600 font-medium">{story.type}</p>
                    <p className="text-sm text-gray-500">{story.location}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium text-gray-900 mb-3">Results:</h4>
                  <ul className="space-y-2">
                    {story.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-600">{result}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Process */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How the Partnership Process Works</CardTitle>
            <p className="text-gray-600 text-center">Simple steps to becoming a Preserving Connections partner</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              {partnershipProcess.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                    {step.duration}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle>Start Your Partnership Journey</CardTitle>
              <p className="text-gray-600">Tell us about your organization and partnership interests</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input placeholder="Your first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input placeholder="Your last name" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <Input placeholder="Your company or organization" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Type</label>
                  <Select value={partnershipType} onValueChange={setPartnershipType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funeral">Funeral Home Partnership</SelectItem>
                      <SelectItem value="healthcare">Healthcare Partnership</SelectItem>
                      <SelectItem value="technology">Technology Partnership</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input placeholder="(555) 123-4567" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about your organization</label>
                <Textarea 
                  placeholder="Describe your organization, experience, and why you're interested in partnering with us..."
                  className="min-h-[100px]"
                />
              </div>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Submit Partnership Application
              </Button>
            </CardContent>
          </Card>

          {/* Requirements and Next Steps */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle>Partnership Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map((req, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-2">{req.category}</h4>
                      <ul className="space-y-1">
                        {req.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-sm text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">What Happens Next?</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• We'll review your application within 3 business days</li>
                  <li>• Qualified applicants receive a discovery call invitation</li>
                  <li>• We'll discuss your specific needs and goals</li>
                  <li>• Receive a customized partnership proposal</li>
                  <li>• Begin onboarding and training process</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference Together?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing network of partners who are helping families preserve precious memories 
            and continue meaningful relationships.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-purple-600">partnerships@preservingconnections.app</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-purple-600">(555) 123-4567</p>
                <p className="text-sm text-gray-500">Monday - Friday, 9am - 6pm EST</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Schedule a Call</h3>
                <p className="text-purple-600">Book a discovery session</p>
                <p className="text-sm text-gray-500">Available times online</p>
              </CardContent>
            </Card>
          </div>
          
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Schedule Partnership Discussion
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}