'use client';

import { useEffect } from 'react';

// Define the type for the adsbygoogle array
type AdsbyGoogle = Array<{ push: (arg: object) => void }>;

// Augment the Window interface
declare global {
  interface Window {
    adsbygoogle: AdsbyGoogle | undefined;
  }
}

interface AdContainerProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdContainer({ slot, format = 'auto', responsive = true, style }: AdContainerProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  }, []);

  return (
    <div className="ad-container" style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style,
        }}
        data-ad-client="ca-pub-9131964371118756"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}