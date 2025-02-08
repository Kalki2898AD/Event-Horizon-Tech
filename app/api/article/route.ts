import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

interface ErrorResponse {
  error: string;
  status: number;
}

export async function GET(request: Request): Promise<NextResponse<Article | ErrorResponse>> {
  try {
    const url = new URL(request.url);
    const articleUrl = url.searchParams.get('url');

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required', status: 400 },
        { status: 400 }
      );
    }

    // Fetch article from Supabase
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('url', articleUrl)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found', status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(article as Article);
  } catch (error) {
    console.error('Error fetching article:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch article', status: 500 },
      { status: 500 }
    );
  }
}
