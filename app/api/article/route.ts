import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const featuredImage = searchParams.get('urlToImage');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Try to fetch the article with proper headers
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, iframe, nav, footer, header, aside, .ad, .advertisement, .social-share, .related-articles, .comments').remove();

    // Get title
    const title = $('h1').first().text().trim() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('title').text().trim();

    // Get main content
    const mainContent = $('article') || $('.article-content') || $('.post-content') || $('main');
    let content = '';

    if (mainContent.length) {
      // If we have a featured image, remove any matching images from the content
      if (featuredImage) {
        mainContent.find('img').each((_, img) => {
          const imgSrc = $(img).attr('src');
          if (imgSrc && (
            imgSrc === featuredImage || 
            imgSrc.includes(new URL(featuredImage).pathname)
          )) {
            $(img).closest('figure').remove(); // Remove figure if it exists
            $(img).remove(); // Remove the img itself
          }
        });
      }
      content = mainContent.html() || '';
    } else {
      // Fallback: get all paragraphs
      content = $('p').map((_, el) => $(el).html()).get().join('');
    }

    // Fix relative image URLs
    content = content.replace(/src="\/([^"]*)"/g, (match, path) => {
      try {
        const baseUrl = new URL(url);
        return `src="${baseUrl.origin}/${path}"`;
      } catch {
        return match;
      }
    });

    // Clean up any empty paragraphs or divs that might be left after removing images
    content = content.replace(/<p>\s*<\/p>/g, '');
    content = content.replace(/<div>\s*<\/div>/g, '');

    return NextResponse.json({
      title,
      content,
      url
    });

  } catch (error: any) {
    console.error('Error in article route:', error);
    
    const errorMessage = error.response?.status 
      ? `Failed to fetch article (${error.response.status})`
      : error.code === 'ECONNABORTED'
      ? 'Request timed out'
      : 'Failed to fetch article';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
