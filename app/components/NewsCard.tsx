'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsCardProps {
  article: Article;
  showSaveButton?: boolean;
}

export default function NewsCard({ article, showSaveButton = true }: NewsCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the save button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/article?url=${encodeURIComponent(article.url)}`);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking save button
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (!isSaved) {
        const { error } = await supabase
          .from('saved_articles')
          .insert([{ article_id: article.id }]);
        
        if (error) throw error;
        setIsSaved(true);
      } else {
        const { error } = await supabase
          .from('saved_articles')
          .delete()
          .eq('article_id', article.id);
        
        if (error) throw error;
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
    >
      {article.urlToImage && (
        <div className="relative w-full h-48">
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={true}
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white line-clamp-2 pointer-events-none">
          <Link href={`/article?url=${encodeURIComponent(article.url)}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm pointer-events-none">
          {article.description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
          <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
          {showSaveButton && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-3 py-1 rounded ${
                isSaved
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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