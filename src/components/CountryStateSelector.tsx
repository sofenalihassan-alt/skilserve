import { useState, useMemo } from 'react';
import { Country, State } from 'country-state-city';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Check } from 'lucide-react';

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

  const countries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() =>
    countries.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countries, countrySearch]);

  const selectedCountry = useMemo(() =>
    countries.find(c => c.name === country), [countries, country]);

  const states = useMemo(() =>
    selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : [],
    [selectedCountry]);

  const filteredStates = useMemo(() =>
    states.filter(s =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase())
    ), [states, stateSearch]);

  return (
    <>
      <div className="space-y-2">
        <Label>Country</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between bg-background/50 font-normal" type="button">
              {country || 'Select country'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" sideOffset={4}>
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <ScrollArea className="h-[200px]">
              {filteredCountries.map(c => (
                <button
                  key={c.isoCode}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${country === c.name ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => {
                    onCountryChange(c.name);
                    onStateChange('');
                    setCountryOpen(false);
                    setCountrySearch('');
                  }}
                >
                  <span>{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  {country === c.name && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No countries found</p>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>State / Province</Label>
        <Popover open={stateOpen} onOpenChange={setStateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={stateOpen}
              className="w-full justify-between bg-background/50 font-normal"
              disabled={!country || states.length === 0}
              type="button"
            >
              {state || (states.length === 0 ? 'No states available' : 'Select state')}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" sideOffset={4}>
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Search states..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <ScrollArea className="h-[200px]">
              {filteredStates.map(s => (
                <button
                  key={s.isoCode}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${state === s.name ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => {
                    onStateChange(s.name);
                    setStateOpen(false);
                    setStateSearch('');
                  }}
                >
                  <span className="flex-1">{s.name}</span>
                  {state === s.name && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
              {filteredStates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No states found</p>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};
