/* eslint-disable @next/next/no-img-element */
"use client";
import { getPresignedFileUrls } from "@/app/(main)/(user-panel)/user/file/api";
import { Carousel } from "@material-tailwind/react";
import { AxiosInstance } from "axios";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

const shimmerSlides = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="h-full w-full animate-pulse bg-gray-200 rounded-lg"
      aria-hidden
    />
  ));

export function PostImageList({
  images,
  axiosAuth,
  accessToken,
}: {
  images: string[];
  axiosAuth: AxiosInstance;
  accessToken: string | null | undefined;
}) {
  const list = images ?? [];
  const listKey = list.length ? list.join("|") : "";

  const [urls, setUrls] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (list.length === 0 || !accessToken?.trim()) return;
    let cancelled = false;
    setFailed(false);
    setUrls(null);
    getPresignedFileUrls(axiosAuth, list, accessToken).then((result) => {
      if (cancelled) return;
      if (result && result.length === list.length) setUrls(result);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken, axiosAuth, listKey, list]);

  const handlePrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      const len = urls?.length ?? 1;
      return i <= 0 ? len - 1 : i - 1;
    });
  }, [urls]);
  const handleNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      const len = urls?.length ?? 1;
      return i >= len - 1 ? 0 : i + 1;
    });
  }, [urls]);

  if (list.length === 0) return <></>;

  const isLoading = urls === null && !failed;
  const displayUrls = urls ?? [];

  return (
    <>
      <div className="relative rounded-lg aspect-video overflow-hidden bg-gray-100">
        <Carousel
          className="rounded-lg aspect-video"
          autoplay={!!displayUrls.length}
          loop
          prevArrow={({ handlePrev }) => (
            <button
              type="button"
              onClick={handlePrev}
              className="!absolute top-2/4 left-2 -translate-y-2/4 z-10 rounded-full w-10 h-10 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 disabled:pointer-events-none shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          nextArrow={({ handleNext }) => (
            <button
              type="button"
              onClick={handleNext}
              className="!absolute top-2/4 right-2 -translate-y-2/4 z-10 rounded-full w-10 h-10 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 disabled:pointer-events-none shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        >
          {isLoading
            ? shimmerSlides(list.length)
            : failed
              ? [
                  <div
                    key="failed"
                    className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500"
                  >
                    Unable to load images
                  </div>,
                ]
              : displayUrls.map((url, index) => (
                  <div key={index} className="h-full w-full flex-shrink-0">
                    <img
                      src={url}
                      alt={`Post image ${index + 1}`}
                      className="h-full w-full object-cover cursor-pointer"
                      onClick={() => setLightboxIndex(index)}
                    />
                  </div>
                ))}
        </Carousel>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && displayUrls[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal
          aria-label="Image lightbox"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          {displayUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayUrls[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
          {displayUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {displayUrls.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default PostImageList;
