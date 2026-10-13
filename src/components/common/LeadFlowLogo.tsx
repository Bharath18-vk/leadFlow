import React from 'react';

interface LeadFlowLogoProps {
  className?: string;
  size?: number;
}

export const LeadFlowLogo: React.FC<LeadFlowLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* WhatsApp-Style Speech Bubble Shell */}
      <path
        d="M21 11.5C21 16.19 16.97 20 12 20C10.36 20 8.82 19.57 7.5 18.82L3.5 20L4.72 16.15C3.65 14.81 3 13.23 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dynamic Outreach Send Paper Plane / Flow Arrow */}
      <path
        d="M8.5 11.5L15 8L13.2 14.5L11.2 12.5L8.5 11.5Z"
        fill="currentColor"
      />
      <path
        d="M11.2 12.5L15 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
