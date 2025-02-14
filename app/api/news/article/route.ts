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

    // Extract article content
    const article = await extractArticle(articleUrl);

    // Store article in database
    const { error: insertError } = await supabase
      .from('articles')
      .insert([{
        url: articleUrl,
        urlToImage,
        ...article,
        publishedAt: new Date().toISOString(),
        source: {
          id: null,
          name: new URL(articleUrl).hostname
        },
        author: 'Unknown'
      }]);

    if (insertError) {
      console.error('Error storing article:', insertError);
    }

    return NextResponse.json({
      ...article,
      url: articleUrl,
      urlToImage,
      publishedAt: new Date().toISOString(),
      source: {
        id: null,
        name: new URL(articleUrl).hostname
      },
      author: 'Unknown'
    });

  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
