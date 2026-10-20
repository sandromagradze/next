"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface ProfilePaginationProps {
  currentPage: number;
  pageCount: number;
  lang: string;
  searchQuery?: string;
  onPageChange?: (page: number) => void;
}

function getVisiblePages(currentPage: number, pageCount: number): number[] {
  if (pageCount <= 4) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = [1, 2, 3];
  if (currentPage > 3 && currentPage < pageCount) {
    pages.push(currentPage);
  }
  pages.push(pageCount);
  return [...new Set(pages)];
}

export default function ProfilePagination({
  currentPage,
  pageCount,
  lang,
  searchQuery = "",
  onPageChange,
}: ProfilePaginationProps) {
  const scrollMarkerKey = `profile-list-scroll:${lang}`;
  const visiblePages = getVisiblePages(currentPage, pageCount);
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    return `/${lang}/profile?${params.toString()}`;
  };
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const lastScrolledPage = useRef<number | null>(null);

  useEffect(() => {
    let storedPage: string | null = null;
    try {
      storedPage = window.sessionStorage.getItem(scrollMarkerKey);
    } catch {
      // In-memory navigation state still supports client-side transitions.
    }

    if (pendingPage !== currentPage && storedPage !== String(currentPage)) {
      if (pendingPage === null && storedPage) {
        window.sessionStorage.removeItem(scrollMarkerKey);
      }
      return;
    }

    if (lastScrolledPage.current === currentPage) return;

    try {
      window.sessionStorage.removeItem(scrollMarkerKey);
    } catch {
      // Storage is optional when the client component remains mounted.
    }
    setPendingPage(null);
    lastScrolledPage.current = currentPage;

    const target = document.getElementById("profile-listing");
    if (!target) return;

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    target.scrollIntoView({ behavior, block: "start" });
  }, [currentPage, pendingPage, scrollMarkerKey]);

  function markNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    destinationPage: number,
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      destinationPage === currentPage
    ) {
      return;
    }

    setPendingPage(destinationPage);
    onPageChange?.(destinationPage);
    try {
      window.sessionStorage.setItem(scrollMarkerKey, String(destinationPage));
    } catch {
      // Navigation remains usable if storage is unavailable.
    }
  }

  return (
    <nav
      className="profile-pagination"
      aria-label={lang === "en" ? "Profile pages" : "პროფილების გვერდები"}
    >
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        scroll={false}
        onClick={(event) => markNavigation(event, Math.max(1, currentPage - 1))}
        className="profile-pagination__arrow"
        aria-label={lang === "en" ? "Previous page" : "წინა გვერდი"}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        ‹
      </Link>

      {visiblePages.map((page, index) => (
        <span className="profile-pagination__item" key={page}>
          {index > 0 && page - visiblePages[index - 1] > 1 && (
            <span className="profile-pagination__ellipsis" aria-hidden="true">
              …
            </span>
          )}
          <Link
            href={pageHref(page)}
            scroll={false}
            onClick={(event) => markNavigation(event, page)}
            className={`profile-pagination__number${page === currentPage ? " is-active" : ""}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        </span>
      ))}

      <Link
        href={pageHref(Math.min(pageCount, currentPage + 1))}
        scroll={false}
        onClick={(event) => markNavigation(event, Math.min(pageCount, currentPage + 1))}
        className="profile-pagination__arrow"
        aria-label={lang === "en" ? "Next page" : "შემდეგი გვერდი"}
        aria-disabled={currentPage === pageCount}
        tabIndex={currentPage === pageCount ? -1 : undefined}
      >
        ›
      </Link>
    </nav>
  );
}
