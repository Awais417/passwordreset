import React from 'react';

interface NetflixBackgroundProps {
  children?: React.ReactNode;
}

export default function NetflixBackground({ children }: NetflixBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      {/* Full-screen background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/stadium.jpg)'
        }}
      />
      
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      
      {/* Content overlay */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
