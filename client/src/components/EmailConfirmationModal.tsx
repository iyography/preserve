import { Mail, Send, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResend: () => void;
  isResending: boolean;
}

export default function EmailConfirmationModal({
  isOpen,
  onClose,
  email,
  onResend,
  isResending,
}: EmailConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md bg-white/95 backdrop-blur-xl border-purple-200 shadow-2xl"
        data-testid="email-confirmation-modal"
      >
        {/* Animated Background Effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/60 to-purple-100/80"></div>
          
          {/* Floating gradient orbs */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-r from-purple-300/20 to-purple-400/15 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-l from-violet-300/15 to-purple-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-indigo-200/10 to-purple-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <DialogHeader className="text-center space-y-4 pt-2">
          {/* Icon with glow effect */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg ring-4 ring-purple-100">
            <Mail className="w-8 h-8 text-white" data-testid="icon-email" />
          </div>
          
          <div>
            <DialogTitle 
              className="text-2xl font-bold text-gray-900 mb-2"
              data-testid="title-check-email"
            >
              Check Your Email
            </DialogTitle>
            <DialogDescription 
              className="text-gray-600 text-base leading-relaxed"
              data-testid="description-confirmation"
            >
              We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Display */}
          <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium mb-1">Email sent to:</p>
                <p 
                  className="text-purple-700 font-semibold text-lg break-all"
                  data-testid="text-email-address"
                >
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg p-4 border border-indigo-100/50">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">What to do next:</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-1">
                  <li>• Check your inbox (and spam folder)</li>
                  <li>• Click the confirmation link in the email</li>
                  <li>• Return here to continue your journey</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={onResend}
              disabled={isResending}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              data-testid="button-resend-email"
            >
              {isResending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Resend Confirmation Email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
              data-testid="button-close-modal"
            >
              I'll Check My Email
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Need help? <span className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">Contact support</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}