'use client';

import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export default function Page() {
    const [greet, setGreet] = useState('');

    useEffect(() => {
        const invokeRust = async () => {
            await invoke('greet', { name: 'World' }).then((res) => {
                setGreet(res as string);
            });
        };

        invokeRust();
    }, []);

    return (
        <div className="flex flex-col p-8">
            <h1>Hello, Next.js!</h1>

            {greet ? greet : null}
        </div>
    );
}
