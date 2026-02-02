import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainLoaded, setMainLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle already-loaded images (cached or fast load)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setMainLoaded(true);
    }
  }, [currentIndex, images]);

  const goToPrevious = useCallback(() => {
    setMainLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setMainLoaded(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const selectImage = useCallback((index: number) => {
    setMainLoaded(false);
    setCurrentIndex(index);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] text-lg">Sin imagenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden bg-gray-200 group">
        {!mainLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
        <img
          ref={imgRef}
          src={images[currentIndex]}
          alt={`${title} - Imagen ${currentIndex + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${mainLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setMainLoaded(true)}
          onError={() => setMainLoaded(true)}
          referrerPolicy="no-referrer"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 text-[var(--color-text-primary)]" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`shrink-0 w-20 h-16 md:w-24 md:h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                index === currentIndex
                  ? 'border-[var(--color-secondary)] shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={img}
                alt={`${title} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
