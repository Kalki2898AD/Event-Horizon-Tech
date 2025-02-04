'use client';

import { useEffect } from 'react';

interface AdContainerProps {
  className?: string;
  slot: string;
  format?: 'auto' | 'fluid';
  layout?: 'in-article' | 'in-feed';
  responsive?: boolean;
}

export default function AdContainer({ 
  className = '', 
  slot,
  format = 'auto',
  layout,
  responsive = true
}: AdContainerProps) {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error('Error loading ad:', err);
    }
  }, []);

  return (
    <div className={`adsbygoogle-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '250px',
          backgroundColor: '#f9fafb'
        }}
        data-ad-client="ca-pub-9131964371118756"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layout && { 'data-ad-layout': layout })}
      />
    </div>
  );
}