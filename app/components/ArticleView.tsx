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
  article: Article;
}

export default function ArticleView({ article }: ArticleViewProps) {
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
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div className="relative h-96 mb-8">
        <Image
          src={article.urlToImage || '/placeholder.jpg'}
          alt={article.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      
      {/* Top ad */}
      <AdContainer 
        slot="5678901234"
        format="fluid"
        layout="in-article"
        className="mb-8"
      />

      <div className="prose prose-lg max-w-none">
        <p className="text-xl mb-8">{article.description}</p>
        <p className="text-gray-600">{article.content}</p>
      </div>

      {/* Bottom ad */}
      <AdContainer 
        slot="4321098765"
        format="fluid"
        layout="in-article"
        className="mt-8"
      />

      <div className="mt-8 flex justify-between items-center">
        <div className="text-gray-600">
          Source: {article.source.name}
        </div>
        {session?.user && (
          <button
            onClick={handleSaveArticle}
            className={`px-4 py-2 rounded ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </article>
  );
}