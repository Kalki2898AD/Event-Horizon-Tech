'use client';

import { useEffect, useId, useState } from 'react';

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
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    const initializeAd = () => {
      if (!initializedAds.has(adId)) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initializedAds.add(adId);
        } catch (err) {
          console.error('AdSense error:', err);
          setIsAdBlocked(true);
        }
      }
    };

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9131964371118756';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onerror = () => {
        console.log('Ad script failed to load - likely blocked by ad blocker');
        setIsAdBlocked(true);
      };
      
      script.onload = () => {
        scriptLoaded = true;
        initializeAd();
      };
      
      document.head.appendChild(script);
    };

    if (!scriptLoaded) {
      loadScript();
    } else {
      initializeAd();
    }

    return () => {
      initializedAds.delete(adId);
    };
  }, [adId]);

  if (isAdBlocked) {
    return (
      <div 
        className={`flex justify-center items-center mx-auto text-gray-500 text-sm ${className}`}
        style={{
          width: width,
          height: height,
          overflow: 'hidden',
          border: '1px dashed #CBD5E0',
          borderRadius: '0.375rem',
          backgroundColor: '#F7FAFC'
        }}
      >
        <p className="text-center px-4">
          Please disable your ad blocker to support our content
        </p>
      </div>
    );
  }

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
