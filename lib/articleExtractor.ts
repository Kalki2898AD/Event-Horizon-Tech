import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';

export async function extractArticle(url: string) {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    return {
      title: article?.title || '',
      description: article?.excerpt || '',
      content: article?.content || '',
    };
  } catch (error) {
    console.error('Error extracting article:', error);
    throw error;
  }
} 