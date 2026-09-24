"use client";

import { useEffect, useState } from "react";

import "./ScrollButton.css";

export default function ScrollButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      id="uparrow"
      className={isVisible ? "visible" : ""}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg
        viewBox="0 0 46 46"
        aria-hidden="true"
        role="img"
      >
        <circle className="st0" cx="23" cy="23" r="23" />
        <path
          className="st1"
          d="M23 13.5L13.5 23l1.4 1.4 7.1-7.1V33h2V17.3l7.1 7.1 1.4-1.4-9.5-9.5z"
        />
      </svg>
    </button>
  );
}
