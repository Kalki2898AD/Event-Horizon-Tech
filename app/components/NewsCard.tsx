'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Article } from '../types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fallbackImage = '/placeholder-news.jpg';

  useEffect(() => {
    setMounted(true);
    try {
      setFormattedDate(format(new Date(article.publishedAt), 'MMM d, yyyy'));
    } catch (error) {
      setFormattedDate('');
    }
  }, [article.publishedAt]);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/article?url=${encodeURIComponent(article.url)}`}>
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={imageError ? fallbackImage : (article.urlToImage || fallbackImage)}
            alt={article.title}
            width={640}
            height={360}
            className="object-cover w-full h-full"
            onError={handleImageError}
            priority={true}
            unoptimized={!article.urlToImage?.startsWith('http')}
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-600 font-medium">
              {article.source.name}
            </span>
            {formattedDate && (
              <span className="text-sm text-gray-500">
                {formattedDate}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.description}
          </p>
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Read More
          </span>
        </div>
      </Link>
    </div>
  );
}