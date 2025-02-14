import React from 'react';
import { useRouter } from 'next/router';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const router = useRouter();
  const { title, description, urlToImage, url, publishedAt } = article;

  return (
    <div 
      className="bg-[#1a1a2e] hover:bg-[#16213e] transition-colors duration-300 rounded-lg shadow-lg p-4 cursor-pointer"
      onClick={() => router.push(`/article/${encodeURIComponent(url)}`)}
    >
      <img 
        src={urlToImage || '/placeholder.jpg'} 
        alt={title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-300 mb-4">{description}</p>
      <time className="text-gray-400 text-sm">
        {new Date(publishedAt).toLocaleDateString()}
      </time>
    </div>
  );
};

export default NewsCard; 