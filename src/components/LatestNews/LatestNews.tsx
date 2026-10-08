"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import {
  getLatestNewsPageFromClient,
  type LatestNewsItem,
} from "@/lib/api/latestNews";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { sortByPublicationDate } from "@/lib/api/publicationDate";

import "./LatestNews.css";

interface LatestNewsProps {
  lang: SupportedLanguageCode;
  initialArticles: LatestNewsItem[];
}

const INITIAL_COUNT = 15;
const LOAD_COUNT = 5;

export default function LatestNews({
  lang,
  initialArticles,
}: LatestNewsProps) {
  const [articles, setArticles] =
    useState<LatestNewsItem[]>(
      initialArticles.slice(0, INITIAL_COUNT)
    );

  const [isExpanded, setIsExpanded] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [hasMore, setHasMore] =
    useState(true);

  /*
   * API page, რომელსაც შემდეგ მოვითხოვთ.
   */
  const nextPageRef = useRef(2);

  /*
   * API-დან წამოღებული, მაგრამ ჯერ
   * ეკრანზე არგამოტანილი სიახლეები.
   *
   * ეს საჭიროა იმისთვის, რომ თუ API-მ
   * 5-ზე მეტი სიახლე დააბრუნა, ისინი
   * არ დავკარგოთ.
   */
  const pendingArticlesRef = useRef<
    LatestNewsItem[]
  >([]);

  /*
   * უკვე ნაჩვენები article ID-ები.
   */
  const loadedIdsRef = useRef(
    new Set(
      initialArticles
        .slice(0, INITIAL_COUNT)
        .map((article) => article.id)
    )
  );

  const loaderRef =
    useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !isExpanded || !hasMore) {
      return;
    }

    setIsLoading(true);

    try {
      const nextArticles: LatestNewsItem[] = [];

      /*
       * ჯერ ვამოწმებთ უკვე წამოღებულ,
       * მაგრამ ჯერ არნაჩვენებ სიახლეებს.
       */
      while (
        nextArticles.length < LOAD_COUNT &&
        pendingArticlesRef.current.length > 0
      ) {
        const article =
          pendingArticlesRef.current.shift();

        if (!article) {
          break;
        }

        if (
          loadedIdsRef.current.has(article.id)
        ) {
          continue;
        }

        loadedIdsRef.current.add(article.id);

        nextArticles.push(article);
      }

      /*
       * თუ 5 სიახლე ჯერ კიდევ არ გვაქვს,
       * API-დან შემდეგ page-ს ვითხოვთ.
       */
      while (
        nextArticles.length < LOAD_COUNT &&
        hasMore
      ) {
        const page =
          nextPageRef.current;

        const pageArticles =
          await getLatestNewsPageFromClient(
            lang,
            page
          );

        nextPageRef.current = page + 1;

        if (pageArticles.length === 0) {
          setHasMore(false);
          break;
        }

        /*
         * ახალი და უნიკალური სიახლეები.
         */
        const uniquePageArticles =
          pageArticles.filter(
            (article) =>
              !loadedIdsRef.current.has(
                article.id
              )
          );

        /*
         * ჯერ ვიღებთ იმდენს, რამდენიც გვჭირდება.
         */
        const requiredCount =
          LOAD_COUNT - nextArticles.length;

        const articlesForCurrentBatch =
          uniquePageArticles.slice(
            0,
            requiredCount
          );

        for (const article of articlesForCurrentBatch) {
          loadedIdsRef.current.add(
            article.id
          );

          nextArticles.push(article);
        }

        /*
         * დარჩენილი სიახლეები ვინახავთ queue-ში,
         * რათა შემდეგი scroll-ისას ისინი
         * არ დაიკარგოს.
         */
        const remainingArticles =
          uniquePageArticles.slice(
            requiredCount
          );

        if (remainingArticles.length > 0) {
          pendingArticlesRef.current.push(
            ...remainingArticles
          );
        }

        /*
         * თუ API-მ მაგალითად 10 სიახლე დააბრუნა,
         * ჩვენ ახლა მხოლოდ 5 ვაჩვენებთ,
         * დანარჩენი 5 დარჩება pending-ში.
         */
        if (
          nextArticles.length >= LOAD_COUNT
        ) {
          break;
        }
      }

      if (nextArticles.length > 0) {
        setArticles((current) =>
          sortByPublicationDate(
            [...current, ...nextArticles],
            (article) =>
              article.pub_dt ||
              article.publish_up,
          ),
        );
      }

      /*
       * თუ ვეღარაფერი ვიპოვეთ,
       * ყველა სიახლე ნაჩვენებია.
       */
      if (
        nextArticles.length === 0 &&
        pendingArticlesRef.current.length === 0
      ) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(
        "Failed to load latest news:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    hasMore,
    isExpanded,
    isLoading,
    lang,
  ]);

  /*
   * Infinite scroll.
   */
  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const loader = loaderRef.current;

    if (!loader) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting
          ) {
            loadMore();
          }
        },
        {
          rootMargin: "100px",
        }
      );

    observer.observe(loader);

    return () => {
      observer.disconnect();
    };
  }, [isExpanded, loadMore]);

  /*
   * "დღის სხვა სიახლეები" ღილაკი.
   */
  const handleExpand = async () => {
    if (isExpanded || isLoading) {
      return;
    }

    setIsExpanded(true);

    /*
     * პირველი დამატებითი 5 სიახლე
     * ღილაკზე დაჭერისთანავე წამოვიდეს.
     */
    await loadMore();
  };

  return (
    <section className="latest-news">
      <div className="latest-news__list">
        {articles.map((article) => (
          <article
            key={article.id}
            className="latest-news__card"
          >
            <Link
              href={`/${lang}${article.url}`}
              className="latest-news__link"
            >
              <div className="latest-news__image-wrapper">
                {article.image?.webp ? (
                  <Image
                    src={article.image.webp}
                    alt={article.title}
                    width={262}
                    height={148}
                    loading="lazy"
                    className="latest-news__image"
                    sizes="(max-width: 768px) calc((100vw - 30px) * 0.4), 262px"
                  />
                ) : article.image?.original ? (
                  <Image
                    src={article.image.original}
                    alt={article.title}
                    width={262}
                    height={148}
                    className="latest-news__image"
                    sizes="(max-width: 768px) calc((100vw - 30px) * 0.4), 262px"
                  />
                ) : (
                  <div className="latest-news__image-placeholder" />
                )}
              </div>

              <div className="latest-news__text">
                <time
                  dateTime={
                    article.publish_up
                  }
                  className="latest-news__time"
                >
                  {article.publish_up}
                </time>

                <span className="latest-news__title">
                  {article.title}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
<div className="latest-news__expand-content">
      {!isExpanded && (
        <button
          type="button"
          className="latest-news__expand"
          onClick={handleExpand}
        >
            
          <span className="latest-news__expand-text">
            დღის სხვა სიახლეები
          </span>

          <span
            className="latest-news__arrow"
            aria-hidden="true"
          />
        </button>
      )}

      {isExpanded && (
        <div
          ref={loaderRef}
          className="latest-news__loader"
        >
          {isLoading && (
            <span>იტვირთება...</span>
          )}

          {!isLoading && !hasMore && (
            <span>
              ყველა სიახლე ნაჩვენებია
            </span>
          )}
        </div>
      )}</div>
    </section>
  );
}