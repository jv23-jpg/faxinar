import React from 'react';

export const Input = (props) => <input className="input" {...props} />;
export const Label = ({ children, ...props }) => <label {...props}>{children}</label>;
export const Select = ({ children, ...props }) => <select {...props}>{children}</select>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, ...props }) => <option {...props}>{children}</option>;
export const SelectTrigger = ({ children, ...props }) => <div {...props}>{children}</div>;
export const SelectValue = (props) => <span {...props} />;