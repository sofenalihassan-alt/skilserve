import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Clock, Wrench, Zap, Hammer, Paintbrush, SprayCan, Wind, TreePine, HardHat } from "lucide-react";

const POPULAR_CATEGORIES = [
  { label: "Electrician", value: "electrical", icon: Zap },
  { label: "Plumber", value: "plumbing", icon: Wrench },
  { label: "Carpenter", value: "carpentry", icon: Hammer },
  { label: "Painter", value: "painting", icon: Paintbrush },
  { label: "Cleaner", value: "cleaning", icon: SprayCan },
  { label: "HVAC", value: "hvac", icon: Wind },
  { label: "Landscaping", value: "landscaping", icon: TreePine },
  { label: "Handyman", value: "handyman", icon: HardHat },
] as const;

const RECENT_KEY = "command-palette-recent";
const MAX_RECENT = 5;

type Provider = {
  id: string | null;
  business_name: string | null;
  category: string | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  availability_24_7: boolean | null;
  specialization: string | null;
};

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const recent = getRecent().filter((r) => r !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Custom event from Header search button
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  // Load recent on open
  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const term = `%${query.trim()}%`;
      const { data } = await supabase
        .from("public_service_providers")
        .select("id, business_name, category, hourly_rate, avatar_url, availability_24_7, specialization")
        .or(`business_name.ilike.${term},category.ilike.${term},specialization.ilike.${term}`)
        .limit(8);
      setResults((data as Provider[]) || []);
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectProvider = useCallback(
    (provider: Provider) => {
      if (provider.business_name) {
        saveRecent(provider.business_name);
        navigate(`/providers?search=${encodeURIComponent(provider.business_name)}`);
      }
      setOpen(false);
    },
    [navigate]
  );

  const selectCategory = useCallback(
    (value: string, label: string) => {
      saveRecent(label);
      navigate(`/providers?category=${encodeURIComponent(value)}`);
      setOpen(false);
    },
    [navigate]
  );

  const selectRecent = useCallback(
    (term: string) => {
      navigate(`/providers?search=${encodeURIComponent(term)}`);
      setOpen(false);
    },
    [navigate]
  );

  const showDefaults = !query.trim();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search providers, categories…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{loading ? "Searching…" : "No results found."}</CommandEmpty>

        {showDefaults && recent.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {recent.map((term) => (
              <CommandItem key={term} onSelect={() => selectRecent(term)}>
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                {term}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {showDefaults && (
          <CommandGroup heading="Popular Categories">
            {POPULAR_CATEGORIES.map(({ label, value, icon: Icon }) => (
              <CommandItem key={value} onSelect={() => selectCategory(value, label)}>
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!showDefaults && results.length > 0 && (
          <CommandGroup heading="Instant Results">
            {results.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => selectProvider(p)}
                className="flex items-center gap-3"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {p.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 items-center gap-2 min-w-0">
                  {p.availability_24_7 && (
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                  )}
                  <span className="truncate font-medium">{p.business_name}</span>
                  {p.availability_24_7 && (
                    <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Live</span>
                  )}
                </div>

                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {p.category}
                </Badge>

                {p.hourly_rate != null && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    ${p.hourly_rate}/hr
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
