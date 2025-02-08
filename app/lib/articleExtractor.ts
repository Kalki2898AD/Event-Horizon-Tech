import { load } from 'cheerio';
import type { CheerioAPI, Cheerio, AnyNode } from 'cheerio';

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
  
  // Process content nodes
  let processedContent = '';
  mainContent.children().each((_, child) => {
    if ('tagName' in child) {
      const $node = $(child);
      const tagName = child.tagName?.toLowerCase();

      // Skip empty nodes and unwanted elements
      if (!$node.text().trim() && !['img'].includes(tagName)) {
        return;
      }

      // Process specific tags
      switch (tagName) {
        case 'p':
          processedContent += `<p>${$node.html()}</p>`;
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          processedContent += `<${tagName}>${$node.text()}</${tagName}>`;
          break;
        case 'img':
          const src = $node.attr('src');
          const alt = $node.attr('alt') || '';
          if (src) {
            processedContent += `<figure><img src="${src}" alt="${alt}" loading="lazy" />${
              alt ? `<figcaption>${alt}</figcaption>` : ''
            }</figure>`;
          }
          break;
        case 'pre':
        case 'code':
          processedContent += `<${tagName}>${$node.html()}</${tagName}>`;
          break;
        case 'blockquote':
          processedContent += `<blockquote>${$node.html()}</blockquote>`;
          break;
        case 'ul':
        case 'ol':
          processedContent += `<${tagName}>${$node.html()}</${tagName}>`;
          break;
        default:
          const html = $node.html();
          if (html) {
            processedContent += html;
          }
      }
    }
  });

  // Get text content and excerpt
  const textContent = mainContent.text().trim();
  const excerpt = textContent.slice(0, 200) + '...';

  return {
    title,
    content: processedContent || mainContent.html() || '',
    textContent,
    excerpt,
    length: textContent.length,
    siteName
  };
}

function findMainContent($: CheerioAPI): Cheerio<AnyNode> {
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
