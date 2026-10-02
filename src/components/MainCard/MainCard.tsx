import Image from "next/image";
import type { ReactNode } from "react";

import "./MainCard.css";

interface MainCardProps {
  title: string;
  time: string;
  image: string;
  preview?: string;
  pagination?: ReactNode;
  compact?: boolean;
  url?: string;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

export default function MainCard({
  title,
  time,
  image,
  preview = "",
  pagination,
  compact = false,
  url,
  headingLevel = "h2",
  priority = false,
}: MainCardProps) {
  const Heading = headingLevel;

  const content = compact ? (
    <div className="flex flex-row items-center gap-2 bg-white p-3">
      <div className="h-16 w-24 flex-shrink-0">
        <Image
          src={image}
          alt={title}
          width={96}
          height={64}
          className="h-full w-full rounded-sm object-cover"
          sizes="96px"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <time className="text-[10px] font-bold text-[#424242]">
          {time}
        </time>

        <Heading className="flex line-clamp-2 cursor-pointer text-xs font-bold leading-tight text-[#333333] hover:text-blue-600">
          {title}
        </Heading>
      </div>
    </div>
  ) : (
    <div className="maincard__layout">
      <div className="maincard__content">
        <time className="maincard__time">
          {time}
        </time>

        <Heading className="maincard__title">
          {title}
        </Heading>

        {preview && (
          <p className="maincard__preview">
            {preview}
          </p>
        )}
      </div>

      <div className="maincard__image">
        <Image
          src={image}
          alt={title}
          width={418}
          height={236}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          sizes="(max-width: 700px) 100vw, 418px"
        />
      </div>
    </div>
  );

  return (
    <article
      className={`maincard w-full${
        compact ? " maincard--compact" : ""
      }`}
    >
      {url ? (
        <a
          href={url}
          className="maincard__link block w-full"
          aria-label={title}
        >
          {content}
        </a>
      ) : (
        content
      )}
      {pagination}
    </article>
  );
}