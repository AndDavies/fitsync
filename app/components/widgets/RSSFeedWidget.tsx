import React, { useState, useEffect } from "react";
import Parser from "rss-parser";

// Define an interface for the Article type
interface Article {
  title: string;
  link: string;
  pubDate?: string; // Optional, as not all RSS feeds may have it
  contentSnippet?: string; // Optional, as not all RSS feeds may have it
}

const RSSFeedWidget: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        setLoading(true);
        const parser = new Parser();
        // URL to your feed
        const feed = await parser.parseURL("https://boxlifemagazine.com/feed/");

        if (feed && feed.items) {
          setArticles(feed.items.slice(0, 5)); // Display only the latest 5 articles for brevity
        }
      } catch (err) {
        console.error("Error fetching RSS feed:", err);
        setError("Failed to load RSS feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchRSSFeed();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-full h-32">
        <p>Loading RSS feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-full h-32">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-md flex flex-col items-start h-auto overflow-hidden">
      <h2 className="text-lg font-bold mb-4">Latest Articles from BoxLife Magazine</h2>
      <ul className="w-full px-4 space-y-4">
        {articles.map((article) => (
          <li
            key={article.link}
            className="bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col"
          >
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              <div className="text-md font-semibold">{article.title}</div>
            </a>
            <div className="text-sm text-gray-400 mt-1">
              Published: {new Date(article.pubDate).toLocaleDateString()}
            </div>
            <div className="text-sm mt-2 text-gray-300">
              {article.contentSnippet}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RSSFeedWidget;
