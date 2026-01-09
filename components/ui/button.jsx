import React from 'react';

export const Button = ({ children, onClick, className, variant, size, ...props }) => (
  <button className={`button ${variant} ${size} ${className}`} onClick={onClick} {...props}>
    {children}
  </button>
);