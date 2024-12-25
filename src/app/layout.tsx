'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // Ensures the theme is only applied client-side
    }, []);

    if (!mounted) {
        return (
            <html lang="en">
                <body className="h-screen w-full flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                </body>
            </html>
        ); // Avoid rendering ThemeProvider during SSR
    }

    return (
        <html lang="en">
            <body className="transition-all duration-300 ease-in-out">
                <ThemeProvider attribute="class" defaultTheme="dark">
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
