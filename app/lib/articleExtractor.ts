import { load } from 'cheerio';
import type { CheerioAPI } from 'cheerio';

interface ExtractedArticle {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  length: number;
  siteName: string;
}

export async function extractArticle(
  html: string,
  url: string
): Promise<ExtractedArticle> {
  const $ = load(html);
  
  // Remove unwanted elements
  $('script, style, iframe, nav, footer, header, aside, .ad, .advertisement, .social-share, .related-articles, .comments').remove();

  // Get the title
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    '';

  // Get the site name
  const siteName =
    $('meta[property="og:site_name"]').attr('content') ||
    new URL(url).hostname.replace('www.', '');

  // Get the main content
  const mainContent = findMainContent($);
  const content = mainContent.html() || '';
  const textContent = mainContent.text().trim();
  const excerpt = textContent.slice(0, 200) + '...';

  return {
    title,
    content,
    textContent,
    excerpt,
    length: textContent.length,
    siteName
  };
}

function findMainContent($: CheerioAPI) {
  // Try to find article or main content first
  const article = $('article').first();
  if (article.length) {
    return article;
  }

  const main = $('main').first();
  if (main.length) {
    return main;
  }

  // Find the element with the most text content
  let maxTextLength = 0;
  let mainElement = $('body');

  $('div, section').each((_, element) => {
    const $element = $(element);
    const textLength = $element.text().trim().length;

    if (textLength > maxTextLength) {
      maxTextLength = textLength;
      mainElement = $element;
    }
  });

  return mainElement;
}
