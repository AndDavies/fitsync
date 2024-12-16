import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const RSS_FEEDS = [
  'https://boxlifemagazine.com/feed',
  'https://www.crossfitinvictus.com/blog/feed/',
  'https://www.boxrox.com/feed/'
];

type FeedItem = {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
};

export async function GET() {
  const parser = new Parser();
  let articles: FeedItem[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      // Take first few items from each feed to limit payload
      const feedArticles = (feed.items || []).slice(0, 5).map(item => ({
        title: item.title || 'No title',
        link: item.link || '#',
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet || ''
      }));
      articles = articles.concat(feedArticles);
    } catch (err: any) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, err.message);
    }
  }

  // Sort articles by date if available
  articles.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  // Limit the total number of articles
  articles = articles.slice(0, 10);

  return NextResponse.json({ articles });
}