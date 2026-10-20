"use client";

import Image from "next/image";
import { useState } from "react";

import RssItemImage from "@/components/RssSidebar/RssItemImage";
import useRssBlocks from "@/components/hooks/useRssBlocks";
import {
  getRssImageUrl,
  type RssBlock,
} from "@/lib/api/rss";
import {
  formatAmbebiPublicationDate,
  getAmbebiHostname,
  getAmbebiPublicationDateTime,
  getLatestAmbebiItems,
} from "@/lib/api/ambebi";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

import "./AmbebiSidebar.scss";

function getAmbebiBlock(blocks: RssBlock[]): RssBlock | undefined {
  return blocks.find((block) => {
    if (block.position !== "main_page_fixed_right_column") return false;
    const hostname = getAmbebiHostname(block.domain);
    return hostname === "ambebi.ge" || hostname?.endsWith(".ambebi.ge");
  });
}

export default function AmbebiSidebar({
  lang,
}: {
  lang: SupportedLanguageCode;
}) {
  const { data: blocks = [], isLoading, isError } = useRssBlocks(lang);
  const block = getAmbebiBlock(blocks);
  const items = getLatestAmbebiItems(block);
  const logoUrl = getRssImageUrl(block?.logo);
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="ambebi-sidebar__sticky">
      <section className="ambebi-sidebar side-news-card side-news-card--lower">
        <h2 className="side-news-card__title">
          {logoUrl && !logoFailed ? (
            <Image
              src={logoUrl}
              alt="Ambebi.ge logo"
              width={180}
              height={40}
              className="side-news-card__section-logo"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            "Ambebi.ge"
          )}
        </h2>

        {isLoading && !block ? (
          <p className="ambebi-sidebar__status" role="status">Loading news...</p>
        ) : isError || !block ? (
          <p className="ambebi-sidebar__status" role="status">
            No Ambebi news is currently available.
          </p>
        ) : items.length === 0 ? (
          <p className="ambebi-sidebar__status" role="status">
            No Ambebi articles are available.
          </p>
        ) : (
          <div className="side-news-card__list">
            {items.map((item, index) => {
              const published = formatAmbebiPublicationDate(item);
              return (
                <article
                  key={`${item.link}-${index}`}
                  className="side-news-card__item"
                >
                  <a
                    href={item.link ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="side-news-card__link"
                  >
                    <RssItemImage item={item} title={item.title ?? "Ambebi.ge news"} />
                    {published && (
                      <time
                        className="side-news-card__time"
                        dateTime={getAmbebiPublicationDateTime(item)}
                      >
                        {published}
                      </time>
                    )}
                    <h3 className="side-news-card__headline">{item.title}</h3>
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
