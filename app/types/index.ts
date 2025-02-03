export interface Article {
  id: string;
  url: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  urlToImage: string;
  byline: string;
  siteName: string;
  created_at: string;
  user_email: string;
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
  byline: string;
  dir: string;
  siteName?: string;
  urlToImage?: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles: Article[];
}