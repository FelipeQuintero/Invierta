import { useState, useEffect, useRef, useCallback } from 'react';
import { getSuggestions, getTypeLabel, preloadCatalog } from '../../lib/locationSearch';
import type { LocationSuggestion } from '../../lib/locationSearch';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
  id?: string;
}

const TYPE_COLORS: Record<LocationSuggestion['type'], string> = {
  departamento: 'bg-blue-100 text-blue-700',
  ciudad: 'bg-emerald-100 text-emerald-700',
  zona: 'bg-amber-100 text-amber-700',
  barrio: 'bg-purple-100 text-purple-700',
};

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Ciudad, zona o barrio',
  className = '',
  inputClassName = '',
  label,
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Calculate dropdown position for fixed positioning (escapes overflow contexts)
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  // Preload catalog on mount
  useEffect(() => {
    preloadCatalog();
  }, []);

  // Update dropdown position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    const handleScrollOrResize = () => updateDropdownPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const results = await getSuggestions(query);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setActiveIndex(-1);
    setIsLoading(false);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 200);
  }

  function selectSuggestion(suggestion: LocationSuggestion) {
    onChange(suggestion.name);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect?.(suggestion);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  function handleFocus() {
    if (value.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }

  const listboxId = id ? `${id}-listbox` : 'location-autocomplete-listbox';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5 pl-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={inputClassName}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-label={label || placeholder}
          autoComplete="off"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-64 overflow-y-auto"
          style={dropdownStyle}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.simiId}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                index === activeIndex
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                  : 'hover:bg-[var(--color-surface)]'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${TYPE_COLORS[suggestion.type]}`}
              >
                {getTypeLabel(suggestion.type)}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {suggestion.name}
                </span>
                {(suggestion.city || suggestion.department) && (
                  <span className="text-xs text-[var(--color-text-muted)] truncate">
                    {[suggestion.city, suggestion.department].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
