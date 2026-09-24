import "./VideoCard.css";

interface PalitraNewsItem {
  title: string;
  link: string;
  pubDate: string;
  original_image?: string;
  images?: {
    "288x162"?: string;
  };
}

interface PalitraNewsBlock {
  title: string;
  items: PalitraNewsItem[];
}

interface VideoCardProps {
  lang: string;
  block: PalitraNewsBlock | null;
}

const PALITRA_LIVE_URL =
  "https://live.palitranews.ge/hls/palitratv/index.m3u8";

function getImageUrl(item: PalitraNewsItem) {
  const image288 = item.images?.["288x162"];

  /*
   * 1. თუ 288x162 უკვე სრული URL-ია,
   *    პირდაპირ ვიყენებთ.
   */
  if (
    image288 &&
    (image288.startsWith("http://") ||
      image288.startsWith("https://"))
  ) {
    return image288;
  }

  /*
   * 2. თუ 288x162 არის /media/...,
   *    dev.ipn.ge-ს აღარ ვუმატებთ,
   *    რადგან ეს URL 404-ს აბრუნებს.
   *
   *    ამის ნაცვლად ვიყენებთ original_image-ს.
   */
  if (item.original_image) {
    return item.original_image;
  }

  /*
   * 3. fallback
   */
  return image288 || "";
}

export default function VideoCard({
  block,
}: VideoCardProps) {
  if (!block) {
    return null;
  }

  const items = block.items?.slice(0, 4) ?? [];

  return (
    <section className="palnewsliverss">
      <div className="palnewsliverss__wrapper">

        {/* HEADER */}
        <div className="palnewsliverss__header">
          <img
            src="/palitranews.svg"
            alt="PalitraNews"
            className="palnewsliverss__logo"
          />

          <h2 className="palnewsliverss__title">
            ბოლო საინფორმაციო გამოშვება
          </h2>

          <div className="palnewsliverss__label">
            ახალი ამბების ტელევიზია
          </div>
        </div>

        {/* CONTENT */}
        <div className="palnewsliverss__content">

          {/* LIVE VIDEO */}
          <div className="palnewsliverss__live">
            <video
              controls
              autoPlay
              muted
              playsInline
              className="palnewsliverss__live-video"
            >
              <source
                src={PALITRA_LIVE_URL}
                type="application/x-mpegURL"
              />

              Your browser does not support HLS video.
            </video>
          </div>

          {/* NEWS GRID */}
          <div className="palnewsliverss__grid">
            {items.map((item, index) => {
              const image = getImageUrl(item);

              return (
                <a
                  key={`${item.link}-${index}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="palnewsliverss__item"
                >
                  {image && (
                    <img
                      src={image}
                      alt={item.title}
                      className="palnewsliverss__image"
                    />
                  )}

                  <div className="palnewsliverss__overlay">
                    <div className="palnewsliverss__item-title">
                      {item.title}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}