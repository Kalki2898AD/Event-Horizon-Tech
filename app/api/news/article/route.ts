import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { ReadabilityArticle } from '@/app/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // First, check if we have the article cached in Supabase
    const { data: cachedArticle } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('url', url)
      .single();

    if (cachedArticle) {
      return NextResponse.json({ article: cachedArticle });
    }

    // If not cached, fetch and parse the article
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse() as ReadabilityArticle | null;

    if (!article) {
      return NextResponse.json(
        { error: 'Failed to parse article content' },
        { status: 400 }
      );
    }

    // Get the og:image or first image from the article
    const ogImage = dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const firstImage = dom.window.document.querySelector('img')?.getAttribute('src');
    const imageUrl = ogImage || firstImage;

    // Get the site name
    const siteName = dom.window.document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      new URL(url).hostname.replace('www.', '');

    const articleData = {
      id: url,
      url,
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      excerpt: article.excerpt,
      byline: article.byline,
      dir: article.dir,
      length: article.length,
      siteName,
      urlToImage: imageUrl,
      created_at: new Date().toISOString(),
    };

    // Cache the article in Supabase
    const { error: insertError } = await supabaseAdmin
      .from('articles')
      .upsert([articleData]);

    if (insertError) {
      console.error('Error caching article:', insertError);
    }

    return NextResponse.json({ article: articleData });
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
