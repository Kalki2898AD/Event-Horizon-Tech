export interface Article {
  title: string;
  description: string;
  content: string;
  urlToImage: string | null;
  url: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
}

interface NewsAPIArticle {
  title: string;
  description: string | null;
  content: string | null;
  urlToImage: string | null;
  url: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
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