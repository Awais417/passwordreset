'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
}

export default function FAQSection({ 
  title = "Frequently Asked Questions", 
  faqs 
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-quartzo-bold text-white text-center mb-8 sm:mb-12 md:mb-16 relative">
          {title}
          <div className="absolute inset-0 text-2xl sm:text-3xl md:text-4xl font-quartzo-bold text-orange-500/5 blur-sm text-center">
            {title}
          </div>
        </h2>
        
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="cursor-pointer gaming-faq-item" onClick={() => toggleFAQ(index)}>
              <div className="bg-gradient-to-r from-orange-500/30 via-orange-600/25 to-orange-700/30 backdrop-blur-xl border border-orange-300/50 rounded-lg shadow-xl shadow-orange-500/30 hover:bg-gradient-to-r hover:from-orange-500/20 hover:via-orange-600/15 hover:to-orange-700/20 hover:border-orange-300/70 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.01] hover:backdrop-blur-2xl transition-all duration-500 ease-out relative overflow-hidden group">
                {/* Gaming-style Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-transparent to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div 
                  className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-left text-white font-quartzo-bold text-base sm:text-lg md:text-xl flex justify-between items-center gap-4 relative z-10"
                >
                  <span className="flex-1 group-hover:text-orange-100 transition-colors duration-300">{faq.question}</span>
                  <span className="text-xl sm:text-2xl flex-shrink-0 group-hover:rotate-180 transition-transform duration-500">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
                {openIndex === index && (
                  <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 text-white animate-fade-in relative z-10">
                    <p className="font-quartzo-regular text-sm sm:text-base leading-relaxed group-hover:text-orange-100 transition-colors duration-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
