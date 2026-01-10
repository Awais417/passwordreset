import EmailForm from './EmailForm';
import Image from 'next/image';

interface CTASectionProps {
  title: string;
  subtitle: string;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  contactText?: string;
}

export default function CTASection({ 
  title, 
  subtitle, 
  email, 
  onEmailChange, 
  onSubmit, 
  contactText = "Questions? Contact us at support@kumu.com"
}: CTASectionProps) {
  return (
    <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gaming-style Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-quartzo-bold text-white mb-4 sm:mb-6 relative">
          {title}
          <div className="absolute inset-0 text-2xl sm:text-3xl md:text-4xl font-quartzo-bold text-orange-500/3 blur-sm">
            {title}
          </div>
        </h2>
        <p className="text-base sm:text-lg md:text-xl font-quartzo-regular text-gray-300 mb-6 sm:mb-8 px-4">
          {subtitle}
        </p>
        
        <EmailForm
          email={email}
          onEmailChange={onEmailChange}
          onSubmit={onSubmit}
          variant="cta"
        />
        
        {/* Download App Section */}
        <div className="mt-8 mb-6">
          <p className="text-sm font-quartzo-regular text-gray-400 mb-4">
            Or download our mobile app
          </p>
          <div className="flex flex-row gap-4 justify-center items-center">
            <a 
              href="https://apps.apple.com/pk/app/kumu-coaching/id1577507631"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transform flex items-center justify-center w-[140px] sm:w-[160px] h-[50px] sm:h-[60px]"
            >
              <Image
                src="/apple-store.svg"
                alt="Download on App Store"
                width={160}
                height={80}
                className="w-full h-full object-contain"
              />
            </a>
            <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transform flex items-center justify-center w-[140px] sm:w-[160px] h-[50px] sm:h-[60px]">
              <Image
                src="/google-play.png"
                alt="Get it on Google Play"
                width={160}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-quartzo-regular text-gray-500 mt-4 px-4">
          {contactText}
        </p>
      </div>
    </div>
  );
}
