'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdContainer from './AdContainer';
import { Article } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ArticleViewProps {
  url: string;
  onError: (error: string) => void;
}

export default function ArticleView({ url, onError }: ArticleViewProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/news/article?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        onError('Failed to load article. Redirecting to original source...');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [url, onError]);

  useEffect(() => {
    async function checkSavedStatus() {
      if (!session?.user?.email || !article) return;

      const { data } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_email', session.user.email)
        .eq('url', article.url)
        .single();

      setIsSaved(!!data);
    }

    checkSavedStatus();
  }, [session?.user?.email, article]);

  const handleSaveArticle = async () => {
    if (!session?.user?.email || !article) return;

    try {
      if (isSaved) {
        await supabase
          .from('saved_articles')
          .delete()
          .eq('user_email', session.user.email)
          .eq('url', article.url);
      } else {
        await supabase.from('saved_articles').insert([
          {
            user_email: session.user.email,
            url: article.url,
            title: article.title,
            description: article.description,
            image_url: article.urlToImage,
            published_at: article.publishedAt,
          },
        ]);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  if (loading) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        
        {article.urlToImage && (
          <div className="relative w-full h-64 md:h-96 mb-8">
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="text-gray-600">
            {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          {session?.user && (
            <button
              onClick={handleSaveArticle}
              className={`px-4 py-2 rounded-md ${
                isSaved
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSaved ? 'Unsave Article' : 'Save Article'}
            </button>
          )}
        </div>

        <AdContainer 
          slot="5678901234"
          format="fluid"
          layout="in-article"
        />

        <div
          className="mt-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-8">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Read original article
          </a>
        </div>

        <AdContainer 
          slot="4321098765"
          format="fluid"
          layout="in-article"
        />
      </article>
    </div>
  );
}