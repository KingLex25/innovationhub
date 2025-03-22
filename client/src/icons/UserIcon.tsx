import React from "react";

interface UserIconProps {
  className?: string;
}

export const UserIcon: React.FC<UserIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <circle cx="12" cy="8" r="5" strokeWidth="2" />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20 21v-2a8 8 0 00-16 0v2" 
      />
    </svg>
  );
};
