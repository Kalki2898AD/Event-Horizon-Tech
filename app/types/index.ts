export interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: string;
  content?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  subscribed_at: string;
  created_at: string;
  updated_at: string;
}

// Readability article type
export interface ReadabilityArticle {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  siteName: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles: Article[];
}