import React from 'react';

export const Button = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring transition ${className}`}
    {...props}
  >
    {children}
  </button>
));

Button.displayName = 'Button'; 