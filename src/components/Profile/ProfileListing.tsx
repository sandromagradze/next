"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import ProfileCard from "@/components/Profile/ProfileCard/ProfileCard";
import ProfilePagination from "@/components/Profile/ProfilePagination";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface ListedProfile {
  id: number;
  alias: string;
  image: string;
  title: string;
  position: string;
}

interface ProfileListingProps {
  profiles: ListedProfile[];
  lang: SupportedLanguageCode;
  initialPage: number;
  initialQuery: string;
}

const PAGE_SIZE = 15;

function normalizeSearchText(value: string, lang: string): string {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase(lang);
}

export default function ProfileListing({
  profiles,
  lang,
  initialPage,
  initialQuery,
}: ProfileListingProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const uniqueProfiles = useMemo(() => {
    const profilesById = new Map<number, ListedProfile>();
    for (const profile of profiles) {
      if (!profilesById.has(profile.id)) {
        profilesById.set(profile.id, profile);
      }
    }
    return Array.from(profilesById.values());
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery, lang);
    if (!normalizedQuery) return uniqueProfiles;

    const terms = normalizedQuery.split(" ");
    return uniqueProfiles.filter((profile) => {
      const normalizedName = normalizeSearchText(profile.title, lang);
      return terms.every((term) => normalizedName.includes(term));
    });
  }, [lang, searchQuery, uniqueProfiles]);

  const pageCount = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);
  const visibleProfiles = filteredProfiles.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function updateSearchUrl(value: string) {
    const url = new URL(window.location.href);
    const normalizedQuery = value.trim().replace(/\s+/gu, " ");
    url.searchParams.delete("page");
    if (normalizedQuery) {
      url.searchParams.set("q", normalizedQuery);
    } else {
      url.searchParams.delete("q");
    }

    const search = url.searchParams.toString();
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${search ? `?${search}` : ""}${url.hash}`,
    );
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
    updateSearchUrl(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSearchChange(searchQuery.trim());
  }

  return (
    <section className="profile-page__main" id="profile-listing">
      <div className="profile-page__heading-row">
        <h1 className="profile-page__title">
          {lang === "en" ? "Profiles" : "პროფილები"}
        </h1>

        <form className="profile-search" role="search" onSubmit={handleSubmit}>
          <input
            className="profile-search__input"
            type="search"
            name="profile-search"
            placeholder="სახელი და გვარი"
            aria-label={lang === "en" ? "Search profiles by name" : "სახელი და გვარი"}
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          <button
            className="profile-search__button"
            type="submit"
            aria-label={lang === "en" ? "Search profiles" : "პროფილების ძებნა"}
          />
        </form>
      </div>

      {uniqueProfiles.length === 0 ? (
        <div className="profile-page__empty">
          {lang === "en" ? "No profiles are available." : "პროფილები ვერ მოიძებნა."}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="profile-page__empty" role="status">
          {lang === "en" ? "No profiles match your search." : "ძიების შესაბამისი პროფილები ვერ მოიძებნა."}
        </div>
      ) : (
        <>
          <div className="profile-list">
            {visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                alias={profile.alias}
                image={profile.image}
                title={profile.title}
                position={profile.position}
                lang={lang}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <ProfilePagination
              currentPage={safePage}
              pageCount={pageCount}
              lang={lang}
              searchQuery={searchQuery.trim()}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </section>
  );
}
