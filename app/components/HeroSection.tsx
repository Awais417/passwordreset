import EmailForm from './EmailForm';
import { useState } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  show: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function HeroSection({ show, email, onEmailChange, onSubmit }: HeroSectionProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  if (!show) return null;

  return (
    <div className={`transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="min-h-screen relative flex flex-col rounded-t-3xl overflow-hidden"
        style={{
          backgroundImage: 'url(/stadium.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Gaming-style Animated Background Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-black/80"></div>
        
        {/* Animated Gaming Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gaming-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
          </div>
        </div>
        
        {/* Gaming-style Glow Effects */}
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse"></div>
        
        {/* Header */}
        <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex justify-between items-center">
            {/* KUMU Logo with Gaming Effects */}
            <div className="relative">
              <div className="relative z-10 gaming-glow">
                <Image
                  src="/logo-kumu-removebg-preview.png"
                  alt="KUMU Logo"
                  width={120}
                  height={60}
                  className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/logo-kumu-removebg-preview.png"
                  alt="KUMU Logo Glow"
                  width={120}
                  height={60}
                  className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain opacity-30 blur-sm"
                />
              </div>
            </div>
            
            {/* Gaming-style Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowDownloadModal(true)}
                className="relative bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg font-quartzo-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10">Download APP</span>
              </button>
              <a
                href="/signin"
                className="relative bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg font-quartzo-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] gaming-button"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-linear-to-r from-orange-400 to-orange-500 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section - Centered with Gaming Effects */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center max-w-4xl mx-auto w-full">
            {/* Gaming-style Animated Headline */}
            <div className="relative mb-3 sm:mb-4 md:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-quartzo-bold text-white leading-tight px-4 animate-fade-in-up">
                Unlock Your Potential
              </h1>
              <div className="absolute inset-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-quartzo-bold text-orange-500/5 blur-sm px-4 animate-pulse">
                Unlock Your Potential
              </div>
            </div>
            
            {/* Animated Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-quartzo-regular text-gray-300 mb-3 sm:mb-4 md:mb-6 px-4 animate-fade-in-up-delay-1">
              Professional cricket coaching from £20 per year
            </p>
            
            {/* Email Form - Netflix Style */}
            <div className="px-4">
              <EmailForm
                email={email}
                onEmailChange={onEmailChange}
                onSubmit={onSubmit}
                variant="hero"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Download App Modal */}
      {showDownloadModal && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowDownloadModal(false)}
        >
          <div 
            className="bg-linear-to-br from-gray-900 via-gray-800 to-black rounded-lg p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-auto relative animate-slide-up border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:shadow-[0_0_50px_rgba(249,115,22,0.8)] transition-shadow duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-orange-500 text-xl sm:text-2xl font-bold transition-colors z-10"
            >
              ✖
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Heading */}
              <h2 className="text-xl sm:text-2xl font-quartzo-bold text-white mb-2">
                Scan to Download
              </h2>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 font-quartzo-regular px-2">
                Scan the QR code below to download the KUMU Coaching app
              </p>

              {/* QR Code */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-xl">
                  <Image
                    src="/qrcode.jpg"
                    alt="QR Code to download KUMU app"
                    width={160}
                    height={160}
                    className="rounded-lg w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]"
                  />
                </div>
              </div>

              {/* App Store Badges */}
              <div className="flex flex-row gap-4 justify-center items-center">
                <a 
                  href="https://apps.apple.com/pk/app/kumu-coaching/id1577507631"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-all duration-300 cursor-pointer hover:scale-105 sm:hover:scale-110 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transform flex items-center justify-center w-[160px] sm:w-[180px] h-[60px] sm:h-[70px]"
                >
                  <Image
                    src="/apple-store.svg"
                    alt="Download on App Store"
                    width={180}
                    height={90}
                    className="w-full h-full object-contain"
                  />
                </a>
                <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-all duration-300 cursor-pointer hover:scale-105 sm:hover:scale-110 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transform flex items-center justify-center w-[160px] sm:w-[180px] h-[60px] sm:h-[70px]">
                  <Image
                    src="/google-play.png"
                    alt="Get it on Google Play"
                    width={180}
                    height={90}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
