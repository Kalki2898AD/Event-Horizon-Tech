import axios from 'axios';
import type { Article, NewsAPIResponse } from '../types';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchNews(query?: string): Promise<Article[]> {
  try {
    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        category: 'technology',
        language: 'en',
        pageSize: 10,
        q: query
      }
    });

    return response.data.articles.map((article) => ({
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      urlToImage: article.urlToImage ?? '', // Use nullish coalescing to ensure urlToImage is always a string
      url: article.url,
      publishedAt: article.publishedAt,
      source: {
        id: article.source.id || null,
        name: article.source.name || ''
      },
      author: article.author || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
} 