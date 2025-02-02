import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/app/lib/supabase';

interface NewsCardProps {
  article: Article;
  showSaveButton?: boolean;
}

const NewsCard = ({ article, showSaveButton = true }: NewsCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Check if article is already saved
      const { data } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('url', article.url)
        .single();

      if (data) {
        // Article exists, remove it
        await supabase
          .from('saved_articles')
          .delete()
          .eq('url', article.url);
        setIsSaved(false);
      } else {
        // Article doesn't exist, save it
        await supabase
          .from('saved_articles')
          .insert([article]);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {article.urlToImage && (
        <div className="relative h-48">
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          <Link href={`/article?url=${encodeURIComponent(article.url)}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{article.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{article.source.name}</span>
          <div className="flex items-center space-x-4">
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
    </div>
  );
};

export default NewsCard;