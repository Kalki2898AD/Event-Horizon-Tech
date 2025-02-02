import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const articleUrl = url.searchParams.get('url');

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'Article URL is required' },
        { status: 400 }
      );
    }

    // Try to get the article from Supabase cache first
    const { data: cachedArticle } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('url', articleUrl)
      .single();

    if (cachedArticle) {
      return NextResponse.json({ article: cachedArticle });
    }

    // Fetch the article content
    const response = await axios.get(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const dom = new JSDOM(response.data, { url: articleUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json(
        { error: 'Failed to parse article content' },
        { status: 400 }
      );
    }

    // Store in Supabase cache
    const newArticle = {
      id: articleUrl,
      url: articleUrl,
      title: article?.title || dom.window.document.title,
      content: article?.content || '',
      textContent: article?.textContent || '',
      excerpt: article?.excerpt || '',
      byline: article?.byline || '',
      dir: article?.dir || 'ltr',
      length: article?.length || 0,
      siteName: article?.siteName || '',
    };

    const { error: insertError } = await supabaseAdmin
      .from('articles')
      .insert(newArticle);

    if (insertError) {
      console.error('Error caching article:', insertError);
    }

    return NextResponse.json({ article: newArticle });
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
