import { Heart, Shield, Users, Building, Mail, Phone, MapPin, Infinity } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* For Families */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              For Families
            </h3>
            <div className="space-y-3">
              <Link href="/create-first-persona" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Create Your First Persona
              </Link>
              <Link href="/family-sharing-guide" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Family Sharing Guide
              </Link>
              <Link href="/privacy-security" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Privacy & Security
              </Link>
              <Link href="/data-export" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Data Export Options
              </Link>
            </div>
          </div>

          {/* Professional Services */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Professional Services
            </h3>
            <div className="space-y-3">
              <Link href="/done-for-you" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Done For You Service
              </Link>
              <Link href="/funeral-home-partners" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Funeral Home Partners
              </Link>
              <Link href="/elder-care-integration" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Elder Care Integration
              </Link>
              <Link href="/estate-planning" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Estate Planning Services
              </Link>
            </div>
          </div>

          {/* Support & Safety */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Support & Safety
            </h3>
            <div className="space-y-3">
              <Link href="/crisis-resources" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Crisis Resources
              </Link>
              <Link href="/grief-counseling-partners" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Grief Counseling Partners
              </Link>
              <Link href="/community-guidelines" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Community Guidelines
              </Link>
              <Link href="/contact-support" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Company
            </h3>
            <div className="space-y-3">
              <Link href="/about-mission" className="block text-gray-300 hover:text-purple-300 transition-colors">
                About Our Mission
              </Link>
              <Link href="/privacy-policy" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/partner-with-us" className="block text-gray-300 hover:text-purple-300 transition-colors">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Email Support</p>
                <p className="text-gray-300">support@preservingconnections.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">24/7 Crisis Line</p>
                <p className="text-gray-300">988 - Suicide & Crisis Lifeline</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Headquarters</p>
                <p className="text-gray-300">Serving families worldwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Call-to-Action */}
        <div className="border-t border-gray-700 pt-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Be Among the First to Experience Preserving Connections
              </h3>
              <p className="text-purple-100 mb-6">
                Join our exclusive waitlist for early access to our platform. We're carefully selecting families and professional partners for our beta program.
              </p>
              <Link href="/waitlist">
                <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors duration-200" data-testid="button-join-waitlist">
                  Join Our Waitlist
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Infinity className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-semibold">Preserving Connections</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                © 2025 Preserving Connections. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Built with love for families preserving precious memories.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Our commitment: To honor the memory of your loved ones with dignity, respect, and the highest ethical standards. 
            We believe technology should serve love, not replace it.
          </p>
        </div>
      </div>
    </footer>
  );
}