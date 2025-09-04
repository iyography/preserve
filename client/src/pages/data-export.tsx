import { Download, FileText, Image, Video, MessageSquare, Settings, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import ParticleSystem from "@/components/ParticleSystem";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";

export default function DataExport() {
  const [selectedData, setSelectedData] = useState({
    memories: true,
    conversations: true,
    media: true,
    settings: false,
    analytics: false
  });
  const [exportInProgress, setExportInProgress] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const dataTypes = [
    {
      id: 'memories',
      icon: FileText,
      title: 'Memory Content',
      description: 'All stories, experiences, and written memories',
      size: '2.3 MB',
      items: '156 memories'
    },
    {
      id: 'conversations',
      icon: MessageSquare,
      title: 'Conversation History',
      description: 'All interactions with your persona',
      size: '4.7 MB',
      items: '342 conversations'
    },
    {
      id: 'media',
      icon: Image,
      title: 'Photos & Videos',
      description: 'All uploaded images and video files',
      size: '127 MB',
      items: '89 files'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Persona Settings',
      description: 'Configuration and personality parameters',
      size: '0.1 MB',
      items: 'Settings file'
    },
    {
      id: 'analytics',
      icon: Calendar,
      title: 'Usage Analytics',
      description: 'Your interaction patterns and usage statistics',
      size: '0.3 MB',
      items: 'Analytics data'
    }
  ];

  const exportFormats = [
    {
      name: 'Complete Archive (ZIP)',
      description: 'Everything in one downloadable archive',
      recommended: true,
      formats: ['ZIP with organized folders', 'JSON metadata', 'Original file formats']
    },
    {
      name: 'Individual Files',
      description: 'Download specific data types separately',
      recommended: false,
      formats: ['CSV for structured data', 'TXT for conversations', 'Original media formats']
    },
    {
      name: 'Standard Formats',
      description: 'Industry-standard formats for portability',
      recommended: false,
      formats: ['JSON-LD', 'XML', 'CSV', 'Markdown']
    }
  ];

  const handleExport = () => {
    setExportInProgress(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExportInProgress(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const totalSize = dataTypes
    .filter(type => selectedData[type.id as keyof typeof selectedData])
    .reduce((total, type) => total + parseFloat(type.size.replace(/[^\d.]/g, '')), 0);

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
              <Download className="w-3 h-3 mr-1" />
              Data Export
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Data Export Options
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your memories belong to you. Export your data anytime, in multiple formats, 
            for backup, migration, or simply peace of mind.
          </p>
        </div>

        {/* Export Progress */}
        {exportInProgress && (
          <Card className="bg-blue-50 border-blue-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Export in Progress</h3>
              </div>
              <Progress value={exportProgress} className="h-3 mb-2" />
              <p className="text-sm text-blue-700">
                Preparing your data archive... {Math.round(exportProgress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Data Selection */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Data to Export</h2>
            
            <div className="grid gap-4">
              {dataTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedData[type.id as keyof typeof selectedData];
                
                return (
                  <Card key={type.id} className={`bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-purple-300' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            setSelectedData(prev => ({ ...prev, [type.id]: !!checked }))
                          }
                          className="mt-1"
                        />
                        <Icon className="w-8 h-8 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {type.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {type.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{type.size}</span>
                            <span>•</span>
                            <span>{type.items}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Summary */}
          <div>
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected items:</span>
                    <span className="font-medium">
                      {Object.values(selectedData).filter(Boolean).length} types
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total size:</span>
                    <span className="font-medium">{totalSize.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated time:</span>
                    <span className="font-medium">2-5 minutes</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Export Format</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="format" defaultChecked className="text-purple-600" />
                      <span className="text-sm">Complete Archive (ZIP)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="format" className="text-purple-600" />
                      <span className="text-sm">Individual Files</span>
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleExport}
                  disabled={exportInProgress || Object.values(selectedData).every(v => !v)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {exportInProgress ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Start Export
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Export Formats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Export Formats</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {exportFormats.map((format, index) => (
              <Card key={index} className={`bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg ${format.recommended ? 'ring-2 ring-purple-300' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{format.name}</CardTitle>
                    {format.recommended && (
                      <Badge className="bg-purple-600 text-white">Recommended</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">{format.description}</p>
                  <div className="space-y-2">
                    {format.formats.map((fmt, fmtIndex) => (
                      <div key={fmtIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{fmt}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Export History */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-12">
          <CardHeader>
            <CardTitle>Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Complete Archive Export</p>
                    <p className="text-sm text-green-700">March 15, 2024 at 2:30 PM</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Memories Only</p>
                    <p className="text-sm text-gray-700">February 28, 2024 at 11:15 AM</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                  Important Information About Data Export
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-amber-800">
                  <div>
                    <h4 className="font-medium mb-2">Export Limitations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Exports are available for 30 days after creation</li>
                      <li>• Maximum file size limit: 2GB per export</li>
                      <li>• Some AI-generated content may not be exportable</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data Security</h4>
                    <ul className="text-sm space-y-1">
                      <li>• All exports are encrypted during transfer</li>
                      <li>• Export links are unique and single-use</li>
                      <li>• We never retain copies of your exported data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}