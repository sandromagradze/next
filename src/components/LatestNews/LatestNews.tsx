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
  type LatestNewsItem,
} from "@/lib/api/latestNews";
import {
  getCategoryNewsPageFromClient,
  getLatestNewsPageFromClient,
} from "@/lib/api/latestNews.client";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { sortByPublicationDate } from "@/lib/api/publicationDate";

import "./LatestNews.scss";

interface LatestNewsProps {
  lang: SupportedLanguageCode;
  initialArticles: LatestNewsItem[];
  categoryId?: number;
  categoryAlias?: string;
}

const INITIAL_COUNT = 15;
const LOAD_COUNT = 5;

export default function LatestNews({
  lang,
  initialArticles,
  categoryId,
  categoryAlias,
}: LatestNewsProps) {
  const uniqueInitialArticles = Array.from(
    new Map(
      initialArticles.map((article) => [article.id, article]),
    ).values(),
  );
  const isCategoryListing =
    categoryId !== undefined || categoryAlias !== undefined;

  const [articles, setArticles] =
    useState<LatestNewsItem[]>(
      () => uniqueInitialArticles.slice(0, INITIAL_COUNT),
    );

  const [isExpanded, setIsExpanded] =
    useState(isCategoryListing);

  const [isLoading, setIsLoading] =
    useState(false);

  const loadingRef = useRef(false);

  const [hasMore, setHasMore] =
    useState(true);

  /*
   * API page, რომელსაც შემდეგ მოვითხოვთ.
   */
  const nextPageRef = useRef(2);
  const requestedPagesRef = useRef(
    new Map<string, Promise<LatestNewsItem[]>>(),
  );

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
  >(uniqueInitialArticles.slice(INITIAL_COUNT));

  /*
   * უკვე ნაჩვენები article ID-ები.
   */
  const processedIdsRef = useRef(
    new Set(uniqueInitialArticles.map((article) => article.id)),
  );

  const loaderRef =
    useRef<HTMLDivElement | null>(null);

  const requestPageOnce = useCallback(
    (page: number) => {
      const key = `${lang}:${categoryId ?? "global"}:${categoryAlias ?? ""}:${page}`;
      const existingRequest =
        requestedPagesRef.current.get(key);

      if (existingRequest) {
        return existingRequest;
      }

      const request =
        isCategoryListing && categoryId !== undefined
          ? getCategoryNewsPageFromClient(
              lang,
              categoryId,
              page,
            ).then((categoryPage) => categoryPage.results)
          : getLatestNewsPageFromClient(lang, page);
      requestedPagesRef.current.set(key, request);
      void request.catch(() => {
        requestedPagesRef.current.delete(key);
      });

      return request;
    },
    [categoryAlias, categoryId, isCategoryListing, lang],
  );

  const loadMore = useCallback(async () => {
    if (
      loadingRef.current ||
      !isExpanded ||
      !hasMore
    ) {
      return;
    }

    loadingRef.current = true;
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
          await requestPageOnce(page);

        nextPageRef.current = page + 1;

        if (pageArticles.length === 0) {
          setHasMore(false);
          break;
        }

        /*
         * ახალი და უნიკალური სიახლეები.
         */
        const uniquePageArticles: LatestNewsItem[] = [];

        for (const article of pageArticles) {
          const matchesCategory =
            categoryId === undefined &&
            categoryAlias === undefined
              ? true
              : article.categories?.some(
                  (category) =>
                    (categoryId !== undefined &&
                      Number(category.id) === Number(categoryId)) ||
                    (categoryAlias !== undefined &&
                      category.alias === categoryAlias),
                ) === true;

          if (
            matchesCategory &&
            !processedIdsRef.current.has(article.id)
          ) {
            processedIdsRef.current.add(article.id);
            uniquePageArticles.push(article);
          }
        }

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
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [
    hasMore,
    isExpanded,
    categoryId,
    categoryAlias,
    requestPageOnce,
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
        {articles.map((article, index) => (
          <article
            key={article.id}
            className={`latest-news__card${
              isCategoryListing ? " latest-news__card--category" : ""
            }`}
          >
            <Link
              href={
                isCategoryListing
                  ? `/${lang}/article/${article.id}-${article.alias}`
                  : `/${lang}${article.url}`
              }
              className={
                isCategoryListing
                  ? "latest-news__category-link"
                  : "latest-news__link"
              }
            >
              {isCategoryListing ? (
                <>
                  <div className="latest-news__image-wrapper">
                    {article.image?.webp ? (
                      <Image
                        src={article.image.webp}
                        alt={article.title}
                        width={262}
                        height={148}
                        loading={
                          isCategoryListing && index < 2
                            ? "eager"
                            : "lazy"
                        }
                        className="latest-news__image"
                        sizes="(max-width: 768px) calc((100vw - 30px) * 0.4), 262px"
                      />
                    ) : article.image?.original ? (
                      <Image
                        src={article.image.original}
                        alt={article.title}
                        width={262}
                        height={148}
                        loading={
                          isCategoryListing && index < 2
                            ? "eager"
                            : "lazy"
                        }
                        className="latest-news__image"
                        sizes="(max-width: 768px) calc((100vw - 30px) * 0.4), 262px"
                      />
                    ) : (
                      <div className="latest-news__image-placeholder" />
                    )}
                  </div>

                  <div className="latest-news__text">
                    <time
                      dateTime={article.pub_dt || article.publish_up}
                      className="latest-news__time"
                    >
                      {article.publish_up || article.pub_dt}
                    </time>

                    <span className="latest-news__title">
                      {article.title}
                    </span>
                  </div>
                </>
              ) : (
                <>
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
                      dateTime={article.publish_up}
                      className="latest-news__time"
                    >
                      {article.publish_up}
                    </time>

                    <span className="latest-news__title">
                      {article.title}
                    </span>
                  </div>

                </>
              )}
            </Link>
          </article>
        ))}
      </div>
      {isCategoryListing ? (
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
      ) : (
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
          )}
        </div>
      )}
    </section>
  );
}
