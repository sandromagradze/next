import type { ReactNode } from "react";

import "./WrapperA.css";

interface WrapperAProps {
  children: ReactNode;
}

export default function WrapperA({
  children,
}: WrapperAProps) {
  return (
    <div className="wrapper-a">
      {children}
    </div>
  );
}