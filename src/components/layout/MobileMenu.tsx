import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Phone, MessageCircle, Home, Users, House, KeyRound, Wallet, ArrowUpRight } from 'lucide-react';
import { NAV_LINKS, QUICK_LINKS, SITE_CONFIG, CLIENT_ACCESS, PSE_PAYMENT } from '../../lib/constants';

const CLIENT_ICONS = { owner: House, tenant: KeyRound, payment: Wallet } as const;

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [pathname, setPathname] = useState('');
  const [pseLogoFailed, setPseLogoFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPathname(window.location.pathname);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

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
    'Hola, me interesa obtener más información sobre sus propiedades.'
  )}`;

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-primary hover:bg-surface transition-colors"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <Menu size={24} />
      </button>

      {/* El panel se monta en <body>: el header usa backdrop-blur, que recorta los
          elementos "fixed" internos y generaba scroll horizontal */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Slide-in Panel */}
          <div
            className={`fixed top-0 right-0 z-[60] flex h-full w-[min(340px,88vw)] flex-col overflow-y-auto overscroll-contain bg-white pb-6 shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full invisible'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-heading text-lg font-bold text-primary">
                {SITE_CONFIG.name}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                aria-label="Cerrar menú de navegación"
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

            {/* Zona de clientes */}
            <div className="mx-4 mb-4 rounded-2xl bg-surface p-3">
              <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Zona de clientes
              </p>
              <nav className="flex flex-col gap-1.5" aria-label="Portales y pagos">
                {CLIENT_ACCESS.map((item) => {
                  const Icon = CLIENT_ICONS[item.icon];
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      aria-label={`${item.label} (se abre en una pestaña nueva)`}
                      className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                        item.featured
                          ? 'bg-accent text-white hover:bg-accent-dark'
                          : 'bg-white text-text-primary hover:bg-surface-alt'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          item.featured ? 'bg-white/20 text-white' : 'bg-navy/10 text-navy'
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ArrowUpRight size={16} className="shrink-0 opacity-60" aria-hidden="true" />
                    </a>
                  );
                })}
                <a
                  href={PSE_PAYMENT.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  aria-label={`${PSE_PAYMENT.label}: estudios y otros pagos (se abre en una pestaña nueva)`}
                  className="flex min-h-[48px] items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-surface-alt"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                    {pseLogoFailed ? (
                      <span className="text-[9px] font-extrabold tracking-tight text-navy">PSE</span>
                    ) : (
                      <img
                        src={PSE_PAYMENT.logo}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                        onError={() => setPseLogoFailed(true)}
                      />
                    )}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span>{PSE_PAYMENT.label}</span>
                    <span className="text-xs font-normal text-text-muted">Estudios y otros pagos</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 opacity-60" aria-hidden="true" />
                </a>
              </nav>
            </div>

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
            <nav className="flex flex-col px-3 py-3" aria-label="Enlaces rápidos">
              {QUICK_LINKS.map((link) => {
                const IconComponent = { Home, Users }[link.icon] || Users;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-surface hover:text-text-primary"
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <IconComponent size={16} className="shrink-0" aria-hidden="true" />
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
        </>,
        document.body
      )}
    </div>
  );
}
