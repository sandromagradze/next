"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SearchBar from "@/components/SearchBar/SearchBar";
import WrapperA from "../WrapperA/WrapperA";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

import "./Navbar.scss";

import type { MenuItem } from "@/lib/api/menu";
import { getLocalCategoryPath } from "@/lib/categoryRoutes";

interface NavbarProps {
  lang: SupportedLanguageCode;
  menu: MenuItem[];
}

export default function Navbar({
  lang,
  menu,
}: NavbarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOtherMenuOpen, setIsOtherMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const otherMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const otherMenuRef = useRef<HTMLLIElement | null>(null);
  const escapeClosedOtherMenuRef = useRef(false);
  const pathname = usePathname();
  const isHomePage =
    pathname === `/${lang}` ||
    pathname === `/${lang}/`;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isStuck = !entry.isIntersecting;
        setIsStuck(isStuck);
        document.documentElement.classList.toggle(
          "mobile-header--compact",
          isStuck,
        );
      },
      {
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove(
        "mobile-header--compact",
      );
    };
  }, []);

  useEffect(() => {
    if (!isOtherMenuOpen) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!otherMenuRef.current?.contains(event.target as Node)) {
        setIsOtherMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOtherMenuOpen(false);
        escapeClosedOtherMenuRef.current = true;
        otherMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOtherMenuOpen]);

  const getMenuUrl = (item: MenuItem) => {
    const localCategoryPath = getLocalCategoryPath(
      item.alias,
      item.link,
      lang,
    );

    if (localCategoryPath) {
      return localCategoryPath;
    }

    const { link } = item;

    if (!link) {
      return "#";
    }

    try {
      const parsedUrl = new URL(
        link,
        "https://www.interpressnews.ge",
      );
      const isIpnHost =
        parsedUrl.hostname === "interpressnews.ge" ||
        parsedUrl.hostname.endsWith(".interpressnews.ge") ||
        parsedUrl.hostname === "dev.ipn.ge";
      const categoryRoute = new RegExp(
        `^/${lang}/category/\\d+-[^/]+/?$`,
      );

      if (
        isIpnHost &&
        categoryRoute.test(parsedUrl.pathname)
      ) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      // Keep the existing fallback behavior for malformed menu links.
    }

    if (
      link.startsWith("http://") ||
      link.startsWith("https://")
    ) {
      return link;
    }

    if (link.startsWith(`/${lang}/category/`)) {
      return link;
    }

    if (link.startsWith("/")) {
      return `https://www.interpressnews.ge${link}`;
    }

    return `https://www.interpressnews.ge/${link}`;
  };

  const handleSearch = () => {
    
  };

  const handleLogoClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    window.location.reload();
  };

  const announcementsIndex = menu.findIndex(
    (item) =>
      getLocalCategoryPath(item.alias, item.link, lang) ===
      `/${lang}/announcements`,
  );
  const visibleMenu =
    announcementsIndex === -1
      ? menu.slice(0, 11)
      : menu.slice(0, announcementsIndex + 1);
  const remainingMenu =
    announcementsIndex === -1
      ? menu.slice(11)
      : menu.slice(announcementsIndex + 1);
  const missingExclusiveCategory: MenuItem[] =
    lang === "en" &&
    !menu.some(
      (item) =>
        getLocalCategoryPath(item.alias, item.link, lang) ===
        `/${lang}/exclusive`,
    )
      ? [
          {
            alias: "exclusive",
            is_external: false,
            link: `/${lang}/category/36-exclusive/`,
            text: "Exclusive",
          },
        ]
      : [];
  const extraMenu = [...remainingMenu, ...missingExclusiveCategory];
  const mobileMenu = [...menu, ...missingExclusiveCategory];
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <div
        ref={sentinelRef}
        className="navbar-sentinel"
        aria-hidden="true"
      />

      <nav
        className={`navbar ${
          isStuck
            ? "navbar--stuck"
            : "navbar--default"
        } ${isHomePage ? "navbar--home" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isMobileMenuOpen) {
            closeMobileMenu();
            mobileMenuButtonRef.current?.focus();
          }
        }}
      >
        <WrapperA>
          <div className="navbar__inner">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="navbar__mobile-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls="navbar-mobile-menu"
              aria-label={
                isMobileMenuOpen
                  ? lang === "ka" ? "მენიუს დახურვა" : "Close menu"
                  : lang === "ka" ? "მენიუს გახსნა" : "Open menu"
              }
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="navbar__left">
              <Link
                href={`/${lang}`}
                onClick={handleLogoClick}
                className={`navbar__logo-link ${
                  isStuck
                    ? "navbar__logo-link--visible"
                    : "navbar__logo-link--hidden"
                }`}
                aria-label="IPN"
              >
                <Image
                  src="/logo.svg"
                  alt="IPN"
                  width={150}
                  height={74}
                  className="navbar__logo"
                />
              </Link>

              <ul className="navbar__menu">
                {!isStuck && (
                  <li className="navitem">
                    <Link
                      href={`/${lang}`}
                      className="nav-link"
                    >
                      {lang === "ka" ? "მთავარი" : "Home"}
                    </Link>
                  </li>
                )}

                {visibleMenu.map((item) => {
                  const url = getMenuUrl(item);
                  const opensExternalLink =
                    item.is_external && /^https?:\/\//i.test(url);

                  return (
                    <li
                      key={item.alias}
                      className="navitem"
                    >
                      <a
                        href={url}
                        target={
                          opensExternalLink
                            ? "_blank"
                            : "_self"
                        }
                        rel={
                          opensExternalLink
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="nav-link"
                      >
                        {item.text}
                      </a>
                    </li>
                  );
                })}

                {extraMenu.length > 0 && (
                  <li
                    ref={otherMenuRef}
                    className={`navitem more-menu${
                      isOtherMenuOpen ? " more-menu--open" : ""
                    }`}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        setIsOtherMenuOpen(true);
                      }
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === "mouse") {
                        setIsOtherMenuOpen(false);
                      }
                    }}
                    onFocusCapture={() => {
                      if (!escapeClosedOtherMenuRef.current) {
                        setIsOtherMenuOpen(true);
                      }
                    }}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        escapeClosedOtherMenuRef.current = false;
                        setIsOtherMenuOpen(false);
                      }
                    }}
                  >
                    <button
                      ref={otherMenuButtonRef}
                      type="button"
                      className="nav-link more-button"
                      aria-label={lang === "ka" ? "სხვა" : "More"}
                      aria-expanded={isOtherMenuOpen}
                      aria-controls="navbar-other-menu"
                      onClick={() =>
                        setIsOtherMenuOpen((open) => !open)
                      }
                    >
                      <span>{lang === "ka" ? "სხვა" : "More"}</span>
                      <Image
                        src="/burger.svg"
                        width={16}
                        height={16}
                        alt=""
                        className="more-button__icon"
                      />
                    </button>

                    <div
                      id="navbar-other-menu"
                      className="more-dropdown"
                    >
                      <div className="more-dropdown-inner">
                        {extraMenu.map((item) => {
                          const url = getMenuUrl(
                            item,
                          );
                          const opensExternalLink =
                            item.is_external && /^https?:\/\//i.test(url);

                          return (
                            <a
                              key={item.alias}
                              href={url}
                              target={
                                opensExternalLink
                                  ? "_blank"
                                  : "_self"
                              }
                              rel={
                                opensExternalLink
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="dropdown-link"
                              onClick={() => setIsOtherMenuOpen(false)}
                            >
                              {item.text}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <SearchBar
              lang={lang}
              onSearch={handleSearch}
            />
          </div>

          <div
            id="navbar-mobile-menu"
            className="navbar__mobile-menu"
            hidden={!isMobileMenuOpen}
          >
            <Link
              href={`/${lang}`}
              className="navbar__mobile-link"
              onClick={closeMobileMenu}
            >
              {lang === "ka" ? "მთავარი" : "Home"}
            </Link>
            {mobileMenu.map((item) => {
              const url = getMenuUrl(item);
              const opensExternalLink =
                item.is_external && /^https?:\/\//i.test(url);

              return (
                <a
                  key={item.alias}
                  href={url}
                  target={opensExternalLink ? "_blank" : "_self"}
                  rel={
                    opensExternalLink
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="navbar__mobile-link"
                  onClick={closeMobileMenu}
                >
                  {item.text}
                </a>
              );
            })}
          </div>
        </WrapperA>
      </nav>
    </>
  );
}
