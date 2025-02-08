import { NextRequest, NextResponse } from 'next/server';
import { fetchNews } from '@/lib/newsApi';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    console.log('Fetching news...');

    let articles: Article[] = [];
    if (query) {
      console.log('Searching news with query:', query);
      articles = await fetchNews(query);
    } else {
      console.log('Fetching tech news...');
      articles = await fetchNews();
    }

    // Final fallback to static data if NewsAPI fails
    if (!articles) {
      articles = [
        {
          title: "Unable to fetch live news",
          description: "We're experiencing technical difficulties. Please try again later.",
          url: "/",
          urlToImage: "/placeholder-news.jpg",
          publishedAt: new Date().toISOString(),
          source: {
            name: "Event Horizon Tech"
          }
        }
      ];
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found');
      return NextResponse.json({ articles: [] });
    }

    // Store articles in Supabase for caching
    if (articles.length > 0) {
      console.log('Storing articles in Supabase...');
      const { error } = await supabase
        .from('articles')
        .upsert(
          articles.map((article: Article) => ({
            ...article,
            created_at: new Date().toISOString(),
          })),
          { onConflict: 'url' }
        );

      if (error) {
        console.error('Error storing articles:', error);
      }
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles', articles: [] }, { status: 500 });
  }
}