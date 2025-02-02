'use client';

import { useEffect, useState } from 'react';
import NewsCard from './components/NewsCard';
import NewsletterDialog from './components/NewsletterDialog';
import { Article } from './types';

function AdPlaceholder() {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-md p-6 my-4">
      <div className="text-center text-gray-500">
        <p className="text-sm">Advertisement</p>
        <div className="mt-2 bg-gray-100 h-32 flex items-center justify-center">
          <p>Ad Space</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchNews();
    }
  }, [mounted]);

  // Insert ad after every 6 articles
  const articlesWithAds = articles.reduce<(Article | 'ad')[]>((acc, article, index) => {
    acc.push(article);
    if ((index + 1) % 6 === 0) {
      acc.push('ad');
    }
    return acc;
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Latest Tech News</h1>
          <button
            onClick={() => setIsNewsletterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Subscribe to Updates
          </button>
        </div>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articlesWithAds.map((item, index) =>
              item === 'ad' ? (
                <AdPlaceholder key={`ad-${index}`} />
              ) : (
                <NewsCard key={item.url} article={item} />
              )
            )}
          </div>
        )}
      </div>

      <NewsletterDialog
        isOpen={isNewsletterOpen}
        setIsOpen={setIsNewsletterOpen}
      />
    </div>
  );
}
