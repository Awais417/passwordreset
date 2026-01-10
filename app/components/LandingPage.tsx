'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Email submitted:', email);
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/stadium.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header */}
      <header className="relative z-10 px-6 lg:px-12 py-8">
        <div className="flex justify-between items-center">
          {/* KUMU Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="KUMU Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>
          
          {/* Sign in Button */}
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-200px)]">
            
            {/* Left Side - iPhone Mockup */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative">
                {/* iPhone Frame - More accurate sizing */}
                <div className="w-72 h-[580px] bg-gray-800 rounded-[3.5rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-black rounded-[3rem] overflow-hidden relative">
                    {/* iPhone Screen Content - Cricket Player */}
                    <div className="w-full h-full relative">
                      {/* Stadium Background in Phone */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'url(/stadium.jpg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      
                      {/* Cricket Player - More prominent */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          {/* Cricket Player Avatar */}
                          <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
                            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-6xl">🏏</span>
                            </div>
                          </div>
                          <p className="text-lg font-bold">Cricket Player</p>
                          <p className="text-sm opacity-80">Professional Athlete</p>
                        </div>
                      </div>
                      
                      {/* Scoreboard Overlay - More accurate positioning */}
                      <div className="absolute top-6 left-6 bg-black/80 text-white p-3 rounded-lg text-sm font-mono">
                        <div className="font-bold">TOTAL 6 229 0</div>
                        <div>BATSMAN WKTS BATSMAN 85 8 M</div>
                        <div>LAST MAN OVERS INNING 25 38 243</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Call to Action */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <div className="max-w-xl mx-auto lg:mx-0">
                {/* Headline - Exact sizing from screenshot */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[0.9]">
                  Unlock potential
                </h1>
                
                {/* Subheadline - Gray text as in screenshot */}
                <p className="text-xl sm:text-2xl text-gray-400 mb-8 font-medium">
                  From only £20 per year.
                </p>
                
                {/* Supporting Text - Exact text from screenshot */}
                <p className="text-lg sm:text-xl text-white mb-10 leading-relaxed max-w-lg">
                  Ready to learn from the best? Enter your email to create or restart your membership.
                </p>
                
                {/* Email Form - Inline layout as in screenshot */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 px-6 py-4 bg-gray-900/90 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap text-lg"
                  >
                    Get Started 
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
    </div>
  );
}
