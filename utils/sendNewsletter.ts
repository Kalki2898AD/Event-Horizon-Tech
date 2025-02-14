import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { fetchTodaysNews } from './api';
import { Article } from '../types';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewsletters() {
  try {
    const currentDate = new Date();
    const timezones = getTimezonesAt8AM(currentDate);
    
    const subscribers = await prisma.subscriber.findMany({
      where: {
        timezone: {
          in: timezones
        }
      }
    });

    if (subscribers.length === 0) return;

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

function getTimezonesAt8AM(date: Date): string[] {
  const targetHour = 8;
  return moment.tz.names().filter(timezone => {
    const time = moment(date).tz(timezone);
    return time.hour() === targetHour && time.minute() === 0;
  });
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