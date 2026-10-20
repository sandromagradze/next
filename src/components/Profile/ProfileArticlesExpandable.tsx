"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ProfileArticleList from "@/components/Profile/ProfileArticleList";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import {
  PROFILE_ARTICLES_PAGE_SIZE,
  type ProfileApiOrigin,
  type ProfileArticle,
  type ProfileArticlesPage,
} from "@/lib/api/profiles";

interface ProfileArticlesExpandableProps {
  apiOrigin?: ProfileApiOrigin;
  articles: ProfileArticle[];
  lang: SupportedLanguageCode;
  profileId: number;
  totalArticles?: number;
}

interface CachedPageRequest {
  promise: Promise<ProfileArticlesPage>;
  settled: boolean;
}

const MAX_CACHED_PAGES = 20;
const pageRequests = new Map<string, CachedPageRequest>();

function isProfileArticlesPage(
  value: unknown,
): value is ProfileArticlesPage {
  if (
    !value ||
    typeof value !== "object" ||
    !("page" in value) ||
    !Number.isSafeInteger(value.page) ||
    !("hasNext" in value) ||
    typeof value.hasNext !== "boolean" ||
    !("results" in value) ||
    !Array.isArray(value.results)
  ) {
    return false;
  }

  return value.results.every(
    (article) =>
      article &&
      typeof article === "object" &&
      Number.isSafeInteger(article.id) &&
      typeof article.title === "string" &&
      typeof article.url === "string",
  );
}

function trimPageRequests() {
  while (pageRequests.size > MAX_CACHED_PAGES) {
    const oldestSettledKey = Array.from(pageRequests).find(
      ([, entry]) => entry.settled,
    )?.[0];

    if (!oldestSettledKey) {
      return;
    }

    pageRequests.delete(oldestSettledKey);
  }
}

function requestProfileArticlesPage({
  apiOrigin,
  lang,
  page,
  profileId,
  totalArticles,
}: {
  apiOrigin: ProfileApiOrigin;
  lang: SupportedLanguageCode;
  page: number;
  profileId: number;
  totalArticles?: number;
}): Promise<ProfileArticlesPage> {
  const key = `${lang}:${profileId}:${apiOrigin}:${page}:${totalArticles ?? ""}`;
  const cached = pageRequests.get(key);

  if (cached) {
    pageRequests.delete(key);
    pageRequests.set(key, cached);
    return cached.promise;
  }

  const searchParams = new URLSearchParams({
    lang,
    profileId: String(profileId),
    page: String(page),
    apiOrigin,
  });

  if (totalArticles !== undefined) {
    searchParams.set("totalArticles", String(totalArticles));
  }

  const promise = fetch(
    `/api/profile-articles?${searchParams.toString()}`,
    { cache: "no-store" },
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Profile articles request failed: ${response.status}`,
      );
    }

    const data: unknown = await response.json();

    if (!isProfileArticlesPage(data) || data.page !== page) {
      throw new Error("Invalid profile articles response");
    }

    return data;
  });
  const entry = { promise, settled: false };

  pageRequests.set(key, entry);

  void promise.then(
    () => {
      entry.settled = true;
      trimPageRequests();
    },
    () => {
      if (pageRequests.get(key) === entry) {
        pageRequests.delete(key);
      }
    },
  );

  return promise;
}

export default function ProfileArticlesExpandable({
  apiOrigin = "public",
  articles: initialArticles,
  lang,
  profileId,
  totalArticles,
}: ProfileArticlesExpandableProps) {
  const uniqueInitialArticles = Array.from(
    new Map(
      initialArticles.map((article) => [article.id, article]),
    ).values(),
  );
  const [articles, setArticles] = useState(uniqueInitialArticles);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    () =>
      totalArticles === undefined ||
      uniqueInitialArticles.length < totalArticles,
  );
  const [hasError, setHasError] = useState(false);
  const [waitingForProgress, setWaitingForProgress] = useState(false);
  const loadingRef = useRef(false);
  const nextPageRef = useRef(
    uniqueInitialArticles.length >= PROFILE_ARTICLES_PAGE_SIZE ? 2 : 1,
  );
  const articleIdsRef = useRef(
    new Set(uniqueInitialArticles.map((article) => article.id)),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    setWaitingForProgress(false);

    try {
      const page = nextPageRef.current;
      const result = await requestProfileArticlesPage({
        apiOrigin,
        lang,
        page,
        profileId,
        totalArticles,
      });

      nextPageRef.current = page + 1;
      const newArticles = result.results.filter((article) => {
        if (articleIdsRef.current.has(article.id)) {
          return false;
        }

        articleIdsRef.current.add(article.id);
        return true;
      });

      if (newArticles.length > 0) {
        setArticles((current) => [...current, ...newArticles]);
      }

      setWaitingForProgress(
        result.hasNext &&
          result.results.length > 0 &&
          newArticles.length === 0,
      );
      setHasMore(
        result.hasNext &&
          (totalArticles === undefined ||
            articleIdsRef.current.size < totalArticles),
      );
    } catch (error) {
      console.error("Failed to load profile articles:", error);
      setHasError(true);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [apiOrigin, hasMore, lang, profileId, totalArticles]);

  useEffect(() => {
    if (
      !isExpanded ||
      !hasMore ||
      isLoading ||
      hasError ||
      waitingForProgress ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasError,
    hasMore,
    isExpanded,
    isLoading,
    loadMore,
    waitingForProgress,
  ]);

  const startLoading = () => {
    setIsExpanded(true);
    void loadMore();
  };

  return (
    <>
      <ProfileArticleList
        articles={articles}
        lang={lang}
      />

      {!isExpanded && hasMore && (
        <button
          className="profile-articles__expand"
          type="button"
          onClick={startLoading}
        >
          {totalArticles === undefined
            ? lang === "en"
              ? "All articles"
              : "ყველა სტატია"
            : lang === "en"
              ? `All articles (${totalArticles})`
              : `ყველა სტატია (${totalArticles})`}
        </button>
      )}

      {isExpanded && isLoading && (
        <p
          className="profile-articles__status"
          role="status"
          aria-live="polite"
        >
          <span className="profile-articles__spinner" aria-hidden="true" />
          {lang === "en" ? "Loading articles…" : "სტატიები იტვირთება…"}
        </p>
      )}

      {isExpanded && hasError && (
        <div className="profile-articles__error" role="alert">
          <p>
            {lang === "en"
              ? "Articles could not be loaded. Please try again."
              : "სტატიების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა."}
          </p>
          <button type="button" onClick={() => void loadMore()}>
            {lang === "en" ? "Retry" : "ხელახლა ცდა"}
          </button>
        </div>
      )}

      {isExpanded && waitingForProgress && hasMore && (
        <div className="profile-articles__error" role="status">
          <p>
            {lang === "en"
              ? "This page contained no new articles."
              : "ამ გვერდზე ახალი სტატიები არ არის."}
          </p>
          <button type="button" onClick={() => void loadMore()}>
            {lang === "en" ? "Continue loading" : "გაგრძელება"}
          </button>
        </div>
      )}

      {isExpanded &&
        !isLoading &&
        !hasError &&
        !waitingForProgress &&
        hasMore && (
          <>
            <button
              className="profile-articles__load-more"
              type="button"
              onClick={() => void loadMore()}
            >
              {lang === "en"
                ? "Load more articles"
                : "მეტი სტატიის ჩატვირთვა"}
            </button>
            <div
              className="profile-articles__sentinel"
              ref={sentinelRef}
              aria-hidden="true"
            />
          </>
        )}

      {isExpanded && !hasMore && (
        <p className="profile-articles__status" role="status">
          {lang === "en"
            ? "All available articles are shown."
            : "ყველა სტატია ნაჩვენებია."}
        </p>
      )}
    </>
  );
}
