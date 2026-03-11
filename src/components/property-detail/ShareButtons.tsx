import { useMemo, useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

function copyFallback(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const encodedUrl = useMemo(() => encodeURIComponent(url), [url]);
  const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const tiktokUrl = `https://www.tiktok.com/share?url=${encodedUrl}&title=${encodedTitle}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        copyFallback(url);
      }

      setCopyState('success');
    } catch {
      setCopyState('error');
    } finally {
      window.setTimeout(() => setCopyState('idle'), 2200);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 sm:justify-end">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
      >
        Copiar link
      </button>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
      >
        Facebook
      </a>

      <a
        href={tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
      >
        TikTok
      </a>

      <span
        className={`text-xs ${copyState === 'error' ? 'text-red-600' : 'text-success'}`}
        aria-live="polite"
      >
        {copyState === 'success' && '¡Link copiado!'}
        {copyState === 'error' && 'No se pudo copiar el link'}
      </span>
    </div>
  );
}
