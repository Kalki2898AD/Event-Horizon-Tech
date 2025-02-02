'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'fluid';
  layout?: 'display' | 'in-article';
  className?: string;
}

// Type definition for Google AdSense
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdContainer = ({ slot, format = 'auto', layout = 'display', className = '' }: AdContainerProps) => {
  useEffect(() => {
    try {
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      window.adsbygoogle.push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="lazyOnload"
        crossOrigin="anonymous"
        data-ad-client="ca-pub-9131964371118756"
      />
      <div className={`ad-container my-4 text-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9131964371118756"
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
};

export default AdContainer;