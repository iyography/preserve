import { Shield, Lock, Eye, Database, Key, Users, CheckCircle, AlertTriangle, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function PrivacySecurity() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All your memories are encrypted before leaving your device and remain encrypted in our systems."
    },
    {
      icon: Database,
      title: "Secure Storage",
      description: "Your data is stored in enterprise-grade, SOC 2 certified data centers with multiple backups."
    },
    {
      icon: Key,
      title: "Zero-Knowledge Architecture",
      description: "We cannot access your memories even if we wanted to—only you have the keys."
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "Every feature is built with privacy as the foundation, not an afterthought."
    }
  ];

  const dataControls = [
    {
      title: "Who Can See Your Persona",
      description: "You control exactly who has access to your loved one's digital memory.",
      options: ["Only you", "Family members you invite", "Specific individuals", "Private forever"]
    },
    {
      title: "Memory Sharing",
      description: "Choose how memories can be shared and with whom.",
      options: ["View only", "Can contribute", "Can edit", "Administrator"]
    },
    {
      title: "Data Export",
      description: "Download all your data at any time in standard formats.",
      options: ["Complete export", "Memories only", "Persona settings", "Conversation history"]
    },
    {
      title: "Account Deletion",
      description: "Permanently delete your account and all associated data.",
      options: ["Immediate deletion", "30-day grace period", "Transfer to family", "Memorial mode"]
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
              <Shield className="w-3 h-3 mr-1" />
              Privacy & Security
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy & Security
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your precious memories deserve the highest level of protection. Learn about our comprehensive 
            security measures and how you maintain complete control over your data.
          </p>
        </div>

        {/* Security Promise */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-12">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Promise</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              We believe your memories are sacred. That's why we've built military-grade security into every 
              aspect of our platform, ensuring your loved one's digital presence remains protected and private.
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="security">Security Features</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Security Features */}
          <TabsContent value="security" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle>Technical Security Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Encryption Standards</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>AES-256 encryption for data at rest</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>TLS 1.3 for data in transit</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>End-to-end encryption for sensitive data</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Infrastructure Security</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>SOC 2 Type II certified data centers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>24/7 security monitoring</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Regular security audits and penetration testing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Controls */}
          <TabsContent value="privacy" className="space-y-8">
            <div className="grid gap-6">
              {dataControls.map((control, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {control.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {control.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {control.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="bg-purple-50 rounded-lg p-3 text-center">
                          <span className="text-sm text-purple-800">{option}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Download className="w-6 h-6 text-purple-600" />
                    <span>Data Export</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Download all your data in standard formats at any time, for any reason.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800">Complete Archive</span>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800">Memories Only</span>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800">Conversation History</span>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <span>Account Deletion</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Permanently delete your account and all associated data with multiple options.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Immediate Deletion</h4>
                      <p className="text-sm text-gray-600">All data deleted within 24 hours</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">30-Day Grace Period</h4>
                      <p className="text-sm text-gray-600">Ability to recover account for 30 days</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Transfer to Family</h4>
                      <p className="text-sm text-gray-600">Transfer ownership to family member</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg md:col-span-2">
                <CardHeader>
                  <CardTitle>Data Retention Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Active Accounts</h4>
                      <p className="text-sm text-purple-800">Data retained indefinitely while account is active</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Inactive Accounts</h4>
                      <p className="text-sm text-purple-800">Data preserved for 7 years after last login</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Deleted Accounts</h4>
                      <p className="text-sm text-purple-800">All data permanently deleted within 30 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>Regulatory Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">GDPR Compliant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">CCPA Compliant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">COPPA Compliant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">SOC 2 Type II</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle>International Standards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">ISO 27001 Certified</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Privacy Shield Framework</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Standard Contractual Clauses</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Regular Third-Party Audits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  Your Rights Under Privacy Laws
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Right to Access</h4>
                    <p className="text-sm">Request a copy of all personal data we hold about you</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Right to Rectification</h4>
                    <p className="text-sm">Correct any inaccurate or incomplete personal data</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Right to Erasure</h4>
                    <p className="text-sm">Request deletion of your personal data ("right to be forgotten")</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Right to Portability</h4>
                    <p className="text-sm">Export your data in a structured, machine-readable format</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Contact */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mt-12">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-4">
              Security Concerns or Questions?
            </h3>
            <p className="text-amber-800 mb-6">
              If you have any security concerns or questions about how we protect your data, 
              please don't hesitate to reach out to our security team.
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Contact Security Team
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}