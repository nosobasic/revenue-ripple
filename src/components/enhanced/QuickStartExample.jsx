import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaCheckCircle, FaUsers, FaBook } from 'react-icons/fa';

// Enhanced components
import { MotionCard } from './MotionCard';
import { MotionButton } from './MotionButton';
import { AnimatedSection } from './AnimatedSection';
import { BackgroundPattern } from './FloatingElements';

/**
 * Quick Start Example - Shows how to enhance existing sections
 * 
 * This demonstrates the minimal changes needed to upgrade your existing
 * Revenue Ripple components with modern animations.
 */

// BEFORE: Basic hero section
export const BasicHero = () => (
  <section className="hero py-20 text-center">
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Marketing Is Complicated...
        <span className="block text-blue-600">
          Revenue Ripple Makes It Easy.
        </span>
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Get instant access to marketing tools and training.
      </p>
      <Link 
        to="/checkout" 
        className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold"
      >
        Begin Checkout - $47/month
      </Link>
    </div>
  </section>
);

// AFTER: Enhanced hero section with minimal changes
export const EnhancedHero = () => (
  <BackgroundPattern>
    <section className="hero py-20 text-center">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Marketing Is Complicated...
          <motion.span 
            className="block text-blue-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Revenue Ripple Makes It Easy.
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Get instant access to marketing tools and training.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <MotionButton
            as={Link}
            to="/checkout"
            variant="primary"
            magnetic={true}
            glow={true}
            className="text-lg px-8 py-4"
          >
            <FaRocket className="mr-2" />
            Begin Checkout - $47/month
          </MotionButton>
        </motion.div>
      </div>
    </section>
  </BackgroundPattern>
);

// BEFORE: Basic feature cards
export const BasicFeatures = () => {
  const features = [
    {
      title: "46 Marketing Tutorials",
      description: "Comprehensive guides for all marketing channels",
      icon: FaBook
    },
    {
      title: "Expert-Led Courses",
      description: "Learn from industry professionals",
      icon: FaUsers
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// AFTER: Enhanced feature cards
export const EnhancedFeatures = () => {
  const features = [
    {
      title: "46 Marketing Tutorials",
      description: "Comprehensive guides for all marketing channels",
      icon: FaBook
    },
    {
      title: "Expert-Led Courses", 
      description: "Learn from industry professionals",
      icon: FaUsers
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Features
        </motion.h2>
        
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <MotionCard 
                key={index}
                delay={index * 0.2}
                className="p-8 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </MotionCard>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

// BEFORE: Basic pricing section
export const BasicPricing = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
        <div className="text-4xl font-bold text-blue-600 mb-6">
          $47<span className="text-gray-600 text-lg">/month</span>
        </div>
        <ul className="mb-8 space-y-3">
          <li className="flex items-center">
            <FaCheckCircle className="text-blue-600 mr-2" />
            All marketing tutorials
          </li>
          <li className="flex items-center">
            <FaCheckCircle className="text-blue-600 mr-2" />
            Expert-led courses
          </li>
          <li className="flex items-center">
            <FaCheckCircle className="text-blue-600 mr-2" />
            24/7 support
          </li>
        </ul>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
          Get Started
        </button>
      </div>
    </div>
  </section>
);

// AFTER: Enhanced pricing section
export const EnhancedPricing = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <motion.h2 
        className="text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Simple Pricing
      </motion.h2>
      
      <MotionCard className="p-8 max-w-md mx-auto relative overflow-hidden">
        {/* Popular badge */}
        <motion.div 
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Most Popular
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
        <motion.div 
          className="text-4xl font-bold text-blue-600 mb-6"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          $47<span className="text-gray-600 text-lg">/month</span>
        </motion.div>
        
        <motion.ul 
          className="mb-8 space-y-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.4 }
            }
          }}
          initial="hidden"
          whileInView="visible"
        >
          {[
            "All marketing tutorials",
            "Expert-led courses", 
            "24/7 support"
          ].map((feature, index) => (
            <motion.li 
              key={index}
              className="flex items-center"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <FaCheckCircle className="text-blue-600 mr-3" />
              </motion.div>
              {feature}
            </motion.li>
          ))}
        </motion.ul>
        
        <MotionButton 
          variant="primary"
          magnetic={true}
          glow={true}
          className="w-full py-3"
        >
          Get Started
        </MotionButton>
      </MotionCard>
    </div>
  </section>
);

// Quick replacement guide for existing components
export const QuickReplacementGuide = () => (
  <div className="p-8 bg-gray-100 rounded-lg">
    <h3 className="text-xl font-bold mb-4">🚀 Quick Replacement Guide</h3>
    <div className="space-y-4 text-sm">
      <div>
        <strong>Replace buttons:</strong>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<button className="bg-blue-600 text-white px-4 py-2 rounded">`}
        </code>
        <br />
        <span className="text-green-600">→</span>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<MotionButton variant="primary" magnetic={true}>`}
        </code>
      </div>
      
      <div>
        <strong>Replace cards:</strong>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<div className="bg-white p-6 rounded-lg shadow">`}
        </code>
        <br />
        <span className="text-green-600">→</span>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<MotionCard className="p-6">`}
        </code>
      </div>
      
      <div>
        <strong>Add staggered animations:</strong>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<div className="grid md:grid-cols-3 gap-8">`}
        </code>
        <br />
        <span className="text-green-600">→</span>
        <br />
        <code className="bg-gray-200 px-2 py-1 rounded">
          {`<AnimatedSection><div className="grid md:grid-cols-3 gap-8">`}
        </code>
      </div>
    </div>
  </div>
);

export default {
  BasicHero,
  EnhancedHero,
  BasicFeatures,
  EnhancedFeatures,
  BasicPricing,
  EnhancedPricing,
  QuickReplacementGuide
};