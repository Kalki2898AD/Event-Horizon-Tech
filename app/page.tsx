'use client';

import { useEffect, useState } from 'react';
import NewsCard from './components/NewsCard';
import NewsletterDialog from './components/NewsletterDialog';
import AdContainer from './components/AdContainer'; 
import { Article } from './types';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
      setMounted(true);
    };

    fetchArticles();
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

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Latest Tech News</h1>
          
          {/* Top ad */}
          <AdContainer 
            slot="1234567890"
            format="auto"
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <>
                <NewsCard key={article.url} article={article} />
                {/* Insert ad after every 6th article */}
                {(index + 1) % 6 === 0 && (
                  <div className="col-span-full">
                    <AdContainer 
                      slot="9876543210"
                      format="fluid"
                      layout="in-article"
                    />
                  </div>
                )}
              </>
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
          setIsOpen={setIsNewsletterOpen}
        />
      </div>
    </div>
  );
}
