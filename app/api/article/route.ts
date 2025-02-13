import { NextResponse } from 'next/server';
import type { Article } from '@/types';
import * as cheerio from 'cheerio';

interface ErrorResponse {
  error: string;
  status: number;
}

async function fetchAndParseArticle(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, iframe, nav, header, footer, .ads, .social-share, .comments').remove();

  // Get the main content
  const article = $('article').first();
  const content = article.length ? article.html() : $('main').first().html() || $('body').html();

  // Clean the content
  const cleanContent = content
    ?.replace(/<a[^>]*>/g, '') // Remove links
    .replace(/<\/a>/g, '')
    .replace(/class="[^"]*"/g, '') // Remove classes
    .replace(/id="[^"]*"/g, '') // Remove IDs
    .replace(/style="[^"]*"/g, '') // Remove inline styles
    .trim();

  return {
    title: $('h1').first().text() || $('title').text(),
    description: $('meta[name="description"]').attr('content') || '',
    content: cleanContent || '',
  };
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

    try {
      const articleContent = await fetchAndParseArticle(articleUrl);
      
      return NextResponse.json({
        ...articleContent,
        url: articleUrl,
      });
    } catch (error) {
      console.error('Error fetching article content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article content', status: 500 },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in article API:', error);
    return NextResponse.json(
      { error: 'Internal server error', status: 500 },
      { status: 500 }
    );
  }
}
