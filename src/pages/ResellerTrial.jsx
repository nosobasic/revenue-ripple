import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function ResellerTrial() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartTrial = () => {
    // TODO: Implement trial signup logic
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/affiliate-centre');
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
            <div className="text-center mb-8">
              <span className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-semibold">
                Special Offer
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Try Our Reseller Program Free for 7 Days
            </h1>

            <div className="space-y-8">
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">What You'll Get During Your Trial:</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <div>
                      <span className="font-semibold">Full Reseller Access</span>
                      <p className="text-gray-400 text-sm">Experience all features and benefits of the Reseller Program</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <div>
                      <span className="font-semibold">Training & Support</span>
                      <p className="text-gray-400 text-sm">Access to our complete training program and dedicated support</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <div>
                      <span className="font-semibold">Marketing Resources</span>
                      <p className="text-gray-400 text-sm">Use our professional marketing materials and tools</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  No credit card required. Start your 7-day trial today and see if the Reseller Program is right for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleStartTrial}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Start 7-Day Free Trial
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold"
                  >
                    Maybe Later
                  </Button>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 mb-4">Ready to start your affiliate journey?</p>
                  <Button
                    onClick={() => navigate('/affiliate-centre')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Go to Affiliate Centre
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  You can cancel anytime during your trial period.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 