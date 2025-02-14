import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { fetchTodaysNews } from './api';
import { Article } from '../types';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function sendNewsletters() {
  try {
    const currentDate = new Date();
    const currentHour = currentDate.getUTCHours();
    
    // Get subscribers from Supabase where local time is 8 AM
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('send_hour', currentHour);

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) return;

    const news = await fetchTodaysNews();
    
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: 'news@eventhorizonlive.space',
        to: subscriber.email,
        subject: `EHTech News - Daily Update ${currentDate.toLocaleDateString()}`,
        html: generateNewsletterHTML(news)
      });
    }
  } catch (error) {
    console.error('Error sending newsletters:', error);
  }
}

function generateNewsletterHTML(articles: Article[]): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Today's Top Tech News</h1>
      ${articles.map(article => `
        <div style="margin-bottom: 20px;">
          <h2>${article.title}</h2>
          ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" style="max-width: 100%; height: auto;">` : ''}
          <p>${article.description}</p>
        </div>
      `).join('')}
    </div>
  `;
} 