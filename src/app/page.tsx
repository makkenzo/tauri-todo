'use client';

import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export default function Page() {
    const [greet, setGreet] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const invokeRust = async () => {
            await invoke('greet', { name: 'World' }).then((res) => {
                setGreet(res as string);
            });

            await invoke('my_custom_command', { number: 42 })
                .then((res: any) => setMessage(`Message: ${res.message}, Other Val: ${res.other_val}`))
                .catch((e) => console.error(e));
        };

        invokeRust();
    }, []);

    return (
        <div className="flex flex-col p-8">
            <h1>Hello, Next.js!</h1>

            {greet ? <p>{greet}</p> : null}
            {message ? <p>{message}</p> : null}
        </div>
    );
}
