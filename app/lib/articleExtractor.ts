import * as cheerio from 'cheerio';

interface ExtractedArticle {
  title: string;
  content: string[];
  images: Array<{
    url: string;
    position: number;
    caption?: string;
  }>;
  author?: string;
  publishedDate?: string;
}

interface ContentBlock {
  type: 'paragraph' | 'heading2' | 'heading3' | 'image' | 'list';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
}

export async function extractArticleContent(
  html: string,
  url: string,
  urlToImage?: string | null
): Promise<ExtractedArticle> {
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script, style, iframe, nav, footer, header, aside, .ad, .advertisement, .social-share, .related-articles, .comments').remove();
  
  // Extract title
  const title = $('h1').first().text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                '';
  
  // Extract author
  const author = $('meta[name="author"]').attr('content') ||
                $('meta[property="article:author"]').attr('content') ||
                $('[class*="author"]').first().text().trim() ||
                undefined;
  
  // Extract date
  const publishedDate = $('meta[property="article:published_time"]').attr('content') ||
                       $('meta[name="publishedDate"]').attr('content') ||
                       $('time').attr('datetime') ||
                       undefined;

  // Find the main content element
  let mainContentEl;
  const contentSelectors = [
    'article',
    '[class*="article-content"]',
    '[class*="post-content"]',
    '[class*="entry-content"]',
    'main',
    '.content'
  ];

  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      mainContentEl = el.first();
      break;
    }
  }

  if (!mainContentEl) {
    mainContentEl = $('body');
  }

  // Clean up the content area
  mainContentEl.find('script, style, iframe, .ad, .advertisement, noscript').remove();

  const contentBlocks: ContentBlock[] = [];
  const images: Array<{url: string; position: number; caption?: string}> = [];

  // Add the news card image if provided
  if (urlToImage) {
    images.push({
      url: urlToImage,
      position: 0,
      caption: 'Featured Image'
    });
    
    contentBlocks.push({
      type: 'image',
      content: '',
      imageUrl: urlToImage,
      imageCaption: 'Featured Image'
    });
  }

  function processNode(node: cheerio.Element) {
    const $node = $(node);
    const tagName = node.tagName.toLowerCase();

    // Skip empty nodes and unwanted elements
    if (!$node.text().trim() && !['img'].includes(tagName)) {
      return;
    }

    switch (tagName) {
      case 'h2':
        contentBlocks.push({
          type: 'heading2',
          content: $node.text().trim()
        });
        break;

      case 'h3':
        contentBlocks.push({
          type: 'heading3',
          content: $node.text().trim()
        });
        break;

      case 'p':
        const text = $node.text().trim();
        if (text.length > 0) {
          contentBlocks.push({
            type: 'paragraph',
            content: text
          });
        }
        break;

      case 'ul':
      case 'ol':
        const listItems = $node.find('li')
          .map((_, li) => $(li).text().trim())
          .get()
          .filter(text => text.length > 0);
        
        if (listItems.length > 0) {
          contentBlocks.push({
            type: 'list',
            content: '• ' + listItems.join('\n• ')
          });
        }
        break;

      case 'img':
        const src = $node.attr('src') || $node.attr('data-src') || $node.attr('data-lazy-src');
        if (src) {
          try {
            // Handle relative URLs and different URL formats
            let imageUrl = src;
            if (src.startsWith('//')) {
              imageUrl = 'https:' + src;
            } else if (src.startsWith('/')) {
              const urlObj = new URL(url);
              imageUrl = urlObj.origin + src;
            } else if (!src.startsWith('http')) {
              imageUrl = new URL(src, url).href;
            }

            // Skip tracking pixels and tiny images
            if (src.includes('tracking') || src.includes('pixel') || src.includes('analytics')) {
              return;
            }

            // Check if this image URL is already included
            if (!images.some(img => img.url === imageUrl)) {
              const caption = $node.attr('alt') || 
                            $node.next('figcaption').text().trim() ||
                            $node.parent().find('figcaption').text().trim();
              
              images.push({
                url: imageUrl,
                position: contentBlocks.length,
                caption: caption || undefined
              });
              
              contentBlocks.push({
                type: 'image',
                content: '',
                imageUrl,
                imageCaption: caption
              });
            }
          } catch (error) {
            console.error('Error processing image URL:', error);
          }
        }
        break;

      default:
        // Process child nodes for other elements
        $node.contents().each((_, child) => {
          if (child.type === 'text') {
            const text = $(child).text().trim();
            if (text.length > 0) {
              contentBlocks.push({
                type: 'paragraph',
                content: text
              });
            }
          } else {
            processNode(child);
          }
        });
    }
  }

  // Process the main content element
  mainContentEl.children().each((_, child) => processNode(child));

  // Convert content blocks to formatted HTML strings
  const formattedContent = contentBlocks.map(block => {
    switch (block.type) {
      case 'heading2':
        return `<h2 class="text-2xl font-bold mt-8 mb-4">${block.content}</h2>`;
      case 'heading3':
        return `<h3 class="text-xl font-semibold mt-6 mb-3">${block.content}</h3>`;
      case 'paragraph':
        return `<p class="mb-4 leading-relaxed">${block.content}</p>`;
      case 'list':
        return `<div class="mb-4 pl-4">${block.content}</div>`;
      case 'image':
        if (block.imageUrl) {
          return `<figure class="my-8">
            <div class="relative w-full h-96 rounded-lg overflow-hidden">
              <img src="${block.imageUrl}" alt="${block.imageCaption || ''}" class="object-cover w-full h-full" loading="lazy" />
            </div>
            ${block.imageCaption ? `<figcaption class="mt-2 text-sm text-gray-600 text-center">${block.imageCaption}</figcaption>` : ''}
          </figure>`;
        }
        return '';
      default:
        return '';
    }
  });

  return {
    title,
    content: formattedContent,
    images,
    author,
    publishedDate,
  };
}
