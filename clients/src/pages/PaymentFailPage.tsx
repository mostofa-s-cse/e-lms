import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { showErrorAlert } from '../utils/sweetAlert';

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const tran_id = searchParams.get('tran_id');
    const failedreason = searchParams.get('failedreason');

    if (tran_id) {
      setPaymentDetails({
        tran_id,
        failedreason
      });
      
      showErrorAlert(
        'Payment Failed',
        failedreason || 'Your payment was not completed successfully.'
      );
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage="courses" />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was not completed successfully. Please try again.
          </p>
          
          {paymentDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Payment Details
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{paymentDetails.tran_id}</span>
                </div>
                {paymentDetails.failedreason && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="text-red-600 text-sm">{paymentDetails.failedreason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Link
              to="/courses"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </Link>
            <div>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentFailPage; 