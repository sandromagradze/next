"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface RssLazyBlockProps {
  children: ReactNode;
}

export default function RssLazyBlock({
  children,
}: RssLazyBlockProps) {
  const ref = useRef<HTMLDivElement | null>(
    null,
  );

  const [isVisible, setIsVisible] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          setIsVisible(true);

          observer.disconnect();
        },
        {
          /*
           * ცოტა ადრე ვტვირთავთ,
           * სანამ მომხმარებელი რეალურად
           * block-მდე მივა.
           */
          rootMargin: "500px 0px",
          threshold: 0,
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="rss-sidebar__lazy-block"
    >
      {isVisible ? (
        children
      ) : (
        <div
          className="rss-sidebar__placeholder"
          aria-hidden="true"
        />
      )}
    </div>
  );
}