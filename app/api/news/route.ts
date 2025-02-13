import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/newsApi';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    console.log('Fetching news with query:', query || 'tech news');
    
    let articles: Article[] = [];
    articles = await fetchNews(query || undefined);

    // Final fallback to static data if NewsAPI fails
    if (!articles || articles.length === 0) {
      console.log('No articles found, using fallback data...');
      const { data: fallbackArticles, error } = await supabase
        .from('articles')
        .select('*')
        .order('publishedAt', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching fallback articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
      }

      articles = fallbackArticles || [];
    }

    // Store articles in Supabase for caching
    if (articles.length > 0) {
      console.log('Storing articles in Supabase...');
      const { error } = await supabase
        .from('articles')
        .upsert(
          articles.map((article: Article) => ({
            ...article,
            id: article.url,
          }))
        );

      if (error) {
        console.error('Error storing articles:', error);
      }
    }

    // Only return necessary article data with minimal information
    const sanitizedArticles = articles.map(article => ({
      title: article.title || '',
      description: article.description || '',
      urlToImage: article.urlToImage || '',
      url: article.url || '',
      source: { name: '' }  // Add empty source to prevent undefined errors
    }));

    return NextResponse.json({ articles: sanitizedArticles });
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}