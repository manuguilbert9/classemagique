'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Theme = 'default' | 'christmas';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'default',
    setTheme: async () => { },
    isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('default');
    const [isLoading, setIsLoading] = useState(true);

    // Listen to global settings
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.theme) {
                    setThemeState(data.theme as Theme);
                }
            }
            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    // Apply theme class to body
    useEffect(() => {
        const root = window.document.documentElement;

        // Remove existing theme classes
        root.classList.remove('theme-christmas');

        // Add new theme class if not default
        if (theme === 'christmas') {
            root.classList.add('theme-christmas');
        }
    }, [theme]);

    const setTheme = async (newTheme: Theme) => {
        try {
            await setDoc(doc(db, 'settings', 'global'), { theme: newTheme }, { merge: true });
        } catch (error) {
            console.error("Error setting theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};
