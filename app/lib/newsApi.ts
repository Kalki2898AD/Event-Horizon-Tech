import axios from 'axios';
import type { Article, NewsAPIResponse } from '@/app/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchNews(query?: string): Promise<Article[]> {
  try {
    const endpoint = query ? '/everything' : '/top-headlines';
    const params: any = {
      language: 'en',
      pageSize: 20,
      apiKey: NEWS_API_KEY,
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
      title: article.title || '',
      description: article.description || '',
      url: article.url || '',
      urlToImage: article.urlToImage || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: article.source?.name || '',
      content: article.content || '',
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}