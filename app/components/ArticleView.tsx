'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import AdContainer from './AdContainer';
import { getSupabaseClient } from '@/app/lib/supabase';

interface ArticleViewProps {
  url: string;
  onError?: (error: string) => void;
}

interface ArticleContent {
  title: string;
  content: string;
  byline?: string;
  siteName?: string;
  urlToImage?: string;
}

export default function ArticleView({ url, onError }: ArticleViewProps) {
  const { data: session } = useSession();
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (error) {
        console.error('Error fetching article:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchArticle();
    }
  }, [url, onError]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!session?.user?.email) return;

      try {
        const supabaseClient = getSupabaseClient();
        const { data } = await supabaseClient
          .from('saved_articles')
          .select()
          .eq('url', url)
          .single();

        setIsSaved(!!data);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [session, url]);

  const handleSave = async () => {
    if (!session?.user?.email || !article) return;

    try {
      setSaveLoading(true);

      const supabaseClient = getSupabaseClient();

      if (isSaved) {
        await supabaseClient
          .from('saved_articles')
          .delete()
          .eq('url', url);
        setIsSaved(false);
      } else {
        await supabaseClient.from('saved_articles').insert([
          {
            url,
            title: article.title,
            content: article.content,
            user_email: session.user.email,
          },
        ]);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Failed to load article content.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose lg:prose-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="mb-0">{article.title}</h1>
          {session?.user && (
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className={`px-4 py-2 rounded ${
                isSaved
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isSaved ? 'Saved' : 'Save Article'}
            </button>
          )}
        </div>

        {/* Featured Image */}
        {article.urlToImage && (
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Top ad */}
        <div className="my-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Advertisement</h3>
            <AdContainer 
              slot="5891354408"
              format="fluid"
              layout="in-article"
            />
          </div>
        </div>

        {/* Article content */}
        <div
          className="mt-8 article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.byline && (
          <div className="mt-8 text-gray-600">
            By {article.byline}
          </div>
        )}

        {article.siteName && (
          <div className="mt-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Read on {article.siteName}
            </a>
          </div>
        )}

        {/* Bottom ad */}
        <div className="my-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Advertisement</h3>
            <AdContainer 
              slot="5891354408"
              format="fluid"
              layout="in-article"
            />
          </div>
        </div>
      </article>
    </div>
  );
}