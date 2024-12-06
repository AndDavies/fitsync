import React, { useState, useEffect } from "react";
import Parser from "rss-parser";

interface Article {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
}

const RSSFeedWidget: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        setLoading(true);
        const parser = new Parser();
        const feed = await parser.parseURL("https://boxlifemagazine.com/feed/");
        if (feed && feed.items) {
          // Convert items to typed Articles
          const parsedArticles: Article[] = feed.items.slice(0, 5).map((item) => ({
            title: item.title || "Untitled",
            link: item.link || "#",
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet || "No summary available.",
          }));
          setArticles(parsedArticles);
        }
      } catch (err) {
        console.error("Error fetching RSS feed:", err);
        setError("Failed to load RSS feed. Please try again later.");
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
    <div className="bg-slate-200 text-slate-900 p-4 rounded-3xl shadow-md flex flex-col items-center justify-between w-full max-w-md">
      <h2 className="text-lg font-bold mb-4 text-center">Latest Articles from BoxLife Magazine</h2>
      <ul className="w-full space-y-4">
        {articles.map((article) => (
          <li
            key={article.link}
            className="bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col"
          >
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              <div className="text-md font-semibold">{article.title}</div>
            </a>
            {article.pubDate && (
              <div className="text-sm text-gray-400 mt-1">
                Published: {new Date(article.pubDate).toLocaleDateString()}
              </div>
            )}
            {article.contentSnippet && (
              <div className="text-sm mt-2 text-gray-300">{article.contentSnippet}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RSSFeedWidget;
