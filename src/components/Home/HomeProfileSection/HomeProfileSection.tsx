import Link from "next/link";

import ProfileCard from "@/components/Profile/ProfileCard/ProfileCard";

import "./HomeProfileSection.css";

interface ProfileItem {
  id: number | string;
  alias?: string;
  title: string;
  position: string;

  images?: {
    "176x176"?: string | null;
    "198x198"?: string | null;
  };
}

interface HomeProfileSectionProps {
  localizedProfileCards: ProfileItem[];
  totalCount?: number;
  lang: string;
}

function getProfileImage(
  profile: ProfileItem
): string | null {
  return (
    profile.images?.["176x176"] ||
    profile.images?.["198x198"] ||
    null
  );
}

export default function HomeProfileSection({
  localizedProfileCards,
  totalCount,
  lang,
}: HomeProfileSectionProps) {
  /*
   * მთავარ გვერდზე მხოლოდ 4 პროფილი.
   */
  const visibleProfiles =
    localizedProfileCards.slice(0, 4);

  return (
    <section
      className="home-profile-section"
      aria-labelledby="home-profile-heading"
    >
      <div className="home-profile-section__header">
        <div
          className="home-profile-section__line"
          aria-hidden="true"
        />

        <h2
          id="home-profile-heading"
          className="home-profile-section__title"
        >
          პროფილები
        </h2>
      </div>

      <div className="home-profile-section__list">
        {visibleProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            id={profile.id}
            image={getProfileImage(profile)}
            title={profile.title}
            position={profile.position}
            lang={lang}
          />
        ))}

        <Link
          href={`/${lang}/profile`}
          className="home-profile-section__all"
        >
          <span className="home-profile-section__all-count">
            {totalCount ?? localizedProfileCards.length}
          </span>

          <span className="home-profile-section__all-title">
            ყველა პროფილი
          </span>

          <span
            className="home-profile-section__all-arrow"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}