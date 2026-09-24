import Image from "next/image";
import Link from "next/link";

import "./ProfileCard.css";

interface ProfileCardProps {
  id: number | string;
  image?: string | null;
  title: string;
  position?: string;
  priority?: boolean;
  href?: string;
  lang?: string;
}

export default function ProfileCard({
  id,
  image,
  title,
  position,
  priority = false,
  href,
  lang,
}: ProfileCardProps) {
  const profileHref =
    href ||
    (lang
      ? `/${lang}/profile/${id}`
      : `/profile/${id}`);

  return (
    <article className="profile-card">
      <Link
        href={profileHref}
        className="profile-card__link"
      >
     <div className="profile-card__image-wrapper">
  {image ? (
    <Image
      src={image}
      width={176}
      height={176}
      className="profile-card__image"
      alt={title}
      priority={priority}
      unoptimized
    />
  ) : (
    <div
      className="profile-card__fallback"
      aria-label={`${title} - ფოტო არ არის`}
    >
      No Photo
    </div>
  )}
</div>

        <div className="profile-card__content">
          <h3 className="profile-card__name">
            {title}
          </h3>

          <p className="profile-card__position">
            {position || ""}
          </p>
        </div>

        <div className="profile-card__more">
          <span className="profile-card__more-link">
            გაიგე მეტი
          </span>
        </div>
      </Link>
    </article>
  );
}