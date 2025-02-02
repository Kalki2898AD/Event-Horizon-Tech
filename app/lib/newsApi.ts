import axios from 'axios';
import type { Article } from './supabase';

// You'll need to replace this with your actual NewsAPI key from https://newsapi.org/
const NEWS_API_KEY = 'b77f5b1e5a974cacb6b0b6d17405129b';
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchTechNews(): Promise<Article[]> {
  try {
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        category: 'technology',
        language: 'en',
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching tech news:', error);
    return [];
  }
}

export async function searchNews(query: string): Promise<Article[]> {
  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
}