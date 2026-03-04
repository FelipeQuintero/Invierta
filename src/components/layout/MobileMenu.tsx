import { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, User, UserCheck, CreditCard, Home, Users } from 'lucide-react';
import { NAV_LINKS, TOP_BAR_LINKS, SITE_CONFIG } from '../../lib/constants';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
    'Hola, me interesa obtener mas informacion sobre sus propiedades.'
  )}`;

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-primary hover:bg-surface transition-colors"
        aria-label="Abrir menu de navegacion"
        aria-expanded={isOpen}
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[min(320px,85vw)] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegacion"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-heading text-lg font-bold text-primary">
            {SITE_CONFIG.name}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-surface hover:text-primary transition-colors"
            aria-label="Cerrar menu de navegacion"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col px-3 py-4" aria-label="Menu principal">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-text-secondary hover:bg-surface hover:text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-secondary" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 border-t border-border" />

        {/* Contact Links */}
        <div className="flex flex-col gap-2 px-5 py-5">
          <a
            href={`tel:${SITE_CONFIG.phone}`}
            className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt"
          >
            <Phone size={18} className="text-primary" />
            <span>{SITE_CONFIG.phone}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg bg-[#25D366]/10 px-4 py-3 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
          >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* CTA */}
        <div className="px-5">
          <a
            href="/servicios"
            className="btn-primary w-full text-center text-sm"
            onClick={() => setIsOpen(false)}
          >
            Contactar
          </a>
        </div>

        {/* Secondary Links */}
        <div className="mx-5 mt-5 border-t border-border" />
        <nav className="flex flex-col px-3 py-3" aria-label="Enlaces rapidos">
          {TOP_BAR_LINKS.map((link) => {
            const IconComponent = {
              User,
              UserCheck,
              CreditCard,
              Home,
              Users,
            }[link.icon] || User;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-medium text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text-secondary"
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <IconComponent size={14} className="shrink-0" />
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Keyframe for overlay fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
