import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Video, MapPin, Compass, RotateCw } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'fotos', label: 'Fotos', icon: <Camera className="w-4 h-4" /> },
  { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { id: 'mapa', label: 'Mapa', icon: <MapPin className="w-4 h-4" /> },
  { id: 'zona', label: 'Conocer la zona', icon: <Compass className="w-4 h-4" /> },
  { id: 'fotos-360', label: 'Fotos 360', icon: <RotateCw className="w-4 h-4" /> },
];

const HEADER_OFFSET_MOBILE = 64;
const HEADER_OFFSET_DESKTOP = 80;
const TAB_BAR_HEIGHT = 52;

function getHeaderOffset() {
  if (typeof window === 'undefined') return HEADER_OFFSET_MOBILE;
  return window.innerWidth >= 1024 ? HEADER_OFFSET_DESKTOP : HEADER_OFFSET_MOBILE;
}

export default function PropertyDetailTabs() {
  const [activeTab, setActiveTab] = useState('fotos');
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeIndicatorRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateIndicator = useCallback((tabId: string) => {
    const button = tabButtonRefs.current.get(tabId);
    const indicator = activeIndicatorRef.current;
    if (!button || !indicator) return;

    const container = button.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    indicator.style.width = `${buttonRect.width}px`;
    indicator.style.transform = `translateX(${buttonRect.left - containerRect.left}px)`;
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const totalOffset = getHeaderOffset() + TAB_BAR_HEIGHT + 16;
    const top = section.getBoundingClientRect().top + window.scrollY - totalOffset;

    window.scrollTo({ top, behavior: 'smooth' });

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    updateIndicator(tabId);
    scrollToSection(tabId);
  }, [updateIndicator, scrollToSection]);

  useEffect(() => {
    const sectionIds = TABS.map((t) => t.id);
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length === 0) return;

        const topEntry = visibleEntries.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
        );

        const id = topEntry.target.id;
        if (id && id !== activeTab) {
          setActiveTab(id);
          updateIndicator(id);
        }
      },
      {
        rootMargin: `-${getHeaderOffset() + TAB_BAR_HEIGHT + 20}px 0px -40% 0px`,
        threshold: 0,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    updateIndicator(activeTab);

    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    if (!tabsRef.current) return;

    const sentinel = tabsRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        rootMargin: `-${getHeaderOffset() + 1}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const button = tabButtonRefs.current.get(activeTab);
    if (!button) return;

    button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  return (
    <>
      <div ref={tabsRef} className="h-0 w-full" />
      <nav
        className={`sticky top-16 lg:top-20 z-30 bg-white border-b border-[var(--color-border)] transition-shadow duration-200 ${
          isSticky ? 'shadow-md' : ''
        }`}
        aria-label="Secciones de la propiedad"
      >
        <div className="container-custom">
          <div className="relative flex overflow-x-auto scrollbar-none -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabButtonRefs.current.set(tab.id, el);
                }}
                onClick={() => handleTabClick(tab.id)}
                className={`flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
                aria-current={activeTab === tab.id ? 'true' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <div
              ref={activeIndicatorRef}
              className="absolute bottom-0 h-[3px] bg-[var(--color-accent)] rounded-t-full transition-all duration-300 ease-out"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
