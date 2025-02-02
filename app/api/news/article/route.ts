import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/app/lib/supabase';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleUrl = searchParams.get('url');

  if (!articleUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Try to fetch from Supabase first
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('url', articleUrl)
      .single();

    if (!error && article && article.fullContent) {
      return NextResponse.json({ article });
    }

    // If not in Supabase or no full content, fetch and parse the article
    const response = await axios.get(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const dom = new JSDOM(response.data, { url: articleUrl });
    const reader = new Readability(dom.window.document);
    const article_content = reader.parse();

    const newArticle = {
      id: articleUrl,
      url: articleUrl,
      title: article_content?.title || dom.window.document.title,
      description: article_content?.excerpt || '',
      urlToImage: dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
      content: article_content?.textContent || '',
      fullContent: article_content?.content || '',
      source: { name: new URL(articleUrl).hostname },
      publishedAt: new Date().toISOString(),
    };

    // Store in Supabase
    await supabase.from('articles').upsert(newArticle);

    return NextResponse.json({ article: newArticle });
  } catch (error) {
    console.error('Error in article route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
