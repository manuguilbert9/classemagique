
import { HelpData } from "@/lib/adaptive-mental-math";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Circle } from "lucide-react";

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
                                {isAdd ? '+' : isSub ? '-' : ''}
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
                                    {Array.from({ length: count2 }).map((_, i) => (
                                        <div key={`c2-${i}`} className={cn(
                                            "w-6 h-6 rounded-full shadow-sm",
                                            isSub ? "bg-red-200 border-2 border-red-400 opacity-50" : "bg-green-500"
                                        )} />
                                    ))}
                                </div>
                                {label2 && <span className="text-sm text-blue-600 mt-1">{label2} ({count2})</span>}
                            </div>
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
