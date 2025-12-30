import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RPVreCBgoHuE8YsZzlY93gpPqfUSgCHTvEZ54CWX9XzoaUNFoungWBDEELIy8tg7DkuwMxwO4hMkIPAG5l9s0d000vG1BQyzo');
const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:9090/api/commandes/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelection = async (method) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      if (method === 'cash_on_delivery') {
        // Use the new endpoint
        const response = await axios.post(
          `http://localhost:9090/api/commandes/${orderId}/cash-on-delivery`,
          {},
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        
        if (response.data.success) {
          toast.success('Cash on delivery selected! You will pay when you receive your order.');
          navigate('/orders');
        }
      } else if (method === 'online') {
        setPaymentMethod('online');
      }
    } catch (error) {
      console.error('Payment selection error:', error);
      toast.error(error.response?.data?.error || 'Payment selection failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600 mt-2">Order #{order.id}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg">{order.prixTotal?.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.paymentStatus === 'PAID' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {paymentMethod === 'online' ? (
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                order={order} 
                onSuccess={() => {
                  toast.success('Payment successful!');
                  navigate('/orders');
                }}
                onCancel={() => setPaymentMethod('')}
              />
            </Elements>
          ) : (
            <PaymentMethodSelector 
              order={order}
              onSelectMethod={handlePaymentSelection}
              processing={processing}
              onCancel={() => navigate('/orders')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Method Selector Component
const PaymentMethodSelector = ({ order, onSelectMethod, processing, onCancel }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
      
      <div className="space-y-4">
        {/* Credit Card Option */}
        <div 
          className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition"
          onClick={() => onSelectMethod('online')}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Pay with Credit/Debit Card</h3>
              <p className="text-sm text-gray-600">Secure online payment via Stripe</p>
            </div>
          </div>
        </div>

        {/* Cash on Delivery Option */}
        <div 
          className={`border border-gray-300 rounded-lg p-4 cursor-pointer transition ${
            processing ? 'opacity-50' : 'hover:border-green-500 hover:bg-green-50'
          }`}
          onClick={() => !processing && onSelectMethod('cash_on_delivery')}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
              <p className="text-sm text-gray-600">Pay when you receive your order</p>
              {processing && (
                <div className="flex items-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  <span className="text-sm text-green-600">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

// Stripe Payment Form Component
const StripePaymentForm = ({ order, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // 1. First, initiate the payment on our backend
      const initiateResponse = await axios.post(
        `http://localhost:9090/api/commandes/${order.id}/initiate-online-payment`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      const { clientSecret, paymentIntentId } = initiateResponse.data;

      // 2. Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: order.user?.name || 'Customer',
            email: order.user?.email || '',
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else {
        // 3. Payment succeeded - confirm with our backend
        if (result.paymentIntent.status === 'succeeded') {
          await axios.post(
            'http://localhost:9090/api/commandes/confirm-stripe-payment',
            { paymentIntentId: paymentIntentId },
            {
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );
          
          toast.success('Payment successful!');
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Pay with Card</h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to payment methods
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 mt-2">
            Test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <div>
            <p className="text-lg font-bold">{order.prixTotal?.toFixed(2)} TND</p>
            <p className="text-sm text-gray-600">Total amount to pay</p>
          </div>
          
          <div className="space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className={`px-6 py-3 rounded-lg font-medium ${
                processing || !stripe
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {processing ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ${order.prixTotal?.toFixed(2)} TND`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentPage;