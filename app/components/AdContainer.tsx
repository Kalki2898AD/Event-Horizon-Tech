'use client';

import { useEffect, useRef } from 'react';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'fluid';
  layout?: 'in-article';
  className?: string;
}

interface AdsByGoogle {
  push: (params: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    adsbygoogle: AdsByGoogle[];
  }
}

const AdContainer = ({ slot, format = 'auto', layout, className = '' }: AdContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const adScript = document.createElement('script');
      adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9131964371118756';
      adScript.crossOrigin = 'anonymous';
      adScript.async = true;
      document.head.appendChild(adScript);

      const pushAd = () => {
        try {
          if (!window.adsbygoogle) {
            window.adsbygoogle = [];
          }
          window.adsbygoogle.push({
            push: () => {}
          });
        } catch (error) {
          console.error('Error pushing ad:', error);
        }
      };

      adScript.onload = pushAd;

      return () => {
        try {
          document.head.removeChild(adScript);
        } catch (error) {
          console.error('Error cleaning up ad script:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up ad:', error);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full flex justify-center items-center ${className}`}
      style={{
        minHeight: '250px',
        backgroundColor: '#ffffff'
      }}
    >
      <div
        className="adsbygoogle w-full h-[250px]"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9131964371118756"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { 'data-ad-layout': layout })}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdContainer;