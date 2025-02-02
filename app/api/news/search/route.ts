import { NextResponse } from 'next/server';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function GET(request: Request) {
  if (!NEWS_API_KEY) {
    return NextResponse.json(
      { error: 'News API key is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
      timeout: 5000, // 5 second timeout
    });

    if (!response.data?.articles || !Array.isArray(response.data.articles)) {
      throw new Error('Invalid response from News API');
    }

    const articles = response.data.articles.map((article: any) => ({
      id: article.url,
      title: article.title || 'Untitled',
      description: article.description || '',
      url: article.url,
      urlToImage: article.urlToImage || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
      content: article.content || '',
      source: {
        name: article.source?.name || new URL(article.url).hostname,
      },
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in search route:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      
      if (error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 500 }
        );
      }

      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
