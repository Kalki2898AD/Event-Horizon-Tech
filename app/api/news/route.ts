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
        return NextResponse.json({ 
          status: 'error',
          error: 'Failed to fetch articles',
          articles: [] 
        }, { status: 500 });
      }

      articles = fallbackArticles || [];
    }

    // Ensure articles is always an array
    if (!Array.isArray(articles)) {
      articles = [];
    }

    // Return standardized response format
    return NextResponse.json({
      status: 'ok',
      articles: articles.map(article => ({
        source: {
          id: article.source?.id || null,
          name: article.source?.name || 'Unknown'
        },
        author: article.author || null,
        title: article.title || '',
        description: article.description || '',
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt || '',
        content: article.content || ''
      }))
    });
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to fetch articles',
        articles: [] 
      },
      { status: 500 }
    );
  }
}