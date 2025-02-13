export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  id?: string; // Optional property
  byline?: string; // Optional property
  siteName?: string; // Optional property
  created_at?: string; // Optional property
  user_email?: string; // Optional property
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface ReadabilityArticle {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  length: number;
  siteName: string;
}
