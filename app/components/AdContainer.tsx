import dynamic from 'next/dynamic';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  width?: number;
  height?: number;
  layout?: 'in-article' | 'in-feed';
}

// Import the client component dynamically with no SSR
const ClientAdContainer = dynamic(
  () => import('./ClientAdContainer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md" />
    )
  }
);

// Server component wrapper
export default function AdContainer(props: AdContainerProps) {
  return <ClientAdContainer {...props} />;
}