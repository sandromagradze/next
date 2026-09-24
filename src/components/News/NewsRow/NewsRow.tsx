import type { ReactNode } from "react";

import "./NewsRow.css";

interface NewsRowProps {
  children: ReactNode;
}

export default function NewsRow({
  children,
}: NewsRowProps) {
  return (
    <div className="news-row">
      {children}
    </div>
  );
}