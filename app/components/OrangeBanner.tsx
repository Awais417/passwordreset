import Image from 'next/image';

interface OrangeBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
  onButtonClick?: () => void;
}

export default function OrangeBanner({ 
  title, 
  subtitle, 
  buttonText, 
  imageSrc, 
  imageAlt, 
  onButtonClick 
}: OrangeBannerProps) {
  return (
    <div className="relative z-10 py-8 sm:py-12 md:py-[60px] px-4 sm:px-6 lg:px-8">
      {/* Dark Fade Overlay at Top */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-center">
          {/* Orange Banner */}
          <div className="bg-gradient-to-r from-orange-500/30 via-orange-600/25 to-orange-700/30 backdrop-blur-xl border border-orange-300/50 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl shadow-orange-500/40 w-full sm:w-[90%] md:w-[85%] lg:w-[70%] min-h-[100px] sm:min-h-[120px] md:h-20 flex flex-col sm:flex-row items-center relative hover:bg-gradient-to-r hover:from-orange-500/20 hover:via-orange-600/15 hover:to-orange-700/20 hover:border-orange-300/70 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] hover:backdrop-blur-2xl transition-all duration-500 ease-out">
            {/* Image inside the orange box */}
            <div className="sm:absolute sm:left-4 sm:top-1/2 sm:transform sm:-translate-y-1/2 mb-3 sm:mb-0">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={60}
                height={60}
                className="object-contain sm:w-[70px] sm:h-[70px] md:w-[90px] md:h-[90px]"
                priority
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:ml-16 md:ml-20 gap-3 sm:gap-4">
              {/* Center - Gaming-style Text Content */}
              <div className="text-center sm:text-left flex-1 relative z-10">
                <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-quartzo-bold text-white mb-1 leading-tight drop-shadow-lg">
                  {title}
                </h2>
                <p className="text-xs sm:text-xs md:text-sm lg:text-base font-quartzo-regular text-white drop-shadow-md">
                  {subtitle}
                </p>
              </div>
              
              {/* Right Side - Gaming-style Button */}
              <button 
                onClick={onButtonClick}
                className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-quartzo-bold text-sm sm:text-sm md:text-base transition-all duration-300 shadow-lg whitespace-nowrap gaming-button transform hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)]"
              >
                <span className="relative z-10">{buttonText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
