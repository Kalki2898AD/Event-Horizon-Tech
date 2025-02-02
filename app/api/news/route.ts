import { NextResponse } from 'next/server';
import { fetchTechNews, searchNews } from '@/app/lib/newsApi';
import { supabase } from '@/app/lib/supabase';
import type { Article } from '@/app/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  console.log('Fetching news...');

  try {
    let articles: Article[] = [];
    if (query) {
      console.log('Searching news with query:', query);
      articles = await searchNews(query);
    } else {
      console.log('Fetching tech news...');
      articles = await fetchTechNews();
    }

    if (!articles || articles.length === 0) {
      console.error('No articles returned');
      return NextResponse.json({ error: 'No articles available' }, { status: 404 });
    }

    console.log(`Received ${articles.length} articles`);

    // Store articles in Supabase for caching
    if (articles.length > 0) {
      console.log('Storing articles in Supabase...');
      const { error } = await supabase
        .from('articles')
        .upsert(
          articles.map((article: Article) => ({
            ...article,
            created_at: new Date().toISOString(),
          }))
        );

      if (error) {
        console.error('Error storing articles in Supabase:', error);
      } else {
        console.log('Articles stored in Supabase');
      }
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in news route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}