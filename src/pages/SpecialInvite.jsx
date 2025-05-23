import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function SpecialInvite() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleYes = () => {
    navigate('/reseller-checkout');
  };

  const handleNo = () => {
    navigate('/reseller-trial');
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
            <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Take your affiliate game to the next level
            </h1>
            <div className="space-y-6 text-lg">
              <p className="text-gray-300">Dear valued affiliate,</p>
              <p className="text-gray-300">
                We're excited to have you onboard as a valued affiliate of Revenue Ripple. This program offers a real opportunity to build consistent, recurring income while promoting a platform designed to provide meaningful value.
              </p>
              <p className="text-gray-300 font-semibold">
                As an affiliate, you currently earn a 50% commission for every member you refer. We've provided you with comprehensive marketing tools and step-by-step guides on the Reseller Tools page to make promotion simple and effective.
              </p>
              <p className="text-gray-300">
                However, there's an even greater opportunity—becoming a Reseller. This upgrade allows you to earn 100% commission on every $47/month subscription you generate. It's a powerful way to take full control of your earnings.
              </p>
              <p className="text-gray-300 font-semibold">
                Getting started as a Reseller is straightforward. We encourage all affiliates to consider this step to take full ownership of their audience. As a Reseller, you'll also gain access to additional tools, training, and support designed to maximize your results.
              </p>
              <p className="text-gray-300">
                Your partnership is greatly appreciated, and becoming a Reseller is one of the most effective ways to increase your earnings. If you're interested in learning more, simply click one of the options below.
              </p>
              <p className="text-gray-300">
                Thank you again for your continued support. We look forward to seeing you succeed.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleYes}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Yes, I'm Interested!
              </Button>
              <Button
                onClick={handleNo}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold"
              >
                Not Right Now
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}