export interface Article {
  id?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
  user_email?: string;
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
  siteName: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}