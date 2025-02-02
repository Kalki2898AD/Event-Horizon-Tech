import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/app/lib/supabase';
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
    const { data: cachedArticle } = await supabase
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
      description: article?.excerpt || '',
      urlToImage: dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
      content: article?.textContent || '',
      fullContent: article?.content || '',
      source: { name: new URL(articleUrl).hostname },
      publishedAt: new Date().toISOString(),
    };

    const { data: savedArticle, error: saveError } = await supabase
      .from('articles')
      .upsert([newArticle])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving article:', saveError);
      // Continue without caching
    }

    return NextResponse.json({
      article: savedArticle || newArticle,
    });
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
