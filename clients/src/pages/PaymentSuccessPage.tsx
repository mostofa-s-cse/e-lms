import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { showSuccessAlert } from '../utils/sweetAlert';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const tran_id = searchParams.get('tran_id');
    const val_id = searchParams.get('val_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    if (tran_id && val_id) {
      setPaymentDetails({
        tran_id,
        val_id,
        amount,
        currency
      });
      
      showSuccessAlert(
        'Payment Successful!',
        'Your course enrollment has been completed successfully.'
      );
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage="courses" />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your course enrollment has been completed successfully.
          </p>
          
          {paymentDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Payment Details
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{paymentDetails.tran_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validation ID:</span>
                  <span className="font-mono text-sm">{paymentDetails.val_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{paymentDetails.amount} {paymentDetails.currency}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Link
              to="/dashboard?paymentStatus=success"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <div>
              <Link
                to="/courses?paymentStatus=success"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse More Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage; 