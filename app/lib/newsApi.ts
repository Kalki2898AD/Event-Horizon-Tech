import axios from 'axios';
import type { Article, NewsAPIResponse } from '@/app/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchTechNews(): Promise<Article[]> {
  try {
    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}/top-headlines`, {
      params: {
        category: 'technology',
        language: 'en',
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    if (response.data.status !== 'ok' || !Array.isArray(response.data.articles)) {
      console.error('Invalid response from News API:', response.data);
      return [];
    }

    return response.data.articles.map(article => ({
      ...article,
      id: article.url, // Use URL as ID
      content: article.content || article.description || '', // Ensure content is never null
    }));
  } catch (error) {
    console.error('Error fetching tech news:', error);
    return [];
  }
}

export async function searchNews(query: string): Promise<Article[]> {
  try {
    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}/everything`, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    if (response.data.status !== 'ok' || !Array.isArray(response.data.articles)) {
      console.error('Invalid response from News API:', response.data);
      return [];
    }

    return response.data.articles.map(article => ({
      ...article,
      id: article.url, // Use URL as ID
      content: article.content || article.description || '', // Ensure content is never null
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
}