'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Article } from '@/types';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

interface ArticleViewProps {
  url: string;
  onError: (error: string) => void;
}

export default function ArticleView({ url, onError }: ArticleViewProps) {
  const searchParams = useSearchParams();
  const urlToImage = searchParams?.get('urlToImage') || '';  // Add null check and default value
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}&urlToImage=${urlToImage}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        onError(error instanceof Error ? error.message : 'Failed to fetch article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [url, urlToImage, onError]);

  if (isLoading) return <LoadingSpinner />;
  if (!article) return <ErrorMessage message="Failed to load article" />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">{article.title}</h1>
      {article.urlToImage && (
        <div className="relative w-full h-96 mb-6">
          <Image 
            src={article.urlToImage} 
            alt={article.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div 
        className="prose prose-lg prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}