export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  fullContent?: string;
  source: {
    name: string;
  };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  subscribed_at: string;
  created_at: string;
  updated_at: string;
}