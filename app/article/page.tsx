'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Article } from '@/types';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function ArticleContent() {
  const searchParams = useSearchParams();
  const url = searchParams?.get('url') || '';
  const urlToImage = searchParams?.get('urlToImage') || '';
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}&urlToImage=${urlToImage}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    }

    if (url) {
      fetchArticle();
    } else {
      setError('URL is required');
      setLoading(false);
    }
  }, [url]);

  if (loading) return <LoadingSpinner />;
  if (error || !article) return <ErrorMessage message={error || 'Article not found'} />;

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
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />
    </div>
  );
}
