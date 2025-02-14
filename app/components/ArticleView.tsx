'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Article } from '@/types';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';
import ScrollToTop from '../components/ScrollToTop';

export default function ArticleView() {
  const searchParams = useSearchParams();
  const url = searchParams?.get('url') || '';
  const urlToImage = searchParams?.get('urlToImage') || '';
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('URL is required');
      setIsLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}&urlToImage=${urlToImage}`);
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [url, urlToImage]); // Include both dependencies

  if (isLoading) return <LoadingSpinner />;
  if (error || !article) return <ErrorMessage message={error || 'Failed to load article'} />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{article.title}</h1>
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
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />
      </div>
      <ScrollToTop />
    </div>
  );
}