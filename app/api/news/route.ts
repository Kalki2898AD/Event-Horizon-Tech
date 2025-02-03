import { NextResponse } from 'next/server';
import { fetchTechNews, searchNews } from '@/app/lib/newsApi';
import { getSupabaseClient } from '@/app/lib/supabase';
import type { Article } from '@/app/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    console.log('Fetching news...');

    let articles: Article[] = [];
    if (query) {
      console.log('Searching news with query:', query);
      articles = await searchNews(query);
    } else {
      console.log('Fetching tech news...');
      articles = await fetchTechNews();
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found');
      return NextResponse.json({ articles: [] });
    }

    // Store articles in Supabase for caching
    if (articles.length > 0) {
      console.log('Storing articles in Supabase...');
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
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