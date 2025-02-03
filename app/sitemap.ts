import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .order('created_at', { ascending: false });

  const articleUrls = articles?.map((article) => ({
    url: `https://eventhorizonlive.space/article/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || [];

  // Static pages
  const staticPages = [
    {
      url: 'https://eventhorizonlive.space',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://eventhorizonlive.space/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://eventhorizonlive.space/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticPages, ...articleUrls];
}
