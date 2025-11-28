
import { HelpData } from "@/lib/adaptive-mental-math";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Circle, X } from "lucide-react";

interface MentalMathHelpProps {
    help: HelpData;
}

export function MentalMathHelp({ help }: MentalMathHelpProps) {
    if (help.type === 'visual-dots') {
        const { count1, count2, operation, label1, label2 } = help;
        const isAdd = operation === 'add';
        const isSub = operation === 'sub';

        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="font-bold text-blue-700 mb-2">Regarde bien :</p>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    {isSub ? (
                        <div className="flex flex-col items-center">
                            <div className="flex flex-wrap gap-1 max-w-[200px] justify-center">
                                {Array.from({ length: count1 }).map((_, i) => {
                                    const isCrossed = count2 !== undefined && i >= count1 - count2;
                                    return (
                                        <div key={`c1-${i}`} className="relative w-6 h-6 flex items-center justify-center">
                                            <div className={cn(
                                                "w-full h-full rounded-full shadow-sm transition-all",
                                                isCrossed ? "bg-blue-200" : "bg-blue-500"
                                            )} />
                                            {isCrossed && (
                                                <X className="absolute w-5 h-5 text-red-600" strokeWidth={3} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2 text-blue-700 font-medium">
                                {count1} - {count2} = {count1 - (count2 || 0)}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
                                    {Array.from({ length: count1 }).map((_, i) => (
                                        <div key={`c1-${i}`} className="w-6 h-6 rounded-full bg-blue-500 shadow-sm" />
                                    ))}
                                </div>
                                {label1 && <span className="text-sm text-blue-600 mt-1">{label1} ({count1})</span>}
                            </div>

                            {count2 !== undefined && (
                                <>
                                    <div className="text-2xl font-bold text-blue-400">
                                        {isAdd ? '+' : ''}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
                                            {Array.from({ length: count2 }).map((_, i) => (
                                                <div key={`c2-${i}`} className="w-6 h-6 rounded-full bg-green-500 shadow-sm" />
                                            ))}
                                        </div>
                                        {label2 && <span className="text-sm text-blue-600 mt-1">{label2} ({count2})</span>}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (help.type === 'visual-blocks') {
        const { hundreds, tens, units } = help;
        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="font-bold text-yellow-700 mb-2">Décompose le nombre :</p>
                <div className="flex items-end gap-6">
                    {hundreds && hundreds > 0 && (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-wrap gap-1 max-w-[100px] justify-center">
                                {Array.from({ length: hundreds }).map((_, i) => (
                                    <div key={`h-${i}`} className="w-16 h-16 bg-green-400 border-2 border-green-600 grid grid-cols-10 grid-rows-10 gap-[1px] p-[1px]">
                                        {Array.from({ length: 100 }).map((_, j) => <div key={j} className="bg-green-600/20 rounded-[1px]" />)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-green-700">{hundreds} centaine{hundreds > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {tens > 0 && (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-1">
                                {Array.from({ length: tens }).map((_, i) => (
                                    <div key={`t-${i}`} className="w-4 h-16 bg-red-400 border-2 border-red-600 flex flex-col justify-between p-[1px]">
                                        {Array.from({ length: 10 }).map((_, j) => <div key={j} className="h-[10%] w-full border-b border-red-600/20 last:border-0" />)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-red-700">{tens} dizaine{tens > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {units > 0 && (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-wrap gap-1 max-w-[60px]">
                                {Array.from({ length: units }).map((_, i) => (
                                    <div key={`u-${i}`} className="w-4 h-4 bg-blue-400 border-2 border-blue-600" />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-blue-700">{units} unité{units > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (help.type === 'number-line') {
        const { start, end, highlight, jump } = help;
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200 w-full overflow-x-auto">
                <p className="font-bold text-purple-700 mb-2">Utilise la file numérique :</p>
                <div className="flex items-center justify-center gap-1 min-w-max px-4">
                    {range.map(n => (
                        <div key={n} className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all",
                            n === highlight ? "bg-purple-500 text-white border-purple-600 scale-110" : "bg-white border-purple-200 text-purple-400",
                            jump && n === highlight + jump ? "bg-purple-200 border-purple-300" : ""
                        )}>
                            {n}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (help.type === 'visual-array') {
        const { rows, cols } = help;
        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="font-bold text-indigo-700 mb-2">Regarde le tableau :</p>
                <div className="flex flex-col gap-1">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex gap-1">
                            {Array.from({ length: cols }).map((_, j) => (
                                <div key={j} className="w-6 h-6 bg-indigo-400 rounded-sm" />
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-indigo-600 font-medium">{rows} rangées de {cols} = {rows * cols}</p>
            </div>
        )
    }

    if (help.type === 'visual-groups') {
        const { total, groupSize } = help;
        const numGroups = Math.floor(total / groupSize);

        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-pink-50 rounded-xl border border-pink-200">
                <p className="font-bold text-pink-700 mb-2">Fais des paquets de {groupSize} :</p>
                <div className="flex flex-wrap gap-4 justify-center max-w-[300px]">
                    {Array.from({ length: numGroups }).map((_, i) => (
                        <div key={i} className="border-2 border-pink-400 p-1 rounded-lg flex flex-wrap gap-1 w-[60px] justify-center bg-white">
                            {Array.from({ length: groupSize }).map((_, j) => (
                                <div key={j} className="w-3 h-3 bg-pink-400 rounded-full" />
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-pink-600 font-medium">{total} partagé en {groupSize} = {numGroups} paquets</p>
            </div>
        )
    }

    if (help.type === 'text-hint') {
        return (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                    <Box className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <p className="font-bold text-orange-800 mb-1">Petit conseil :</p>
                    <p className="text-orange-700">{help.text}</p>
                </div>
            </div>
        )
    }

    return null;
}
