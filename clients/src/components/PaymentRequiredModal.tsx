import React from 'react';
import { AlertTriangle, Phone, Mail, MessageCircle, X } from 'lucide-react';

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  showContactInfo?: boolean;
}

const PaymentRequiredModal: React.FC<PaymentRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  message = "You need to complete your payment to access this content. Please contact our support team for assistance.",
  showContactInfo = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Payment Required
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Contact Information */}
            {showContactInfo && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Contact Our Support Team
                </h4>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-blue-800">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Phone Support</p>
                      <p className="text-xs">+880 1234-567890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-800">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Email Support</p>
                      <p className="text-xs">support@edulms.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-800">
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Live Chat</p>
                      <p className="text-xs">Available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={() => window.location.href = '/student/payments'}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              View My Payments
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequiredModal; 