import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractArticle } from '../../../../lib/articleExtractor';

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
    const article = await extractArticle(html, articleUrl);

    // Store article in database
    const { error: insertError } = await supabase
      .from('articles')
      .insert([{
        url: articleUrl,
        urlToImage,
        ...article
      }]);

    if (insertError) {
      console.error('Error storing article:', insertError);
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
