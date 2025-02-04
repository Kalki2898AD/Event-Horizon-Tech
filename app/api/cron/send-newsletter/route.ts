import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

async function getSubscribersByFrequency(frequency: string) {
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('frequency', frequency);

  if (error) {
    throw new Error(`Failed to fetch ${frequency} subscribers: ${error.message}`);
  }

  return subscribers || [];
}

async function fetchLatestNews(): Promise<NewsArticle[]> {
  const response = await fetch(
    `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  const data = await response.json();
  return data.articles;
}

async function sendNewsletterToSubscriber(email: string, frequency: string, articles: NewsArticle[]) {
  const articlesList = articles
    .map(
      (article) => `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0;">${article.title}</h3>
          <p style="margin: 5px 0;">${article.description}</p>
          <a href="${article.url}" style="color: #0070f3; text-decoration: none;">Read More</a>
        </div>
      `
    )
    .join('');

  const { data, error } = await resend.emails.send({
    from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
    to: [email],
    subject: `Your ${frequency} Tech News Digest`,
    replyTo: 'budgetbuddy567@gmail.com',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your ${frequency} Tech News Digest</h1>
        <p>Here are the latest tech news stories for you:</p>
        ${articlesList}
        <div style="margin-top: 30px; text-align: center;">
          <p>Stay tuned for more tech news and updates!</p>
          <a href="https://eventhorizonlive.space" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
        </div>
      </div>
    `,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting newsletter distribution...');
    const results = [];

    // Daily newsletters
    const dailySubscribers = await getSubscribersByFrequency('daily');
    console.log(`Found ${dailySubscribers.length} daily subscribers`);

    const articles = await fetchLatestNews();
    console.log(`Fetched ${articles.length} articles`);

    for (const subscriber of dailySubscribers) {
      try {
        const result = await sendNewsletterToSubscriber(
          subscriber.email,
          'daily',
          articles
        );
        if (result) {
          results.push({
            email: subscriber.email,
            status: 'success',
            id: result.id
          });
        }
        
        // Update last_sent_at
        await supabase
          .from('newsletter_subscribers')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('email', subscriber.email);

      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        results.push({
          email: subscriber.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Newsletter distribution completed',
      results
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Newsletter distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to distribute newsletters' },
      { status: 500 }
    );
  }
}
