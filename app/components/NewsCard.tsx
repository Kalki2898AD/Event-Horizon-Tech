'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Article } from '@/types';
import { useRouter } from 'next/navigation';

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [isImageError, setIsImageError] = useState(false);
  const router = useRouter();

  const handleCardClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({
      url: article.url,
      urlToImage: article.urlToImage || ''
    });
    router.push(`/article?${params.toString()}`);
  };

  return (
    <div 
      className="w-full h-full flex flex-col rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden" 
      onClick={handleCardClick}
    >
      {article.urlToImage && !isImageError && (
        <div className="relative w-full pt-[56.25%]">
          <Image
            src={article.urlToImage}
            alt=""
            fill
            className="object-cover"
            onError={() => setIsImageError(true)}
          />
        </div>
      )}
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {article.description}
          </p>
        )}
      </div>
    </div>
  );
}