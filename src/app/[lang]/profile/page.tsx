import WrapperA from "@/components/WrapperA/WrapperA";
import ProfileCard from "@/components/Profile/ProfileCard/ProfileCard";

import {
  getAllProfiles,
  getProfileImage,
} from "@/lib/api/profiles";

interface ProfilePageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { lang } = await params;

  let profiles = [];

  try {
    profiles = await getAllProfiles(lang);
  } catch (error) {
    console.error(
      "Failed to load profiles:",
      error
    );
  }

  return (
    <main className="py-6">
      <WrapperA>
        <h1 className="text-3xl font-bold mb-6">
          პროფილები
        </h1>

        {profiles.length === 0 ? (
          <div className="p-6 text-center">
            პროფილები ვერ მოიძებნა.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                image={getProfileImage(profile)}
                title={profile.title}
                position={profile.position}
                lang={lang}
              />
            ))}
          </div>
        )}
      </WrapperA>
    </main>
  );
}