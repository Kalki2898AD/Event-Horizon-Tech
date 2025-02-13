'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NewsCard from '../components/NewsCard';
import AdContainer from '../components/AdContainer';
import ScrollToTop from '../components/ScrollToTop';
import { Article } from '../types';

const AdSection = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-7xl mx-auto bg-white shadow-sm mb-8">
    <div className="p-2 border-b border-gray-100">
      <p className="text-xs text-gray-500 text-center">Advertisement</p>
    </div>
    <div className="flex justify-center p-4 min-h-[250px] items-center">
      {children}
    </div>
  </div>
);

import React, { Suspense } from 'react';

const SearchPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPageWrapper;

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchArticles = async () => {
      if (!query) {
        setArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (!data || data.status !== 'ok' || !Array.isArray(data.articles)) {
          throw new Error('Invalid response format');
        }
        
        setArticles(data.articles);
      } catch (err) {
        console.error('Error searching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to search articles');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    searchArticles();
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {query ? `Search Results for "${query}"` : 'Search Results'}
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {query ? 'No articles found for your search.' : 'Enter a search term to find articles.'}
          </div>
        ) : (
          <div>
            {/* Top Ad */}
            <AdSection>
              <AdContainer slot="1234567890" />
            </AdSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <>
                  <div key={article.url}>
                    <NewsCard article={article} />
                  </div>
                  {(index + 1) % 6 === 0 && index !== articles.length - 1 && (
                    <div className="col-span-full w-full">
                      <div className="max-w-7xl mx-auto bg-white shadow-sm my-8">
                        <div className="p-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 text-center">Advertisement</p>
                        </div>
                        <div className="flex justify-center p-4 min-h-[250px] items-center">
                          <AdContainer slot="1234567890" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Bottom Ad */}
            <AdSection>
              <AdContainer slot="1234567890" />
            </AdSection>
          </div>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}
