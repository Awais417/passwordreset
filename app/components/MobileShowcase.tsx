import Image from 'next/image';

interface MobileImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface MobileShowcaseProps {
  images: MobileImage[];
}

export default function MobileShowcase({ images }: MobileShowcaseProps) {
  return (
    <div className="relative z-10 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 items-center justify-center">
          {images.map((image, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="relative w-full max-w-[280px] sm:max-w-[240px] lg:max-w-[260px] mb-6 transform transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={260}
                  height={400}
                  className="object-contain drop-shadow-2xl w-full h-auto gaming-glow transition-all duration-300"
                />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {image.title && (
                <div className="space-y-3 max-w-xs">
                  <h3 className="text-xl sm:text-2xl font-quartzo-bold text-white group-hover:text-orange-100 transition-colors duration-300">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-base sm:text-lg text-gray-300 font-quartzo-regular leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
