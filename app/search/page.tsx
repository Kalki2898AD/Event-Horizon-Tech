'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NewsCard from '../components/NewsCard';
import { Article } from '../types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query?.trim()) return;
      
      setLoading(true);
      setError(null);
      setArticles([]);
      
      try {
        const response = await fetch(`/api/news/search?q=${encodeURIComponent(query.trim())}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch search results');
        }

        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Invalid response format');
        }

        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError(error instanceof Error ? error.message : 'Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchSearchResults();
    }
  }, [query, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {query?.trim() 
            ? `Search Results for "${query}"` 
            : 'Please enter a search query'}
        </h1>

        {error && (
          <div className="text-center py-6 bg-red-50 rounded-lg mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <NewsCard 
                key={article.url} 
                article={article} 
              />
            ))}
          </div>
        ) : !loading && query?.trim() ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              No articles found for "{query}"
            </h2>
            <p className="mt-2 text-gray-600">
              Try searching with different keywords
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
