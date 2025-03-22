import React from "react";

interface CalendarIconProps {
  className?: string;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
      <rect x="6" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="11" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="16" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
};
