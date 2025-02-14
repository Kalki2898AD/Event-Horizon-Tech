export interface Article {
  title: string;
  description: string;
  content: string;
  urlToImage: string;
  url: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface Subscriber {
  id: string;
  email: string;
  timezone: string;
  createdAt: Date;
} 