import { load } from 'cheerio';
import type { AnyNode } from 'cheerio';

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
  url: string,
  urlToImage?: string | null
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
  const mainContent = $('article').first();
  const content = mainContent.length
    ? mainContent
    : $('main').first().length
    ? $('main').first()
    : findMainContent($);

  // Get text content and excerpt
  const textContent = content.text().trim();
  const excerpt = textContent.slice(0, 200) + '...';

  return {
    title,
    content: content.html() || '',
    textContent,
    excerpt,
    length: textContent.length,
    siteName
  };
}

function findMainContent($: cheerio.CheerioAPI) {
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

function processNode(node: AnyNode) {
  const $node = $(node);
  const tagName = node.tagName?.toLowerCase();

  // Skip empty nodes and unwanted elements
  if (!$node.text().trim() && !['img'].includes(tagName)) {
    return '';
  }

  // Process specific tags
  switch (tagName) {
    case 'p':
      return `<p>${$node.html()}</p>`;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return `<${tagName}>${$node.text()}</${tagName}>`;
    case 'img':
      const src = $node.attr('src');
      const alt = $node.attr('alt') || '';
      if (src) {
        return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${
          alt ? `<figcaption>${alt}</figcaption>` : ''
        }</figure>`;
      }
      return '';
    case 'pre':
    case 'code':
      return `<${tagName}>${$node.html()}</${tagName}>`;
    case 'blockquote':
      return `<blockquote>${$node.html()}</blockquote>`;
    case 'ul':
    case 'ol':
      return `<${tagName}>${$node.html()}</${tagName}>`;
    default:
      return $node.html() || '';
  }
}
