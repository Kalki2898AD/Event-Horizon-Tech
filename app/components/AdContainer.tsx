'use client';

import { useEffect, useRef } from 'react';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'fluid';
  layout?: 'in-article';
  className?: string;
}

interface AdSenseConfig {
  google_ad_client: string;
  enable_page_level_ads: boolean;
}

declare global {
  interface Window {
    adsbygoogle: Array<AdSenseConfig | { push: (params: AdSenseConfig) => void }>;
  }
}

const AdContainer = ({ slot, format = 'auto', layout, className = '' }: AdContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }
        window.adsbygoogle.push({
          google_ad_client: 'ca-pub-9131964371118756',
          enable_page_level_ads: true
        });
      }
    } catch (error) {
      console.error('Error initializing ad:', error);
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
      <ins
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