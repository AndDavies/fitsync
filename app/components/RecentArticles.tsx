"use client";

import React, { useEffect, useState } from "react";

type Article = {
  title: string;
  link: string;
  imageUrl?: string;
  pubDate?: string;
  contentSnippet?: string;
};

const RecentArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/content/articles");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch articles");
        }
        const data = await res.json();
        const limitedArticles = (data.articles || []).slice(0, 3);
        setArticles(limitedArticles);
      } catch (err: any) {
        console.error("Error fetching articles:", err.message);
        setError("Could not load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="p-4 bg-card rounded-xl border border-border text-card-foreground">
      <h3 className="text-lg font-semibold mb-4">Recommended Reads</h3>

      {loading && <p className="text-sm text-muted-foreground">Loading articles...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {articles && !loading && !error && articles.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No articles found.</p>
      )}

      {articles && !loading && !error && articles.length > 0 && (
        <ul className="space-y-4">
          {articles.map((article, idx) => (
            <li
              key={idx}
              className="bg-secondary p-3 rounded border border-border hover:border-accent transition relative"
            >
              {article.imageUrl && (
                <div className="w-full h-40 mb-3 overflow-hidden rounded">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold text-md hover:underline"
              >
                {article.title}
              </a>

              {article.pubDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Published: {new Date(article.pubDate).toLocaleDateString()}
                </p>
              )}

              {article.contentSnippet && (
                <p className="text-sm text-foreground mt-2 line-clamp-3 overflow-hidden">
                  {article.contentSnippet}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentArticles;