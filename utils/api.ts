import axios from 'axios';
import { Article } from '../types';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function fetchArticle(url: string): Promise<Article> {
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        apiKey: NEWS_API_KEY,
        q: url,
        pageSize: 1
      }
    });
    
    if (response.data.articles && response.data.articles.length > 0) {
      return response.data.articles[0];
    }
    throw new Error('Article not found');
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

export async function fetchTodaysNews(): Promise<Article[]> {
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        category: 'technology',
        language: 'en',
        pageSize: 10
      }
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
} 