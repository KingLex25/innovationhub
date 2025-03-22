import React from "react";

interface BulletinIconProps {
  className?: string;
}

export const BulletinIcon: React.FC<BulletinIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 5h-7V3l-4 2v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" 
      />
      <line x1="8" y1="10" x2="16" y2="10" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="14" x2="14" y2="14" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="8" r="3" fill="currentColor" />
    </svg>
  );
};
