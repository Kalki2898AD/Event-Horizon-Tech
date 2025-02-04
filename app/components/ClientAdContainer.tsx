'use client';

import { useEffect, useId } from 'react';

interface AdContainerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  width?: number;
  height?: number;
  layout?: 'in-article' | 'in-feed';
}

declare global {
  interface Window {
    adsbygoogle: Array<unknown>;
  }
}

let scriptLoaded = false;
const initializedAds = new Set<string>();

export default function ClientAdContainer({ 
  slot = 'default', 
  format = 'auto',
  className = '',
  width = 300,
  height = 250,
  layout
}: AdContainerProps) {
  const adId = useId();

  useEffect(() => {
    const initializeAd = async () => {
      if (!initializedAds.has(adId)) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initializedAds.add(adId);
        } catch (err) {
          console.error('AdSense error:', err);
        }
      }
    };

    const loadScript = async () => {
      if (scriptLoaded) {
        await initializeAd();
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9131964371118756';
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          scriptLoaded = true;
          initializeAd();
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading AdSense script:', err);
      }
    };

    loadScript();

    return () => {
      initializedAds.delete(adId);
    };
  }, [adId]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: format === 'auto' ? '100%' : width,
          height: format === 'auto' ? 'auto' : height,
          backgroundColor: '#f9fafb',
        }}
        data-ad-client="ca-pub-9131964371118756"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { 'data-ad-layout': layout })}
        data-full-width-responsive="true"
      />
    </div>
  );
}
