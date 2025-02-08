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
  url: string;
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
        const response = await fetch(
          `/api/article?url=${encodeURIComponent(url)}${urlToImage ? `&urlToImage=${encodeURIComponent(urlToImage)}` : ''}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch article');
        }

        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        onError('Failed to load article content');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [url, urlToImage, onError]);

  // Add CSS to fix image sizes in the article content
  useEffect(() => {
    // Add a style tag to handle article images
    const style = document.createElement('style');
    style.textContent = `
      .article-content img {
        max-width: 100% !important;
        height: auto !important;
        margin: 1rem auto !important;
        display: block !important;
      }
      .article-content figure {
        margin: 1rem auto !important;
        max-width: 100% !important;
      }
      .article-content figure img {
        margin: 0 auto !important;
      }
      .article-content iframe {
        max-width: 100% !important;
        margin: 1rem auto !important;
        display: block !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className="max-w-4xl mx-auto px-4">
      {/* Top Ad */}
      <div className="max-w-7xl mx-auto bg-white shadow-sm my-8">
        <div className="p-2 border-b border-gray-100">
          <p className="text-xs text-gray-500 text-center">Advertisement</p>
        </div>
        <div className="flex justify-center p-4 min-h-[250px] items-center">
          <AdContainer slot="1234567890" format="auto" />
        </div>
      </div>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{article.title}</h1>
          
          {/* Featured Image */}
          {urlToImage && (
            <div className="relative mb-8">
              <Image
                src={urlToImage}
                alt={article.title}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none article-content"
            dangerouslySetInnerHTML={{ 
              __html: article.content.replace(
                /<img([^>]*)>/g,
                (match, p1) => `<Image src="${match.substring(4, match.length - 1)}" alt="${article.title}" ${p1} style="max-width:100%; height:auto; margin:1rem auto; display:block;" />`
              )
            }}
          />
        </div>
      </article>

      {/* Bottom Ad */}
      <div className="max-w-7xl mx-auto bg-white shadow-sm my-8">
        <div className="p-2 border-b border-gray-100">
          <p className="text-xs text-gray-500 text-center">Advertisement</p>
        </div>
        <div className="flex justify-center p-4 min-h-[250px] items-center">
          <AdContainer slot="5432109876" format="auto" />
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}