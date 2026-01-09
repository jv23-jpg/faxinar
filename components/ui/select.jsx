import React from 'react';

export const Select = ({ children, ...props }) => <select {...props}>{children}</select>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, ...props }) => <option {...props}>{children}</option>;
export const SelectTrigger = ({ children, ...props }) => <div {...props}>{children}</div>;
export const SelectValue = (props) => <span {...props} />;