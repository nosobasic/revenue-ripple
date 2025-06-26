import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ textContent: '0' }}
        animate={isInView ? { textContent: end } : { textContent: '0' }}
        transition={{
          duration,
          ease: "easeOut",
        }}
        onUpdate={(latest) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(latest.textContent) + suffix;
          }
        }}
      />
    </motion.span>
  );
};

export const StatsCard = ({ 
  icon: Icon, 
  number, 
  label, 
  description,
  delay = 0,
  isString = false
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors duration-300"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-8 h-8 text-blue-600" />
      </motion.div>
      
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {isString ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
          >
            {number}
          </motion.span>
        ) : (
          <AnimatedCounter end={parseInt(number)} suffix={number.toString().replace(/\d/g, '') || ''} />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
      
      {description && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.5 }}
        >
          <Link to={description.link} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            {description.text}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export const StatsGrid = ({ stats }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          icon={stat.icon}
          number={stat.number}
          label={stat.label}
          description={stat.description}
          delay={index * 0.1}
          isString={stat.isString}
        />
      ))}
    </motion.div>
  );
};

export default StatsGrid;