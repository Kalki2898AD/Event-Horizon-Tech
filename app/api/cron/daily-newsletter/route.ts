import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
}

async function fetchLatestNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function shouldSendNewsletter(frequency: string): Promise<boolean> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = now.getDate();

  switch (frequency) {
    case 'daily':
      return true;
    case 'weekly':
      // Send on Mondays
      return dayOfWeek === 1;
    case 'monthly':
      // Send on the first day of the month
      return dayOfMonth === 1;
    default:
      return false;
  }
}

async function sendNewsletter(email: string, articles: NewsArticle[], frequency: string) {
  const frequencyText = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly'
  }[frequency];

  const articlesList = articles
    .map(
      (article) => `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0;">${article.title}</h3>
          <p style="margin: 5px 0;">${article.description || ''}</p>
          <a href="${article.url}" style="color: #0070f3; text-decoration: none;">Read More</a>
        </div>
      `
    )
    .join('');

  await resend.emails.send({
    from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
    to: [email],
    subject: `🚀 Your ${frequencyText} Tech News Digest`,
    replyTo: 'budgetbuddy567@gmail.com',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your ${frequencyText} Tech News Update 🚀</h1>
        
        <div style="margin-top: 30px;">
          ${articlesList}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://eventhorizonlive.space" 
             style="display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #0070f3; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px;
                    font-weight: bold;">
            Visit Our Website
          </a>
        </div>
      </div>
    `
  });
}

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const hour = now.getHours();

    // Only run at 8 AM
    if (hour !== 8) {
      return NextResponse.json({ message: 'Not newsletter time' });
    }

    // Get subscribers for each frequency
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email, frequency');

    if (fetchError) {
      throw fetchError;
    }

    // Group subscribers by frequency
    const groupedSubscribers = subscribers?.reduce((acc, sub) => {
      if (!acc[sub.frequency]) {
        acc[sub.frequency] = [];
      }
      acc[sub.frequency].push(sub.email);
      return acc;
    }, {} as Record<string, string[]>) || {};

    // Fetch latest news
    const articles = await fetchLatestNews();
    if (!articles.length) {
      throw new Error('No news articles available');
    }

    const results = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      failed: 0
    };

    // Send newsletters based on frequency
    for (const [frequency, emails] of Object.entries(groupedSubscribers)) {
      if (await shouldSendNewsletter(frequency)) {
        const sendResults = await Promise.allSettled(
          emails.map((email) => sendNewsletter(email, articles, frequency))
        );

        results[frequency as keyof typeof results] = sendResults.filter(
          (r) => r.status === 'fulfilled'
        ).length;
        results.failed += sendResults.filter((r) => r.status === 'rejected').length;
      }
    }

    return NextResponse.json({
      message: `Newsletters sent: Daily=${results.daily}, Weekly=${results.weekly}, Monthly=${results.monthly} (Failed=${results.failed})`,
      results
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletters' },
      { status: 500 }
    );
  }
}
