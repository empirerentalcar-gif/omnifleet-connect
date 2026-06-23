import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AgencyOption {
  id: string;
  agency_name: string;
  city: string | null;
  state: string | null;
}

const RECENTS_KEY = 'admin:recent-agencies';
const MAX_RECENTS = 5;

const readRecents = (): AgencyOption[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
};

const writeRecents = (list: AgencyOption[]) => {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
  } catch {
    /* ignore quota */
  }
};

export const pushRecentAgency = (agency: AgencyOption) => {
  const existing = readRecents().filter((a) => a.id !== agency.id);
  writeRecents([agency, ...existing]);
};

const AgencySearchBar = () => {
  const navigate = useNavigate();
  const { id: currentId } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<AgencyOption[]>(() => readRecents());

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('agencies')
      .select('id,agency_name,city,state')
      .order('agency_name', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setAgencies((data as AgencyOption[]) || []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Global "/" shortcut to focus the input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click outside closes dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = useMemo<AgencyOption[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show recents (filter out any that no longer exist in the loaded list, if list loaded)
      if (agencies.length === 0) return recents;
      const ids = new Set(agencies.map((a) => a.id));
      return recents.filter((r) => ids.has(r.id));
    }
    return agencies.filter((a) => a.agency_name.toLowerCase().includes(q)).slice(0, 10);
  }, [query, agencies, recents]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const selectAgency = (a: AgencyOption) => {
    pushRecentAgency(a);
    setRecents(readRecents());
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    if (a.id !== currentId) navigate(`/admin/agencies/${a.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) {
        e.preventDefault();
        selectAgency(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showRecentsLabel = !query.trim() && results.length > 0;

  return (
    <div ref={containerRef} className="relative mb-4 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Jump to agency…  (press / )"
          className="pl-9"
          aria-label="Search agencies"
          autoComplete="off"
        />
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden"
        >
          {showRecentsLabel && (
            <div className="px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              Recently viewed
            </div>
          )}
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {query.trim() ? 'No agencies match that name.' : 'No recently viewed agencies yet.'}
            </div>
          ) : (
            <ul className="max-h-72 overflow-auto py-1">
              {results.map((a, idx) => (
                <li
                  key={a.id}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAgency(a);
                  }}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-3',
                    idx === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground',
                  )}
                >
                  <span className="truncate font-medium">{a.agency_name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {[a.city, a.state].filter(Boolean).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AgencySearchBar;