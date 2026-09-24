import "./MainCard.css";

interface MainCardProps {
  title: string;
  time: string;
  image: string;
  compact?: boolean;
  url?: string;
  headingLevel?: "h2" | "h3";
}

export default function MainCard({
  title,
  time,
  image,
  compact = false,
  url,
  headingLevel = "h2",
}: MainCardProps) {
  const Heading = headingLevel;

  const content = compact ? (
    <div className="flex flex-row items-center gap-2 bg-white p-3">
      <div className="h-16 w-24 flex-shrink-0">
        <img
          src={image}
          alt={title}
          width={96}
          height={64}
          className="h-full w-full rounded-sm object-cover"
          loading="lazy"
          decoding="async"
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
    <div className="flex flex-col-reverse items-center gap-4 bg-white p-2 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <time className="text-xs font-bold text-[#424242]">
          {time}
        </time>

        <Heading className="cursor-pointer text-sm font-bold leading-tight text-[#333333] hover:text-blue-600">
          {title}
        </Heading>
      </div>

      <div className="h-48 w-full md:h-52 md:w-1/2">
        <img
          src={image}
          alt={title}
          width={400}
          height={208}
          className="h-full w-full rounded-sm object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );

  if (!url) {
    return (
      <article className="w-full">
        {content}
      </article>
    );
  }

  return (
    <article className="w-full">
      <a
        href={url}
        className="block w-full"
        aria-label={title}
      >
        {content}
      </a>
    </article>
  );
}