import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, BookmarkPlus, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : '';

  return (
    <Card className="w-full h-full flex flex-col hover:shadow-lg transition-shadow duration-200" onClick={handleCardClick}>
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold mb-2 line-clamp-2">
              {article.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {article.source && (
                <Badge variant="secondary" className="mr-2">
                  {article.source.name}
                </Badge>
              )}
              {formattedDate}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
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
      </CardContent>

      <CardFooter className="flex-none">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            onShare?.(article);
          }}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isLoading || isSaved}
          >
            <BookmarkPlus className="h-4 w-4 mr-2" />
            {isSaved ? 'Saved' : isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="default" size="sm" onClick={(e) => {
            e.stopPropagation();
            onRead?.(article);
          }}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Read
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}