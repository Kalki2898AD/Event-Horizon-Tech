import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Article } from '../types';
import { signIn } from 'next-auth/react';

interface NewsCardProps {
  article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const router = useRouter();
  const { title, description, urlToImage, url, publishedAt } = article;

  return (
    <div 
      className="bg-[#1a1a2e] hover:bg-[#16213e] transition-colors duration-300 rounded-lg shadow-lg p-4 cursor-pointer"
      onClick={() => router.push(`/article?url=${encodeURIComponent(url)}`)}
    >
      <div className="relative w-full h-48 mb-4">
        <Image 
          src={urlToImage || '/images/placeholder.jpg'} 
          alt={title}
          fill
          className="object-cover rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      {description && <p className="text-gray-300 mb-4">{description}</p>}
      <time className="text-gray-400 text-sm">
        {new Date(publishedAt).toLocaleDateString()}
      </time>
      <button
        onClick={(e) => {
          e.stopPropagation();
          signIn('google', { callbackUrl: '/' });
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default NewsCard; 