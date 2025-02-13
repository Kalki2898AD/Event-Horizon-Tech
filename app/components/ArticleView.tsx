'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdContainer from './AdContainer';
import ScrollToTop from './ScrollToTop';
import Image from 'next/image';

interface ArticleViewProps {
  url: string;
  onError: (error: string) => void;
}

interface Article {
  title: string;
  content: string;
  description: string;
  urlToImage: string;
}

export default function ArticleView({ url, onError }: ArticleViewProps) {
  const searchParams = useSearchParams();
  const urlToImage = searchParams.get('urlToImage');
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/article?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error('Failed to load article');
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        onError('Unable to load article content');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [url, onError]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <article className="max-w-4xl mx-auto px-4">
      <div className="prose prose-lg mx-auto">
        {urlToImage && (
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={urlToImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-xl text-gray-600 mb-8">
            {article.description}
          </p>
        )}

        <div 
          className="article-content text-gray-800"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      <ScrollToTop />
    </article>
  );
}