"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface SearchResultProps {
  search: string;
  lang: string;
}

interface ArticleImage {
  original: string;
  position: [number, number];
  thumb: string;
  webp: string;
}

interface SearchArticle {
  alias: string;
  gallery: unknown;
  id: number;
  image: ArticleImage | null;
  introtext: string;
  pub_dt: string;
  publish_up: string;
  show_ns: boolean;
  slider: unknown;
  title: string;
  url: string;
  video: unknown;
}

interface SearchResponse {
  pagination: {
    count: number;
  };
  results: SearchArticle[];
}

export default function SearchResult({
  search,
  lang,
}: SearchResultProps) {
  const [results, setResults] = useState<SearchArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = search.trim();

    if (query.length < 4) {
      return;
    }

    const controller = new AbortController();

    const searchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const body = new URLSearchParams();

        body.append("cat", "");
        body.append("datefrom", "");
        body.append("datetill", "");
        body.append("from_date", "");
        body.append("page", "1");
        body.append("q", query);
        body.append("to_date", "");

        const response = await fetch(
          `https://dev.ipn.ge/${lang}/api/search/`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: body.toString(),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Search request failed: ${response.status}`,
          );
        }

        const data: SearchResponse = await response.json();

        setResults(data.results || []);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Search error:", err);

        setError("Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(searchArticles, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, lang]);

  const getImageUrl = (
    image: ArticleImage | null,
  ): string => {
    if (!image) return "";

    if (image.webp) {
      return `https://cdn2.ipn.ge/media/${image.webp}`;
    }

    if (image.original) {
      return `https://cdn2.ipn.ge/media/${image.original}`;
    }

    return "";
  };

  const getArticleUrl = (url: string): string => {
    if (!url) return "#";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `/${lang}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <div className="search-result">
      {loading && (
        <div className="search-result__message">
          Searching...
        </div>
      )}

      {!loading && error && (
        <div className="search-result__message search-result__message--error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        results.length === 0 && (
          <div className="search-result__message">
            No results found
          </div>
        )}

      {!loading && results.length > 0 && (
        <div className="search-result__list">
          {results.map((article) => {
            const imageUrl = getImageUrl(article.image);

            return (
              <Link
                key={article.id}
                href={getArticleUrl(article.url)}
                className="search-result__item"
              >
                {imageUrl && (
                  <div className="search-result__image-wrapper">
                    <Image
                      src={imageUrl}
                      alt={article.title}
                      width={90}
                      height={60}
                      className="search-result__image"
                      sizes="90px"
                    />
                  </div>
                )}

                <div className="search-result__content">
                  <h3 className="search-result__title">
                    {article.title}
                  </h3>

                  <span className="search-result__date">
                    {article.publish_up}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}