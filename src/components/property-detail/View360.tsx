import { useState } from 'react';

interface View360Props {
  url?: string;
}

export default function View360({ url }: View360Props) {
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Vista 360
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-2 border border-[var(--color-border)]">
          <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm">Vista 360 no disponible para esta propiedad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
        Vista 360
      </h3>
      <div className="w-full h-80 md:h-[480px] rounded-xl overflow-hidden border border-[var(--color-border)] relative bg-[var(--color-surface)]">
        {!loaded && (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <p className="text-[var(--color-text-muted)] text-sm">Cargando vista 360...</p>
          </div>
        )}
        <iframe
          title="Vista 360 de la propiedad"
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
