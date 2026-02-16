import { useState, useMemo } from 'react';
import { Country, State } from 'country-state-city';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';

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
            <Button variant="outline" className="w-full justify-between bg-background/50 font-normal">
              {country || 'Select country'}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2" align="start">
            <div className="flex items-center gap-2 px-2 pb-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="h-8 border-0 p-0 focus-visible:ring-0"
              />
            </div>
            <ScrollArea className="h-[250px] mt-1">
              {filteredCountries.map(c => (
                <button
                  key={c.isoCode}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors ${country === c.name ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => {
                    onCountryChange(c.name);
                    onStateChange('');
                    setCountryOpen(false);
                    setCountrySearch('');
                  }}
                >
                  {c.flag} {c.name}
                </button>
              ))}
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
              className="w-full justify-between bg-background/50 font-normal"
              disabled={!country || states.length === 0}
            >
              {state || (states.length === 0 ? 'No states available' : 'Select state')}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2" align="start">
            <div className="flex items-center gap-2 px-2 pb-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="h-8 border-0 p-0 focus-visible:ring-0"
              />
            </div>
            <ScrollArea className="h-[250px] mt-1">
              {filteredStates.map(s => (
                <button
                  key={s.isoCode}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors ${state === s.name ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => {
                    onStateChange(s.name);
                    setStateOpen(false);
                    setStateSearch('');
                  }}
                >
                  {s.name}
                </button>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};
