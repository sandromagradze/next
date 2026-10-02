"use client";

import { useState } from "react";

import {
  getBestRssImage,
  type RssItem,
} from "@/lib/api/rss";

interface RssItemImageProps {
  item: RssItem;
  title: string;
}

export default function RssItemImage({
  item,
  title,
}: RssItemImageProps) {
  const [failedUrls, setFailedUrls] =
    useState<string[]>([]);

  const image = getBestRssImage(
    item,
    failedUrls,
  );

  if (!image) {
    return null;
  }

  return (
    <div className="rss-sidebar__image-wrapper">
      <img
        src={image}
        alt={title}
        width={364}
        height={206}
        className="rss-sidebar__image"
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailedUrls((current) =>
            current.includes(image)
              ? current
              : [...current, image],
          );
        }}
      />
    </div>
  );
}
