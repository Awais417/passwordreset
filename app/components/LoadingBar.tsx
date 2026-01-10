'use client';

import { useState, useEffect } from 'react';

interface LoadingBarProps {
  isLoading: boolean;
  progress?: number; // 0-100
}

export default function LoadingBar({ isLoading, progress }: LoadingBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Start progress animation
      setDisplayProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until completion
          return prev + Math.random() * 15; // Random increment
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Complete the progress bar
      setDisplayProgress(100);
      setTimeout(() => setDisplayProgress(0), 300);
    }
  }, [isLoading]);

  if (!isLoading && displayProgress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress !== undefined ? progress : displayProgress}%`,
          transform: isLoading ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left'
        }}
      />
      <div className="h-1 bg-gray-800/20" />
    </div>
  );
}
