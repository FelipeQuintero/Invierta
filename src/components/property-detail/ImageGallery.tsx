import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setMainLoaded(true);
    }
  }, [currentIndex, images]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen]);

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

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
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
          className={`w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${mainLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setMainLoaded(true)}
          onError={() => setMainLoaded(true)}
          onClick={openLightbox}
          referrerPolicy="no-referrer"
        />

        <button
          onClick={openLightbox}
          className="absolute top-3 left-3 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          aria-label="Ver imagen en pantalla completa"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>

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

        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

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

      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar vista completa"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center px-12 sm:px-16 py-16">
            <img
              src={images[currentIndex]}
              alt={`${title} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
