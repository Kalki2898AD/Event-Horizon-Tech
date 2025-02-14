import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';
import { fetchArticle } from '../../utils/api';
import { Article } from '../../types';

export default function ArticleView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { url } = router.query;

  useEffect(() => {
    if (url) {
      fetchArticle(decodeURIComponent(url as string))
        .then(data => {
          setArticle(data);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    }
  }, [url]);

  if (loading) return <LoadingSpinner />;
  if (error || !article) return <ErrorMessage />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">{article.title}</h1>
      {article.urlToImage && (
        <img 
          src={article.urlToImage} 
          alt={article.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}
      <div className="prose prose-lg prose-invert max-w-none">
        {article.content}
      </div>
    </div>
  );
} 