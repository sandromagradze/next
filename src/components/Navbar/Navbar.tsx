"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SearchBar from "@/components/SearchBar/SearchBar";
import WrapperA from "../WrapperA/WrapperA";

import "./Navbar.css";

import type { MenuItem } from "@/lib/api/menu";

interface NavbarProps {
  lang: string;
  menu: MenuItem[];
}

export default function Navbar({
  lang,
  menu,
}: NavbarProps) {
  const [isStuck, setIsStuck] = useState(false);
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
        setIsStuck(!entry.isIntersecting);
      },
      {
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getMenuUrl = (link: string) => {
    if (!link) {
      return "#";
    }

    if (
      link.startsWith("http://") ||
      link.startsWith("https://")
    ) {
      return link;
    }

    if (link.startsWith("/")) {
      return `https://www.interpressnews.ge${link}`;
    }

    return `https://www.interpressnews.ge/${link}`;
  };

  const handleSearch = (searchTerm: string) => {
    
  };

  const handleLogoClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const currentPath = window.location.pathname;
    const homePath = `/${lang}`;

    if (
      currentPath === homePath ||
      currentPath === `${homePath}/`
    ) {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const visibleMenu = menu.slice(0, 10);
  const extraMenu = menu.slice(10);

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
      >
        <WrapperA>
          <div className="navbar__inner">
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
                <li className="navitem">
                  <Link
                    href={`/${lang}`}
                    className="nav-link"
                  >
                    {lang === "ka" ? "მთავარი" : "Home"}
                  </Link>
                </li>

                {visibleMenu.map((item) => {
                  const url = getMenuUrl(item.link);

                  return (
                    <li
                      key={item.alias}
                      className="navitem"
                    >
                      <a
                        href={url}
                        target={
                          item.is_external
                            ? "_blank"
                            : "_self"
                        }
                        rel={
                          item.is_external
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
                  <li className="navitem more-menu">
                    <button
                      type="button"
                      className="nav-link more-button"
                      aria-label="More menu"
                    >
                      <Image
                        src="/burger.svg"
                        width={19}
                        height={19}
                        alt=""
                        className="more-button__icon"
                      />
                    </button>

                    <div className="more-dropdown">
                      <div className="more-dropdown-inner">
                        {extraMenu.map((item) => {
                          const url = getMenuUrl(
                            item.link,
                          );

                          return (
                            <a
                              key={item.alias}
                              href={url}
                              target={
                                item.is_external
                                  ? "_blank"
                                  : "_self"
                              }
                              rel={
                                item.is_external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="dropdown-link"
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
        </WrapperA>
      </nav>
    </>
  );
}