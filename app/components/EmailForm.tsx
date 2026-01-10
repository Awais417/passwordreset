'use client';

import { useState, useEffect } from 'react';

interface EmailFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  buttonText?: string;
  variant?: 'hero' | 'cta';
}

export default function EmailForm({ 
  email, 
  onEmailChange, 
  onSubmit, 
  placeholder = "Email address",
  buttonText = "Get Started",
  variant = 'hero'
}: EmailFormProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isHeroVariant = variant === 'hero';
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <form className={`flex flex-col sm:flex-row ${isHeroVariant ? 'gap-3 sm:gap-4' : 'gap-4'} max-w-lg mx-auto`} suppressHydrationWarning>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 ${
            isHeroVariant 
              ? 'px-4 sm:px-6 py-3 sm:py-4 bg-black/50 border border-gray-600 text-base sm:text-lg' 
              : 'px-6 py-4 bg-gray-800 border border-gray-600 text-lg'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
          style={{ outline: 'none' }}
          required
        />
        <button
          type="submit"
          className={`bg-orange-500 hover:bg-orange-600 text-white ${
            isHeroVariant 
              ? 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg' 
              : 'px-8 py-4 text-lg'
          } rounded-lg font-quartzo-bold transition-colors whitespace-nowrap`}
        >
          {buttonText}
        </button>
      </form>
    );
  }
  
  return (
    <form onSubmit={onSubmit} className={`flex flex-col sm:flex-row ${isHeroVariant ? 'gap-3 sm:gap-4' : 'gap-4'} max-w-lg mx-auto`} suppressHydrationWarning>
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 ${
          isHeroVariant 
            ? 'px-4 sm:px-6 py-3 sm:py-4 bg-black/50 border border-gray-600 text-base sm:text-lg' 
            : 'px-6 py-4 bg-gray-800 border border-gray-600 text-lg'
        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
        style={{ outline: 'none' }}
        required
      />
      <button
        type="submit"
        className={`bg-orange-500 hover:bg-orange-600 text-white ${
          isHeroVariant 
            ? 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg' 
            : 'px-8 py-4 text-lg'
        } rounded-lg font-quartzo-bold transition-colors whitespace-nowrap`}
      >
        {buttonText}
      </button>
    </form>
  );
}
