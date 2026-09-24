import WrapperA from "@/components/WrapperA/WrapperA";

import {
  getProfileById,
  getProfileImage,
} from "@/lib/api/profiles";

interface ProfileDetailPageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { lang, id } = await params;

  const profile =
    await getProfileById(lang, id);

  if (!profile) {
    return (
      <main className="py-6">
        <WrapperA>
          <div className="p-6 text-center">
            პროფილი ვერ მოიძებნა.
          </div>
        </WrapperA>
      </main>
    );
  }

  const imageUrl =
    getProfileImage(profile);

  return (
    <main className="py-6">
      <WrapperA>
        <article className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={profile.title}
                  className="w-[198px] h-[198px] object-cover"
                />
              ) : (
                <div className="w-[198px] h-[198px] bg-gray-200 flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {profile.title}
              </h1>

              {profile.position && (
                <p className="mt-3 text-lg text-gray-600">
                  {profile.position}
                </p>
              )}

              {profile.birthdate && (
                <p className="mt-4">
                  დაბადების თარიღი:{" "}
                  {profile.birthdate}
                </p>
              )}
            </div>
          </div>
        </article>
      </WrapperA>
    </main>
  );
}