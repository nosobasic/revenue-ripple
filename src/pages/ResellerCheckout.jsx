import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function ResellerCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement actual checkout logic with your payment processor
      // For now, we'll just simulate a successful checkout
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Reseller Program Checkout
            </h1>

            <div className="space-y-8">
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Program Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Reseller Program Fee</span>
                    <span className="text-xl font-semibold">$997</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Setup & Training</span>
                    <span className="text-green-400">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Dedicated Support</span>
                    <span className="text-green-400">Included</span>
                  </div>
                  <div className="border-t border-gray-600 my-4"></div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>$997</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400">What's Included:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Complete Reseller Training Program
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Custom Reseller Dashboard
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Marketing Materials & Resources
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Priority Support Access
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold"
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Secure checkout powered by Stripe. Your information is encrypted and secure.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 