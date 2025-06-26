import React from 'react';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <motion.button
    ref={ref}
    className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring transition ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.button>
));

Button.displayName = 'Button'; 