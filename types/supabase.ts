export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          url: string;
          urlToImage: string | null;
          publishedAt: string;
          author: string | null;
          source: {
            id: string | null;
            name: string;
          };
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
      };
    };
  };
} 