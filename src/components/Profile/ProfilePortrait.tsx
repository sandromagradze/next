"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProfilePortrait({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  const [imageUnavailable, setImageUnavailable] = useState(!imageUrl);

  if (imageUnavailable) {
    return (
      <div
        className="profile-detail__portrait-fallback"
        role="img"
        aria-label={title}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={title}
      width={198}
      height={198}
      priority
      className="profile-detail__portrait-image"
      sizes="(max-width: 380px) 104px, (max-width: 600px) 132px, 198px"
      onError={() => setImageUnavailable(true)}
    />
  );
}
