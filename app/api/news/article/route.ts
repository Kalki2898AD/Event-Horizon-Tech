import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { createClient } from '@supabase/supabase-js';
import type { ReadabilityArticle } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleUrl = searchParams.get('url');
    const urlToImage = searchParams.get('urlToImage');

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'Article URL is required' },
        { status: 400 }
      );
    }

    // Check if article exists in database
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('*')
      .eq('url', articleUrl)
      .single();

    if (existingArticle) {
      return NextResponse.json(existingArticle);
    }

    // Fetch article content
    const response = await fetch(articleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article content');
    }

    // Extract site name from meta tags or URL
    const siteName = dom.window.document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      new URL(articleUrl).hostname.replace(/^www\./, '');

    // Create article object with parsed content
    const parsedArticle: ReadabilityArticle = {
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      excerpt: article.excerpt,
      length: article.length,
      siteName
    };

    // Store article in database
    const { error: insertError } = await supabase
      .from('articles')
      .insert([{
        url: articleUrl,
        urlToImage,
        ...parsedArticle
      }]);

    if (insertError) {
      console.error('Error storing article:', insertError);
    }

    return NextResponse.json(parsedArticle);
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
