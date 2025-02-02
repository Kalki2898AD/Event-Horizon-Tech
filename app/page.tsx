'use client';

import { useEffect, useState } from 'react';
import NewsCard from './components/NewsCard';
import NewsletterDialog from './components/NewsletterDialog';
import AdContainer from './components/AdContainer'; 
import { Article } from './types';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        
        // Check if data has the expected structure
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Invalid response format');
        }
        
        setArticles(data.articles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
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

        <div className="container mx-auto">
          {/* Top ad */}
          <AdContainer 
            slot="1234567890"
            format="auto"
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div key={article.url}>
                <NewsCard article={article} />
                {/* Insert ad after every 6th article */}
                {(index + 1) % 6 === 0 && (
                  <div className="col-span-full mt-6">
                    <AdContainer 
                      slot="9876543210"
                      format="fluid"
                      layout="in-article"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom ad */}
          <AdContainer 
            slot="5432109876"
            format="auto"
            className="mt-8"
          />
        </div>

        <NewsletterDialog
          isOpen={isNewsletterOpen}
          onClose={() => setIsNewsletterOpen(false)}
        />
      </div>
    </div>
  );
}
