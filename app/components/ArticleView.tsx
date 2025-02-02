'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Article } from '../lib/supabase';
import { format } from 'date-fns';
import AdContainer from './AdContainer';

interface ArticleViewProps {
  url: string;
  onError?: (error: string) => void;
}

export default function ArticleView({ url, onError }: ArticleViewProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (error) {
        console.error('Error fetching article:', error);
        onError?.('Failed to load article. Redirecting to source...');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [url, onError]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center justify-between text-gray-600">
          <span>{article.source.name}</span>
          <time dateTime={article.publishedAt}>
            {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
          </time>
        </div>
      </header>

      {article.urlToImage && (
        <div className="relative h-96 mb-8">
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.fullContent || article.content }}
        />
      </div>

      <div className="my-12">
        <AdContainer position="article" />
      </div>

      <div className="mt-8 border-t border-gray-200 pt-8">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Original Article on {article.source.name}
        </a>
      </div>
    </article>
  );
}