import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const articleUrl = url.searchParams.get('url');

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
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
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article as Article);
  } catch (error: any) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
