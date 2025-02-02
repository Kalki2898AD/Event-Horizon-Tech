'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Article } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!session?.user?.email) return;

      const { data } = await supabase
        .from('saved_articles')
        .select()
        .eq('user_email', session.user.email)
        .eq('article_url', article.url)
        .single();

      setIsSaved(!!data);
    };

    checkSavedStatus();
  }, [session, article.url]);

  const handleSaveArticle = async () => {
    if (!session?.user?.email) return;

    try {
      if (isSaved) {
        await supabase
          .from('saved_articles')
          .delete()
          .eq('user_email', session.user.email)
          .eq('article_url', article.url);
      } else {
        await supabase
          .from('saved_articles')
          .insert([
            {
              user_email: session.user.email,
              article_url: article.url,
              article_title: article.title,
              article_image: article.urlToImage,
              saved_at: new Date().toISOString(),
            },
          ]);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error toggling article save:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={article.urlToImage || '/placeholder.jpg'}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={`/article/${encodeURIComponent(article.url)}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4">{article.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{article.source.name}</span>
          {session?.user && (
            <button
              onClick={handleSaveArticle}
              className={`px-3 py-1 rounded text-sm ${
                isSaved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}