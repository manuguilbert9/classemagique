'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ImagePlus } from 'lucide-react';

interface ArasaacResult {
    _id: number;
    sex?: boolean;
    violence?: boolean;
    keywords?: { keyword: string }[];
}

interface PictoPickerProps {
    onSelect: (url: string, alt: string) => void;
}

function pictoUrl(id: number): string {
    return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
}

/**
 * Popover de recherche de pictogrammes ARASAAC, insérés comme images dans le document.
 */
export function PictoPicker({ onSelect }: PictoPickerProps) {
    const [open, setOpen] = useState(false);
    const [term, setTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ArasaacResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const search = async () => {
        const mot = term.trim();
        if (!mot) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const response = await fetch(`https://api.arasaac.org/v1/pictograms/fr/search/${encodeURIComponent(mot)}`);
            const data = response.ok ? await response.json() : [];
            setResults(Array.isArray(data) ? data.filter((p: ArasaacResult) => !p.sex && !p.violence).slice(0, 15) : []);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="gap-1.5" title="Insérer un pictogramme ARASAAC">
                    <ImagePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Picto</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                    <p className="text-sm font-medium">Chercher un pictogramme</p>
                    <div className="flex gap-2">
                        <Input
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }}
                            placeholder="ex : chat, manger, content..."
                            className="h-9"
                        />
                        <Button type="button" size="sm" onClick={search} disabled={isSearching || !term.trim()}>
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                    {isSearching && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isSearching && hasSearched && results.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">Aucun pictogramme trouvé.</p>
                    )}
                    {!isSearching && results.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                            {results.map((r) => (
                                <button
                                    type="button"
                                    key={r._id}
                                    onClick={() => {
                                        onSelect(pictoUrl(r._id), r.keywords?.[0]?.keyword ?? term.trim());
                                        setOpen(false);
                                    }}
                                    className="rounded-md border bg-muted/30 p-1 hover:border-primary hover:bg-muted transition-colors"
                                    title={r.keywords?.[0]?.keyword ?? ''}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={pictoUrl(r._id)} alt={r.keywords?.[0]?.keyword ?? ''} className="w-full aspect-square object-contain" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground text-right">Pictogrammes ARASAAC (arasaac.org)</p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
