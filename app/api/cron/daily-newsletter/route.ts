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
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
          <h3 style="margin: 0; color: #333;">${article.title}</h3>
          <p style="margin: 10px 0; color: #666;">${article.description || ''}</p>
          <a href="${article.url}" 
             style="display: inline-block;
                    color: #0070f3;
                    text-decoration: none;
                    font-weight: 500;">
            Read More →
          </a>
        </div>
      `
    )
    .join('');

  const emailResult = await resend.emails.send({
    from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
    to: [email],
    subject: `🚀 Your ${frequencyText} Tech News Digest`,
    replyTo: 'budgetbuddy567@gmail.com',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
          Your ${frequencyText} Tech News Update 🚀
        </h1>
        
        <div style="margin: 30px 0;">
          ${articlesList}
        </div>
        
        <div style="margin-top: 40px; text-align: center;">
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

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Have questions or feedback? Just reply to this email!</p>
          <p style="margin-top: 20px;">
            You're receiving this because you subscribed to ${frequencyText} updates from Event Horizon Tech.
          </p>
        </div>
      </div>
    `
  });

  return emailResult;
}

export async function GET(request: Request) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest news
    const articles = await fetchLatestNews();
    if (articles.length === 0) {
      return NextResponse.json({ error: 'No news articles available' }, { status: 404 });
    }

    // Get all subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email, frequency');

    if (fetchError) {
      console.error('Error fetching subscribers:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers found' }, { status: 200 });
    }

    // Send newsletters
    const results = [];
    for (const subscriber of subscribers) {
      if (await shouldSendNewsletter(subscriber.frequency)) {
        try {
          const result = await sendNewsletter(subscriber.email, articles, subscriber.frequency);
          results.push({ 
            email: subscriber.email, 
            status: 'success', 
            data: result 
          });
        } catch (error) {
          console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
          results.push({ 
            email: subscriber.email, 
            status: 'failed', 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Newsletter process completed',
      results
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
