import Link from "next/link";

import ProfileCard from "@/components/Profile/ProfileCard/ProfileCard";

import "./HomeProfileSection.scss";

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
  showAllProfiles?: boolean;
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
  showAllProfiles = true,
}: HomeProfileSectionProps) {
  const visibleProfiles =
    localizedProfileCards.slice(0, showAllProfiles ? 4 : 3);

  return (
    <section
      className={`home-profile-section${showAllProfiles ? "" : " home-profile-section--related"}`}
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
          პროფილი
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

        {showAllProfiles && (
          <Link
            href={`/${lang}/profile`}
            className="home-profile-section__all"
          >
            <span className="home-profile-section__all-count">
              {totalCount ?? localizedProfileCards.length}
            </span>

            <span className="home-profile-section__all-title">
               პროფილი
            </span>

            <span
              className="home-profile-section__all-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}