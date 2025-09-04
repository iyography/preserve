import { FileText, Gavel, Users, Shield, Heart, Clock, DollarSign, CheckCircle, ArrowRight, Scale, Briefcase, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function EstatePlanning() {
  const services = [
    {
      icon: FileText,
      title: "Digital Asset Documentation",
      description: "Include your digital personas and memories as part of your estate planning documentation",
      benefits: [
        "Legal recognition of digital assets",
        "Clear inheritance instructions",
        "Preservation guidelines",
        "Access credential management"
      ]
    },
    {
      icon: Users,
      title: "Legacy Succession Planning",
      description: "Plan how your digital memories will be transferred and maintained for future generations",
      benefits: [
        "Multi-generational access plans",
        "Custodian appointment",
        "Update responsibilities",
        "Family coordination protocols"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Protection Directives",
      description: "Establish privacy preferences and protection measures for your digital memories",
      benefits: [
        "Privacy preference documentation",
        "Content access restrictions",
        "Modification permissions",
        "Deletion instructions"
      ]
    },
    {
      icon: Heart,
      title: "Ethical Will Integration",
      description: "Incorporate your digital persona into ethical wills and values-based inheritance",
      benefits: [
        "Values and beliefs preservation",
        "Life lesson documentation",
        "Family wisdom transfer",
        "Emotional inheritance planning"
      ]
    }
  ];

  const planningSteps = [
    {
      step: 1,
      title: "Assessment & Inventory",
      description: "Catalog your digital assets and determine their estate planning significance",
      details: [
        "Digital asset inventory",
        "Value assessment",
        "Legal implications review",
        "Family impact analysis"
      ]
    },
    {
      step: 2,
      title: "Legal Documentation",
      description: "Create or update legal documents to include digital memory provisions",
      details: [
        "Will amendments",
        "Trust provisions",
        "Power of attorney updates",
        "Digital asset directives"
      ]
    },
    {
      step: 3,
      title: "Succession Planning",
      description: "Establish clear succession plans for digital memory management",
      details: [
        "Custodian selection",
        "Responsibility allocation",
        "Training requirements",
        "Contingency planning"
      ]
    },
    {
      step: 4,
      title: "Implementation & Maintenance",
      description: "Execute the plan and establish ongoing maintenance procedures",
      details: [
        "Document execution",
        "Custodian training",
        "Regular review schedule",
        "Update procedures"
      ]
    }
  ];

  const legalConsiderations = [
    {
      category: "Digital Property Rights",
      items: [
        "Ownership and transfer rights for digital personas",
        "Intellectual property considerations",
        "Terms of service compliance",
        "Platform-specific restrictions"
      ]
    },
    {
      category: "Privacy and Consent",
      items: [
        "Posthumous privacy preferences",
        "Family member consent requirements",
        "Data protection compliance",
        "International privacy laws"
      ]
    },
    {
      category: "Access and Control",
      items: [
        "Authentication and security measures",
        "Administrative access rights", 
        "Emergency access procedures",
        "Account recovery protocols"
      ]
    }
  ];

  const documentTypes = [
    {
      name: "Digital Asset Will Amendment",
      description: "Legal amendment to include digital personas in your will",
      includes: ["Asset description", "Inheritance instructions", "Access provisions", "Custodian appointment"]
    },
    {
      name: "Digital Memory Trust",
      description: "Specialized trust for managing digital memory assets",
      includes: ["Trust terms", "Beneficiary rights", "Trustee duties", "Distribution guidelines"]
    },
    {
      name: "Ethical Will with Digital Component",
      description: "Values-based document incorporating digital memory elements",
      includes: ["Personal values", "Life lessons", "Digital story integration", "Family guidance"]
    },
    {
      name: "Digital Asset Directive",
      description: "Specific instructions for digital memory management",
      includes: ["Access credentials", "Privacy preferences", "Update permissions", "Deletion criteria"]
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
              <Scale className="w-3 h-3 mr-1" />
              Estate Planning
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Estate Planning Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Integrate your digital memories and personas into comprehensive estate planning to ensure 
            your legacy is preserved and properly transferred to future generations.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Gavel className="w-4 h-4 text-purple-600" />
              <span>Legally compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Privacy protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Family-focused</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Start Estate Planning
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Digital Legacy Planning Services
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
                        <p className="text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{benefit}</span>
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

        {/* Planning Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Estate Planning Process
          </h2>
          
          <div className="grid gap-8">
            {planningSteps.map((step, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {step.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Document Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Available Document Types
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {documentTypes.map((doc, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{doc.name}</CardTitle>
                  <p className="text-gray-600">{doc.description}</p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium text-gray-900 mb-3">Document Includes:</h4>
                  <ul className="space-y-2">
                    {doc.includes.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Considerations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Legal Considerations
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {legalConsiderations.map((consideration, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-center">{consideration.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {consideration.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <Scale className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Packages Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-16">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Estate Planning Packages
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Basic Package</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Digital Asset Will Amendment</li>
                  <li>Basic Privacy Directives</li>
                  <li>Access Credential Documentation</li>
                  <li>Legal Review Included</li>
                </ul>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg ring-2 ring-purple-300">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Package</h4>
                <Badge className="bg-purple-600 text-white mb-4">Most Popular</Badge>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>All Basic Package features</li>
                  <li>Digital Memory Trust Creation</li>
                  <li>Succession Planning</li>
                  <li>Ethical Will Integration</li>
                  <li>Family Consultation</li>
                </ul>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Package</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>All Comprehensive features</li>
                  <li>Complex Trust Structures</li>
                  <li>Multi-Generational Planning</li>
                  <li>Ongoing Legal Support</li>
                  <li>Annual Review Sessions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Attorneys */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Partner Attorney Network</CardTitle>
            <p className="text-gray-600 text-center">Work with experienced estate planning attorneys specializing in digital assets</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Briefcase className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Certified Specialists</h4>
                <p className="text-sm text-gray-600">Attorneys with specific training in digital asset estate planning</p>
              </div>
              
              <div className="text-center">
                <Scale className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Legal Expertise</h4>
                <p className="text-sm text-gray-600">Deep understanding of evolving digital asset laws and regulations</p>
              </div>
              
              <div className="text-center">
                <Home className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Local Knowledge</h4>
                <p className="text-sm text-gray-600">Attorneys familiar with state-specific estate planning requirements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Secure Your Digital Legacy Today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Don't leave your digital memories to chance. Work with our estate planning specialists 
            to ensure your legacy is properly protected and transferred.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Schedule Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-medium">
              Download Planning Guide
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Free initial consultation • Attorney matching service • Ongoing support available
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}