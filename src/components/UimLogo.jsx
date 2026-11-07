import React from 'react';

export default function UimLogo({ className = "w-10 h-10" }) {
  return (
    <img
      src="/logo-uim.png"
      alt="Logo Universitas Islam Madura"
      className={`${className} object-contain select-none drop-shadow-sm`}
    />
  );
}
