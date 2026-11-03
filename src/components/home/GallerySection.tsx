import React, { useEffect, useState } from 'react';
import { ArrowRight, Camera } from 'lucide-react';
import { GalleryImage, parseGalleryImages } from '../../lib/gallery';

export const GallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const galleryImages = Array.isArray(images) ? images : [];

  useEffect(() => {
    let active = true;
    void fetch('/api/gallery')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load gallery images.');
        return parseGalleryImages(await response.json());
      })
      .then((galleryImages) => {
        if (active) setImages(galleryImages);
      })
      .catch(() => {
        if (active) setLoadError('The gallery is temporarily unavailable. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const scrollToEvents = () => {
    if (window.location.hash !== '#runs') {
      window.location.hash = '#runs';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="gallery"
      className="scroll-mt-20 border-b border-[#16171a] bg-[#0a0a0c] py-14 sm:py-18"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 font-head text-xs font-semibold uppercase tracking-wider text-[#FC5300] sm:text-sm">
              <Camera className="h-4 w-4" />
              <span>Meet Gallery</span>
            </p>
            <h2 className="mt-1 font-head text-3xl font-bold uppercase leading-[1.02] text-white sm:text-4xl">
              Moments with <span className="text-[#FC5300]">FitMeet.</span>
            </h2>
            <p className="mt-1.5 text-sm text-[#b4b0aa]">
              Photos from the people, places and challenges that bring us together.
            </p>
          </div>
          <span className="inline-flex self-start items-center gap-2 rounded-full border border-[#2a2b31] bg-[#111215] px-3.5 py-2 font-head text-xs font-semibold uppercase tracking-wider text-white sm:self-auto sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#FC5300] shadow-[0_0_0_4px_rgba(252,83,0,0.25)]" />
            {galleryImages.length} {galleryImages.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>

        {loading ? (
          <p
            role="status"
            className="rounded-lg border border-[#25272c] bg-[#111215] p-8 text-center text-sm text-[#b4b0aa]"
          >
            Loading gallery…
          </p>
        ) : loadError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-900 bg-red-950/30 p-8 text-center text-sm text-red-200"
          >
            {loadError}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-lg border border-[#25272c] bg-[#111215]"
              >
                <img
                  src={image.image_url}
                  alt={image.caption || 'FitMeet community'}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                {image.caption && (
                  <figcaption className="px-3 py-2.5 text-sm text-[#d9d7d4]">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
            {!galleryImages.length && (
              <p className="col-span-2 rounded-lg border border-[#25272c] bg-[#111215] p-8 text-center text-sm text-[#b4b0aa] sm:col-span-3 lg:col-span-4">
                New FitMeet moments will show up here soon.
              </p>
            )}

            <button
              onClick={scrollToEvents}
              className="col-span-2 flex aspect-auto cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-[#FC5300] bg-[radial-gradient(circle_at_50%_40%,rgba(252,83,0,0.2),#111215_72%)] py-6 text-center sm:col-span-1 sm:aspect-[4/3] sm:py-0"
            >
              <span className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-[#FC5300]/20">
                <Camera className="h-5 w-5 text-[#FC5300]" />
              </span>
              <span className="font-head text-lg font-bold uppercase text-white">
                Your photo here
              </span>
              <span className="font-head text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FC5300]">
                Be in the next shot
              </span>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FC5300] px-3.5 py-1.5 font-head text-xs font-semibold uppercase tracking-wider text-[#0a0a0c]">
                Join the meet <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          </div>
        )}

        <p className="mt-4 flex items-center gap-2.5 text-xs text-[#8b8882] sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-[#FC5300]" />
          Photos from every meet land here and on{' '}
          <b className="font-semibold text-white">@fitmeet.in</b>
        </p>
      </div>
    </section>
  );
};
