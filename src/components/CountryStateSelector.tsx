import { useState, useMemo, useRef, useEffect } from 'react';
import { Country, State, ICountry, IState } from 'country-state-city';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, Search } from 'lucide-react';

interface CountryStateSelectorProps {
  country: string;
  state: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
}

export const CountryStateSelector = ({ country, state, onCountryChange, onStateChange }: CountryStateSelectorProps) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() =>
    countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
    [countries, countrySearch]
  );

  const selectedCountry = useMemo(() =>
    countries.find(c => c.name.toLowerCase() === country.toLowerCase()),
    [countries, country]
  );

  const states = useMemo(() =>
    selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : [],
    [selectedCountry]
  );

  const filteredStates = useMemo(() =>
    states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())),
    [states, stateSearch]
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <div className="space-y-2" ref={countryRef}>
        <Label>Country</Label>
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => { setCountryOpen(!countryOpen); setStateOpen(false); }}
          >
            <span className={country ? '' : 'text-muted-foreground'}>{country || 'Select country'}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {countryOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {filteredCountries.map(c => (
                  <button
                    key={c.isoCode}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${country.toLowerCase() === c.name.toLowerCase() ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    onClick={() => {
                      onCountryChange(c.name);
                      if (selectedCountry?.isoCode !== c.isoCode) onStateChange('');
                      setCountryOpen(false);
                      setCountrySearch('');
                    }}
                  >
                    <span>{c.flag}</span>
                    <span className="flex-1">{c.name}</span>
                    {country.toLowerCase() === c.name.toLowerCase() && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No countries found</p>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2" ref={stateRef}>
        <Label>State / Province</Label>
        <div className="relative">
          <button
            type="button"
            disabled={!country || states.length === 0}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => { setStateOpen(!stateOpen); setCountryOpen(false); }}
          >
            <span className={state ? '' : 'text-muted-foreground'}>
              {state || (states.length === 0 ? 'No states available' : 'Select state')}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {stateOpen && states.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  placeholder="Search states..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {filteredStates.map(s => (
                  <button
                    key={s.isoCode}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${state.toLowerCase() === s.name.toLowerCase() ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    onClick={() => {
                      onStateChange(s.name);
                      setStateOpen(false);
                      setStateSearch('');
                    }}
                  >
                    <span className="flex-1">{s.name}</span>
                    {state.toLowerCase() === s.name.toLowerCase() && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
                {filteredStates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No states found</p>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
