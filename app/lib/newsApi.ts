import axios from 'axios';
import type { Article, NewsAPIResponse } from '@/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchNews(query?: string): Promise<Article[]> {
  try {
    const endpoint = query ? '/everything' : '/top-headlines';
    const params: Record<string, string> = {
      language: 'en',
      pageSize: '20',
      apiKey: NEWS_API_KEY || '',
    };

    if (query) {
      params.q = query;
      params.sortBy = 'relevancy';
    } else {
      params.category = 'technology';
    }

    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}${endpoint}`, { params });

    if (response.data.status !== 'ok' || !Array.isArray(response.data.articles)) {
      console.error('Invalid response from News API:', response.data);
      return [];
    }

    return response.data.articles.map((article) => ({
      source: {
        id: article.source.id || null,
        name: article.source.name || ''
      },
      author: article.author || null,
      title: article.title || '',
      description: article.description || '',
      url: article.url || '',
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || '',
      content: article.content || ''
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}