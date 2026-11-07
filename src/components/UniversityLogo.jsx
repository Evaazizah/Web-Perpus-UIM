import React from 'react';

export default function UniversityLogo({ className = "w-12 h-12" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Decorative Circle */}
      <circle cx="50" cy="50" r="46" stroke="#e5a823" strokeWidth="2.5" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="42" fill="#0b2e59" stroke="#ffffff" strokeWidth="1.5" />
      
      {/* Five-Pointed Star / Sun Rays Symbol */}
      <polygon 
        points="50,15 61,38 85,38 66,54 73,78 50,63 27,78 34,54 15,38 39,38" 
        fill="#e5a823" 
        opacity="0.9"
      />
      
      {/* Inner Shield / Book Symbol */}
      <circle cx="50" cy="50" r="22" fill="#071f3d" stroke="#ffffff" strokeWidth="1.2" />
      
      {/* Open Book in the Center */}
      <path 
        d="M37 46 C37 46 43 43 50 46 C57 43 63 46 63 46 L63 58 C63 58 57 55 50 58 C43 55 37 58 37 58 Z" 
        fill="#ffffff" 
      />
      <line x1="50" y1="46" x2="50" y2="58" stroke="#071f3d" strokeWidth="1.5" />

      {/* Light Rays / Torch */}
      <circle cx="50" cy="39" r="2.5" fill="#f4b41a" />
    </svg>
  );
}
