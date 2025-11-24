'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/context/theme-context';
import { Palette, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Thème de l'application
                </CardTitle>
                <CardDescription>
                    Choisissez l'ambiance visuelle pour tous les utilisateurs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={theme}
                    onValueChange={(val) => setTheme(val as 'default' | 'christmas')}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div>
                        <RadioGroupItem value="default" id="default" className="peer sr-only" />
                        <Label
                            htmlFor="default"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                            <div className="mb-2 rounded-full bg-slate-100 p-2">
                                <Palette className="h-6 w-6 text-slate-600" />
                            </div>
                            <div className="font-bold text-lg">Classique</div>
                            <div className="text-sm text-muted-foreground text-center mt-1">
                                Le style standard de Classe Magique.
                            </div>
                        </Label>
                    </div>

                    <div>
                        <RadioGroupItem value="christmas" id="christmas" className="peer sr-only" />
                        <Label
                            htmlFor="christmas"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                                theme === 'christmas' && "border-red-500 bg-red-50"
                            )}
                        >
                            <div className="mb-2 rounded-full bg-red-100 p-2">
                                <Snowflake className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="font-bold text-lg text-red-700">Noël Aquarelle</div>
                            <div className="text-sm text-red-600/80 text-center mt-1">
                                Ambiance festive, couleurs chaudes et textures papier.
                            </div>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
