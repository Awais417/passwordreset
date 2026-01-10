import Image from 'next/image';

interface SplashScreenProps {
  show: boolean;
}

export default function SplashScreen({ show }: SplashScreenProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex items-center justify-center transition-opacity duration-1000">
      <div className="text-center">
        <div className="logo-pulse mb-8">
          <Image
            src="/logo.png"
            alt="Kumu Logo"
            width={180}
            height={180}
            className="mx-auto drop-shadow-2xl"
            priority
          />
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .logo-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        
        .loading-dots span {
          width: 8px;
          height: 8px;
          background: #f97316;
          border-radius: 50%;
          animation: loading 1.4s ease-in-out infinite both;
        }
        
        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes loading {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
