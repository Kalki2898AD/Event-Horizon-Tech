'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Article } from '@/types';
import { LoadingSpinner, ErrorMessage } from '@/components/LoadingSpinner';
import Image from 'next/image';

function ArticleContent() {
  const searchParams = useSearchParams();
  const url = searchParams?.get('url') || '';
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setError('URL is required');
      setLoading(false);
      return;
    }

    fetch(`/api/article?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setArticle(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <LoadingSpinner />;
  if (error || !article) return <ErrorMessage message={error || 'Article not found'} />;

  return (
    <div className="max-w-4xl mx-auto p-6">
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

export default ArticleContent;
