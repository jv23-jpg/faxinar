import React from 'react';

export const RadioGroup = ({ children, value, onValueChange }) => <div>{children}</div>;
export const RadioGroupItem = ({ value, ...props }) => <input type="radio" value={value} {...props} />;