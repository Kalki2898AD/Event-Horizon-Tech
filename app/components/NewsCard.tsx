import { useState } from 'react';
import Image from 'next/image';
import type { Article } from '@/types';
import { useRouter } from 'next/navigation';

interface NewsCardProps {
  article: Article;
  onShare?: (article: Article) => void;
  onSave?: (article: Article) => void;
  onRead?: (article: Article) => void;
}

export function NewsCard({ article, onShare, onSave, onRead }: NewsCardProps) {
  const [isImageError, setIsImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't navigate if clicking the save button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const params = new URLSearchParams({
      url: article.url,
      urlToImage: article.urlToImage || ''
    });
    router.push(`/article?${params.toString()}`);
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click when clicking save button
    
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/articles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString()
    : '';

  return (
    <div 
      className="w-full h-full flex flex-col rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500">
              {article.source && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold mr-2">
                  {article.source}
                </span>
              )}
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex-1">
        {article.urlToImage && !isImageError && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-md"
              onError={() => setIsImageError(true)}
              priority
            />
          </div>
        )}
        <p className="text-gray-600 line-clamp-3">{article.description}</p>
      </div>

      <div className="flex items-center p-6 pt-0">
        <div className="flex justify-between w-full">
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-transparent border border-gray-200 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(article);
            }}
          >
            Share
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-transparent border border-gray-200 hover:bg-gray-50"
            onClick={handleSave}
            disabled={isLoading || isSaved}
          >
            {isSaved ? 'Saved' : isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onRead?.(article);
            }}
          >
            Read
          </button>
        </div>
      </div>
    </div>
  );
}