"use client";

export default function PrintButton() {
  return (
    <button
      className="article-page__print"
      type="button"
      onClick={() => window.print()}
      aria-label="Print this article"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        focusable="false"
      >
        <path d="M6 2h12v5H6V2Zm11 2H7v1h10V4ZM5 8h14a3 3 0 0 1 3 3v6h-4v5H6v-5H2v-6a3 3 0 0 1 3-3Zm13 12v-6H6v6h12Zm2-5v-4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4h2v-3h12v3h2Zm-3-3h1v1h-1v-1Z" />
      </svg>
    </button>
  );
}
