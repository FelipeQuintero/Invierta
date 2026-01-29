import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';

interface Props {
  initialQuery?: string;
}

export default function PropertySearch({ initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    const url = new URL(window.location.href);
    if (searchQuery.trim()) {
      url.searchParams.set('query', searchQuery.trim());
    } else {
      url.searchParams.delete('query');
    }
    window.location.href = url.toString();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    handleSearch(query);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl" role="search">
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: 'var(--color-text-muted)' }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Buscar por nombre, ubicacion o descripcion..."
          aria-label="Buscar propiedades"
          className="w-full rounded-lg border bg-white pl-11 pr-4 py-3 text-sm focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 58, 75, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </form>
  );
}
