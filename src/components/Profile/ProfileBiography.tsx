"use client";

import { useState } from "react";

import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface ProfileBiographyProps {
  lang: SupportedLanguageCode;
  hasDetails: boolean;
  alternateName?: string | null;
  descriptions: string[];
  currentPositions: string[];
  formerPositions: string[];
  sources: Array<{ title: string; url: string | null }>;
  sameAs: string[];
}

export default function ProfileBiography({
  lang,
  hasDetails,
  alternateName,
  descriptions,
  currentPositions,
  formerPositions,
  sources,
  sameAs,
}: ProfileBiographyProps) {
  const [expanded, setExpanded] = useState(false);
  const biographyId = "profile-personal-info";

  return (
    <div className="profile-detail__biography">
      <button
        className="profile-detail__more"
        type="button"
        aria-expanded={expanded}
        aria-controls={biographyId}
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
      >
        <span>{lang === "en" ? "More " : "ვრცლად >>"}</span>
      </button>

      <div
        className="profilepersonalinfo"
        id={biographyId}
        hidden={!expanded}
      >
        {hasDetails ? (
          <>
            {alternateName && (
              <p>
                <strong>
                  {lang === "en" ? "Also known as:" : "სხვა სახელი:"}
                </strong>{" "}
                {alternateName}
              </p>
            )}

            {descriptions.map((description, index) => (
              <div
                className="profile-detail__description"
                key={`description-${index}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ))}

            {currentPositions.length > 0 && (
              <section>
                <h3>
                  {lang === "en"
                    ? "Current positions"
                    : "ამჟამინდელი თანამდებობები"}
                </h3>
                <ul>
                  {currentPositions.map((position, index) => (
                    <li key={`${index}-${position}`}>{position}</li>
                  ))}
                </ul>
              </section>
            )}

            {formerPositions.length > 0 && (
              <section>
                <h3>
                  {lang === "en"
                    ? "Former positions"
                    : "ყოფილი თანამდებობები"}
                </h3>
                <ul>
                  {formerPositions.map((position, index) => (
                    <li key={`${index}-${position}`}>{position}</li>
                  ))}
                </ul>
              </section>
            )}

            {sources.length > 0 && (
              <section>
                <h3>{lang === "en" ? "Sources" : "წყაროები"}</h3>
                <ul>
                  {sources.map((source, index) => (
                    <li key={`${index}-${source.title}`}>
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                        </a>
                      ) : (
                        source.title
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sameAs.length > 0 && (
              <section>
                <h3>
                  {lang === "en" ? "External profiles" : "სხვა პროფილები"}
                </h3>
                <ul>
                  {sameAs.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p>
            {lang === "en"
              ? "No additional biographical details are available."
              : "დამატებითი ბიოგრაფიული ინფორმაცია ხელმისაწვდომი არ არის."}
          </p>
        )}
      </div>
    </div>
  );
}
