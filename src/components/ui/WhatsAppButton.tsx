import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { SITE_CONFIG } from '../../lib/constants';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
    'Hola, me interesa obtener mas informacion sobre sus propiedades.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="relative flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-lg ring-1 ring-black/5">
          <p className="text-sm font-medium text-text-primary whitespace-nowrap">
            Escríbenos por WhatsApp
          </p>
          <button
            onClick={() => setShowTooltip(false)}
            className="ml-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Cerrar tooltip"
          >
            <X size={14} />
          </button>
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5 [clip-path:polygon(100%_0,0_100%,100%_100%)]" />
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/30"
        aria-label="Contactar por WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
      >
        <MessageCircle
          size={28}
          className="transition-transform duration-300 group-hover:scale-110"
          fill="currentColor"
          strokeWidth={0}
        />
      </a>
    </div>
  );
}
