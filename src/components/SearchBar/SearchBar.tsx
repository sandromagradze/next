"use client";

import { useState } from "react";
import SearchResult from "./SearchResult";
import "./SearchBar.css";

interface SearchBarProps {
  lang: string;
  onSearch?: (searchTerm: string) => void;
}

export default function SearchBar({
  lang,
  onSearch,
}: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    onSearch?.(value);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-bar-form">
        <input
          id="site-search"
          name="search"
          type="search"
          placeholder="ჩაწერეთ საძიებო სიტყვა"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="search-bar-input"
          aria-label="Search"
        />

        <button
          type="submit"
          className="search-bar-button"
          aria-label="Search"
        >
          <svg
            className="search-bar-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {isFocused && search.trim().length >= 4 && (
        <SearchResult
          search={search}
          lang={lang}
        />
      )}
    </div>
  );
}