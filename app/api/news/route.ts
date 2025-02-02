import { NextResponse } from 'next/server';
import { fetchTechNews, searchNews } from '@/app/lib/newsApi';
import { supabase } from '@/app/lib/supabase';
import type { Article } from '@/app/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  console.log('Fetching news...');

  try {
    let articles;
    if (query) {
      console.log('Searching news with query:', query);
      articles = await searchNews(query);
    } else {
      console.log('Fetching tech news...');
      articles = await fetchTechNews();
    }

    console.log(`Received ${articles.length} articles`);

    if (!articles || articles.length === 0) {
      console.error('No articles returned');
      throw new Error('No articles available');
    }

    // Store articles in Supabase for caching
    console.log('Storing articles in Supabase...');
    await supabase
      .from('articles')
      .upsert(
        articles.map((article: Article) => ({
          ...article,
          id: article.url,
          created_at: new Date().toISOString(),
        }))
      );

    console.log('Articles stored in Supabase');

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in news route:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}