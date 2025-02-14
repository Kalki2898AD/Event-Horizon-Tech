import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';
import { Article } from '@/types';

interface ErrorResponse {
  error: string;
}

async function fetchAndParseArticle(url: string) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  
  return {
    title: article?.title || '',
    description: article?.excerpt || '',
    content: article?.content || '',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleUrl = searchParams.get('url');

    if (!articleUrl) {
      return NextResponse.json({ error: 'URL parameter is required' } as ErrorResponse);
    }

    const articleContent = await fetchAndParseArticle(articleUrl);
    
    // Create a complete Article object
    const article: Article = {
      url: articleUrl,
      title: articleContent.title,
      description: articleContent.description,
      content: articleContent.content,
      urlToImage: '', // You might want to extract this from the article
      publishedAt: new Date().toISOString(),
      source: {
        name: new URL(articleUrl).hostname
      },
      author: 'Unknown' // Or extract from the article if available
    };

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' } as ErrorResponse);
  }
}
