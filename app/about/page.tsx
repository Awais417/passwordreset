'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import SplashScreen from './../components/SplashScreen';
import HeroSection from './../components/HeroSection';
import CurvedDivider from './../components/CurvedDivider';
import OrangeBanner from './../components/OrangeBanner';
import MobileShowcase from './../components/MobileShowcase';
import FeatureBoxes from './../components/FeatureBoxes';
import FAQSection from './../components/FAQSection';
import CTASection from './../components/CTASection';
import Footer from './../components/Footer';
import { faqData, footerData, mobileImages } from './../data/aboutPageData';

export default function AboutPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Show splash screen for 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      // Small delay before showing landing page for smooth transition
      setTimeout(() => {
        setShowLanding(true);
      }, 300);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleSubmit = (source: 'hero' | 'cta') => {
    return async (e: React.FormEvent) => {
    e.preventDefault();
      if (!email || !email.includes('@')) {
        Swal.fire({
          title: 'Invalid Email',
          text: 'Please enter a valid email address',
          icon: 'warning',
          confirmButtonColor: '#f97316',
        });
        return;
      }

      try {
        const response = await fetch('https://nodeapislive.netlify.app/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            source: source,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          await Swal.fire({
            title: 'Thank You for Subscribing!',
            html: `
              <div style="text-align: center;">
                <p style="margin-bottom: 15px;">We're thrilled to have you join our community!</p>
                <p style="color: #666; font-size: 14px;">Check your email for a confirmation message with next steps.</p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#f97316',
            confirmButtonText: 'Got it!',
            timer: 5000,
            timerProgressBar: true,
          });
          setEmail(''); // Clear the email field
        } else {
          Swal.fire({
            title: 'Error!',
            text: data.error?.message || 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      } catch (error) {
        console.error('Error submitting email:', error);
        Swal.fire({
          title: 'Connection Error',
          text: 'Failed to subscribe. Please check your internet connection and try again.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    };
  };

  const handleLearnMore = () => {
    // Handle learn more button click
    console.log('Learn more clicked');
  };

  return (
    <>
      
      <div className="min-h-screen relative bg-linear-to-br from-gray-900 via-gray-800 to-black gaming-page" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Global Gaming-style Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="gaming-background-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>
        </div>
        {/* Enhanced Splash Screen */}
        <SplashScreen show={showSplash} />

        {/* Netflix-Style Landing Page */}
        <HeroSection 
          show={showLanding}
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleSubmit('hero')}
        />
        <CurvedDivider />

        <div 
          className="min-h-screen relative overflow-hidden rounded-t-3xl"
        >
          <OrangeBanner
            title="Transform Your Cricket Game"
            subtitle="Access world-class coaching techniques used by international players. Master every aspect of cricket with professional guidance at your fingertips."
            buttonText="Start Learning"
            imageSrc="/bat.png"
            imageAlt="Cricket Bat Logo"
            onButtonClick={handleLearnMore}
          />

          {/* Mobile Phones Below Orange Banner */}
          <MobileShowcase images={mobileImages} />
        </div>

        {/* Third Section - 4 Orange Boxes */}
        <div className="rounded-t-3xl">
          <FeatureBoxes />
        </div>

        {/* FAQ Section */}
        <div className="rounded-t-3xl">
          <FAQSection faqs={faqData} />
        </div>

        {/* Final CTA Section */}
        <div className="rounded-t-3xl">
        <CTASection
          title="Ready to Master Cricket Like a Pro?"
          subtitle="Join thousands of players who've transformed their game with KUMU. Start your journey to cricket excellence today."
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleSubmit('cta')}
        />
        </div>

        {/* Footer */}
        <div className="rounded-t-3xl">
          <Footer sections={footerData} />
        </div>
      </div>
    </>
  );
}