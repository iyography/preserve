import { Shield, Eye, Database, Users, Clock, CheckCircle, FileText, Lock, Globe, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2024";

  const keyPrinciples = [
    {
      icon: Lock,
      title: "Privacy by Design",
      description: "Privacy is built into every feature from the ground up, not added as an afterthought."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We clearly explain what data we collect, why we collect it, and how we use it."
    },
    {
      icon: Users,
      title: "User Control",
      description: "You have complete control over your data, including access, correction, and deletion rights."
    },
    {
      icon: Shield,
      title: "Security First",
      description: "We use enterprise-grade security measures to protect your personal information."
    }
  ];

  const dataTypes = [
    {
      category: "Personal Information",
      examples: ["Name, email address, phone number", "Account preferences and settings", "Payment and billing information", "Communication history with support"],
      purpose: "Account management and service delivery",
      retention: "For the duration of your account plus 7 years"
    },
    {
      category: "Memory Content",
      examples: ["Photos, videos, audio recordings", "Written memories and stories", "Conversation history with personas", "Family member contributions"],
      purpose: "Creating and maintaining digital personas",
      retention: "Until you delete your account or specific content"
    },
    {
      category: "Usage Data",
      examples: ["App usage patterns and features used", "Technical performance data", "Error logs and diagnostics", "Device and browser information"],
      purpose: "Improving service quality and user experience",
      retention: "Up to 2 years for analytics, immediately for diagnostics"
    },
    {
      category: "Communication Data",
      examples: ["Support conversations and tickets", "Survey responses and feedback", "Community forum posts", "Email newsletter interactions"],
      purpose: "Customer support and service improvement",
      retention: "7 years for support records, until withdrawal for marketing"
    }
  ];

  const dataSharing = [
    {
      category: "Service Providers",
      description: "Trusted third-party companies that help us provide our services",
      examples: ["Cloud hosting and storage providers", "Payment processing services", "Customer support platforms", "Analytics and monitoring tools"],
      safeguards: ["Data processing agreements", "Limited access to necessary data only", "Regular security audits", "GDPR and CCPA compliance"]
    },
    {
      category: "Legal Requirements",
      description: "When required by law or to protect rights and safety",
      examples: ["Court orders and legal process", "Government investigations", "Protecting user safety", "Preventing fraud or abuse"],
      safeguards: ["Only when legally required", "Minimum necessary information", "Notice to users when possible", "Legal review process"]
    },
    {
      category: "Business Transfers",
      description: "In the event of a merger, acquisition, or business sale",
      examples: ["Company acquisition or merger", "Asset transfer or sale", "Bankruptcy proceedings", "Business restructuring"],
      safeguards: ["User notification in advance", "Same privacy protections apply", "Right to delete data before transfer", "Regulatory approval when required"]
    }
  ];

  const userRights = [
    {
      right: "Access",
      description: "Request a copy of all personal data we hold about you",
      howTo: "Submit request through account settings or contact support",
      timeframe: "Within 30 days"
    },
    {
      right: "Correction",
      description: "Correct any inaccurate or incomplete personal data",
      howTo: "Update directly in account settings or contact support",
      timeframe: "Immediate for self-service, within 7 days for support requests"
    },
    {
      right: "Deletion",
      description: "Request deletion of your personal data ('right to be forgotten')",
      howTo: "Account deletion in settings or formal deletion request",
      timeframe: "Within 30 days (some data may take up to 90 days)"
    },
    {
      right: "Portability",
      description: "Export your data in a structured, machine-readable format",
      howTo: "Use data export feature in account settings",
      timeframe: "Immediate download or within 24 hours for large exports"
    },
    {
      right: "Objection",
      description: "Object to processing of your data for marketing or other purposes",
      howTo: "Opt-out links in communications or contact support",
      timeframe: "Immediate for marketing, within 7 days for other purposes"
    },
    {
      right: "Restriction",
      description: "Request limitation of processing while disputes are resolved",
      howTo: "Contact support with specific request details",
      timeframe: "Within 72 hours of request"
    }
  ];

  const securityMeasures = [
    "End-to-end encryption for sensitive data",
    "Multi-factor authentication for accounts",
    "Regular security audits and penetration testing",
    "Employee background checks and training",
    "Access controls and data minimization",
    "Incident response and breach notification procedures"
  ];

  const internationalTransfers = [
    {
      region: "European Union",
      mechanism: "Standard Contractual Clauses (SCCs)",
      description: "EU-approved contracts ensuring adequate protection"
    },
    {
      region: "United Kingdom",
      mechanism: "UK International Data Transfer Agreement",
      description: "Post-Brexit data transfer mechanisms"
    },
    {
      region: "Other Countries",
      mechanism: "Adequacy Decisions or Appropriate Safeguards",
      description: "Country-specific approved transfer mechanisms"
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
              <FileText className="w-3 h-3 mr-1" />
              Privacy Policy
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <p className="text-lg text-gray-700">
              Your privacy is sacred to us. This policy explains how we collect, use, and protect 
              your personal information with the same care we would want for our own families.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Last updated:</strong> {lastUpdated} • <strong>Effective date:</strong> {lastUpdated}
            </p>
          </div>
        </div>

        {/* Key Principles */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Privacy Principles</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {keyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {principle.title}
                        </h3>
                        <p className="text-gray-600">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What Information We Collect */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What Information We Collect</h2>
          
          <div className="space-y-6">
            {dataTypes.map((type, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{type.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {type.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-gray-600">{example}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Purpose:</h4>
                      <p className="text-gray-600 text-sm">{type.purpose}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Retention:</h4>
                      <p className="text-gray-600 text-sm">{type.retention}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How We Share Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">When We Share Information</h2>
          
          <div className="space-y-6">
            {dataSharing.map((sharing, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{sharing.category}</CardTitle>
                  <p className="text-gray-600">{sharing.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {sharing.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-gray-600">{example}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Safeguards:</h4>
                    <ul className="space-y-1">
                      {sharing.safeguards.map((safeguard, safeguardIndex) => (
                        <li key={safeguardIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">{safeguard}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Your Rights */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Privacy Rights</h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {userRights.map((right, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Right to {right.right}
                  </h3>
                  <p className="text-gray-600 mb-4">{right.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">How to exercise:</span>
                      <p className="text-gray-600">{right.howTo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Response time:</span>
                      <p className="text-green-600">{right.timeframe}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <span>How We Protect Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              We implement industry-leading security measures to protect your personal information 
              and memories. Our security practices include:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {securityMeasures.map((measure, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">{measure}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3">
              <Globe className="w-6 h-6 text-purple-600" />
              <span>International Data Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              When we transfer your data internationally, we use approved transfer mechanisms 
              to ensure your data remains protected:
            </p>
            
            <div className="space-y-4">
              {internationalTransfers.map((transfer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{transfer.region}</h4>
                  <p className="text-sm text-purple-600 mb-2">{transfer.mechanism}</p>
                  <p className="text-sm text-gray-600">{transfer.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h3>
            <p className="text-gray-700 mb-6">
              If you have questions about this privacy policy or how we handle your data, 
              please don't hesitate to contact us.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                <p className="text-purple-600">privacy@preservingconnections.app</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Mail</h4>
                <p className="text-gray-600">Preserving Connections<br />Privacy Officer<br />123 Main St, Suite 100<br />Anytown, ST 12345</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Data Protection Officer</h4>
                <p className="text-purple-600">dpo@preservingconnections.app</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Updates to This Privacy Policy
                </h3>
                <p className="text-amber-800 mb-4">
                  We may update this privacy policy from time to time to reflect changes in our 
                  practices or legal requirements. When we make changes:
                </p>
                <ul className="space-y-1 text-amber-800">
                  <li>• We'll update the "Last updated" date at the top of this policy</li>
                  <li>• For significant changes, we'll notify you by email or app notification</li>
                  <li>• We'll give you time to review changes before they take effect</li>
                  <li>• You can always access previous versions of our privacy policy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}