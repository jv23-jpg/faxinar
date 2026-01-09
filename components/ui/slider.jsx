import React from 'react';

export const Slider = ({ value, onValueChange, max, min, step, className }) => (
  <input
    type="range"
    value={value}
    onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    max={max}
    min={min}
    step={step}
    className={className}
  />
);