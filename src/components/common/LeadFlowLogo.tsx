import React from 'react';

interface LeadFlowLogoProps {
  className?: string;
  size?: number;
}

export const LeadFlowLogo: React.FC<LeadFlowLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Vibrant WhatsApp Emerald Green to Electric Blue Gradient */}
        <linearGradient id="lf_grad_bubble" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="80%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Dynamic Glowing Outreach Arrow Gradient */}
        <linearGradient id="lf_grad_arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        <linearGradient id="lf_grad_tail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Outer WhatsApp Speech Bubble Shell */}
      <path
        d="M26 76 L17 92 L33 87 C38.5 90 44.5 91.5 51 91.5 C74.2 91.5 93 72.7 93 49.5 C93 26.3 74.2 7.5 51 7.5 C27.8 7.5 9 26.3 9 49.5 C9 59.8 12.7 69.2 18.8 76.5"
        stroke="url(#lf_grad_bubble)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic S-Curve Flow Beam (Data / Lead Stream) */}
      <path
        d="M24 64 C35 56, 44 54, 62 38"
        stroke="url(#lf_grad_arrow)"
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {/* High-Velocity Forward Outreach Arrow Head */}
      <path
        d="M52 23 L79 21 L77 48 L70.5 41.5 L58 54 L50 46 L62.5 33.5 Z"
        fill="url(#lf_grad_arrow)"
      />
    </svg>
  );
};
