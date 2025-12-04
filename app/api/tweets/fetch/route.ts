import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch tweet data from Twitter/X URL using oEmbed API
 * This is a free, no-auth API provided by Twitter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Tweet URL is required' },
        { status: 400 }
      );
    }

    // Normalize and validate Twitter/X URL
    // Handle both twitter.com and x.com, with or without www
    let normalizedUrl = url.trim();
    
    // Replace x.com with twitter.com for oEmbed API (it works with both)
    normalizedUrl = normalizedUrl.replace(/^https?:\/\/(www\.)?x\.com\//i, 'https://twitter.com/');
    
    // Validate Twitter/X URL pattern
    const twitterUrlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
    if (!twitterUrlPattern.test(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Invalid Twitter/X URL. Please provide a valid tweet link (e.g., https://twitter.com/username/status/1234567890 or https://x.com/username/status/1234567890)' },
        { status: 400 }
      );
    }

    // Use Twitter's oEmbed API to fetch tweet data
    // This API is free and doesn't require authentication
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}&omit_script=true`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Tweet not found. The tweet may be deleted, private, or the URL is incorrect.' },
          { status: 404 }
        );
      }
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract tweet information
    // The oEmbed API returns HTML, so we need to parse it
    const html = data.html || '';
    
    // Extract author from HTML or use author_name from oEmbed
    const authorMatch = html.match(/<a[^>]*>@(\w+)<\/a>/i) || 
                       data.author_name?.match(/@?(\w+)/i);
    const author = authorMatch ? authorMatch[1] : 'Unknown';
    
    // Extract tweet text - oEmbed HTML contains the tweet text
    // We'll use a simple regex to extract text content
    let tweetText = '';
    if (html) {
      // Remove HTML tags and get text content
      tweetText = html
        .replace(/<blockquote[^>]*>/gi, '')
        .replace(/<\/blockquote>/gi, '')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\n')
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    }

    // Get tweet date if available
    const tweetDate = data.created_at || new Date().toISOString();

    return NextResponse.json({
      success: true,
      tweet: {
        url: normalizedUrl, // Use normalized URL
        author: `@${author}`,
        text: tweetText || data.author_name || 'Tweet content',
        date: tweetDate,
        html: html, // Store HTML for embedding if needed
        authorUrl: data.author_url || `https://twitter.com/${author}`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tweet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tweet. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}

