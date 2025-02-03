'use client';

import { useEffect, useId } from 'react';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  width?: number;
  height?: number;
  layout?: 'in-article' | 'in-feed';
}

// Type declaration for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<unknown>;
  }
}

// Global flag to track script loading
let scriptLoaded = false;
const initializedAds = new Set<string>();

export default function ClientAdContainer({ 
  slot, 
  format = 'auto',
  className = '',
  width = 300,
  height = 250,
  layout
}: AdContainerProps) {
  const adId = useId();

  useEffect(() => {
    const initializeAd = () => {
      if (!initializedAds.has(adId)) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initializedAds.add(adId);
        } catch (err) {
          console.error('AdSense error:', err);
        }
      }
    };

    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9131964371118756';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        scriptLoaded = true;
        initializeAd();
      };
      document.head.appendChild(script);
    } else {
      initializeAd();
    }

    return () => {
      initializedAds.delete(adId);
    };
  }, [adId]);

  return (
    <div 
      className={`flex justify-center items-center mx-auto ${className}`}
      style={{
        width: width,
        height: height,
        overflow: 'hidden'
      }}
    >
      <ins
        id={adId}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: `${width}px`,
          height: `${height}px`,
        }}
        data-ad-client="ca-pub-9131964371118756"
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
