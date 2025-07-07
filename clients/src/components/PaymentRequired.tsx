import React from 'react';
import { AlertTriangle, Phone, Mail, MessageCircle } from 'lucide-react';

interface PaymentRequiredProps {
  message?: string;
  showContactInfo?: boolean;
}

const PaymentRequired: React.FC<PaymentRequiredProps> = ({ 
  message = "You need to complete your payment to access this content. Please contact our support team for assistance.",
  showContactInfo = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Required
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Contact Information */}
        {showContactInfo && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Contact Our Support Team
            </h3>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-blue-800">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm">+880 1234-567890</p>
                </div>
              </div>
              
              <div className="flex items-center text-blue-800">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm">support@edulms.com</p>
                </div>
              </div>
              
              <div className="flex items-center text-blue-800">
                <MessageCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/student/payments'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View My Payments
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>If you believe this is an error, please contact our support team immediately.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequired; 