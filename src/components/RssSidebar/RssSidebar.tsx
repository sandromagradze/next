import {
  getRssImageUrl,
  getRssItemTime,
  type RssBlock,
  type RssItem,
} from "@/lib/api/rss";

import RssLazyBlock from "./RssLazyBlock";
import RssItemImage from "./RssItemImage";

import "./RssSidebar.css";

interface RssSidebarProps {
  blocks: RssBlock[];
  position: string;
}

function normalizeExternalUrl(
  url?: unknown,
): string | null {
  const value =
    typeof url === "string"
      ? url.trim()
      : "";

  if (
    !value ||
    /^(?:null|undefined|\[object object\])$/i.test(
      value,
    )
  ) {
    return null;
  }

  const candidate =
    /^https?:\/\//i.test(value)
      ? value
      : value.startsWith("//")
        ? `https:${value}`
        : /^[a-z][a-z\d+.-]*:/i.test(value) ||
            value.startsWith("/")
          ? null
          : `https://${value}`;

  if (!candidate) {
    return null;
  }

  try {
    const parsed = new URL(candidate);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return null;
    }

    return candidate;
  } catch {
    return null;
  }
}

function normalizeRssSource(
  domain?: unknown,
): string {
  const value =
    typeof domain === "string"
      ? domain.trim()
      : "";

  if (
    !value ||
    /^(?:null|undefined|\[object object\])$/i.test(
      value,
    )
  ) {
    return "";
  }

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(value)
        ? value
        : `https://${value}`,
    );

    return url.hostname.replace(
      /^www\./i,
      "",
    );
  } catch {
    return value.replace(/^www\./i, "");
  }
}

function getBlockItems(
  block: RssBlock,
): RssItem[] {
  if (!Array.isArray(block.items)) {
    return [];
  }

  const items = block.items.filter(
    (item) =>
      typeof item.title === "string" &&
      Boolean(item.title.trim()) &&
      Boolean(normalizeExternalUrl(item.link)),
  );

  return typeof block.slicenum === "number" &&
    Number.isFinite(block.slicenum) &&
    block.slicenum >= 0
    ? items.slice(0, Math.floor(block.slicenum))
    : items;
}

function RssItemCard({
  item,
}: {
  item: RssItem;
}) {
  const title =
    typeof item.title === "string"
      ? item.title.trim()
      : "";
  const url = normalizeExternalUrl(item.link);

  const time = getRssItemTime(item);

  if (!title || !url) {
    return null;
  }

  return (
    <article className="rss-sidebar__item">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rss-sidebar__link"
        aria-label={title}
      >
        <RssItemImage
          item={item}
          title={title}
        />

        {time && (
          <div className="rss-sidebar__meta">
            <time className="rss-sidebar__time">
              {time}
            </time>
          </div>
        )}

        <h3 className="rss-sidebar__headline">
          {title}
        </h3>
      </a>
    </article>
  );
}

function RssBlockContent({
  block,
}: {
  block: RssBlock;
}) {
  const items = getBlockItems(block);

  if (!items.length) {
    return null;
  }

  const title =
    normalizeRssSource(block.domain) ||
    block.title?.trim() ||
    "";

  const visual =
    block.visual?.toLowerCase() || "";

  const isHorizontal =
    visual === "horizontal";

  const isSlider =
    visual === "slider";

  const logo = getRssImageUrl(block.logo);

  return (
    <section
      className={[
        "rss-sidebar__block",
        isHorizontal
          ? "rss-sidebar__block--horizontal"
          : "",
        isSlider
          ? "rss-sidebar__block--slider"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="rss-sidebar__block-header">
        <h2 className="rss-sidebar__block-title">
          {title}
        </h2>

        {logo && (
          <img
            src={logo}
            alt=""
            className="rss-sidebar__logo"
            loading="lazy"
            decoding="async"
          />
        )}
      </header>

      <div className="rss-sidebar__items">
        {items.map((item, index) => (
          <RssItemCard
            key={`${block.id}-${item.link}-${index}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

export default async function RssSidebar({
  blocks,
  position,
}: RssSidebarProps) {
  if (!blocks.length) {
    return null;
  }

  const validBlocks = blocks.filter(
    (block) => {
      const matchesPlacement =
        block.position === position;

      if (!matchesPlacement) {
        return false;
      }

      return getBlockItems(block).length > 0;
    },
  );

  if (!validBlocks.length) {
    return null;
  }

  return (
    <div className="rss-sidebar">
      {validBlocks.map((block, index) => (
        <RssLazyBlock
          key={`${block.id}-${block.domain}-${block.position}-${index}`}
        >
          <RssBlockContent block={block} />
        </RssLazyBlock>
      ))}
    </div>
  );
}