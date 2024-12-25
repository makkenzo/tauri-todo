'use client';

import { Channel, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';

type DownloadEvent =
    | {
          event: 'started';
          data: {
              url: string;
              downloadId: number;
              contentLength: number;
          };
      }
    | {
          event: 'progress';
          data: {
              downloadId: number;
              chunkLength: number;
          };
      }
    | {
          event: 'finished';
          data: {
              downloadId: number;
          };
      };

export default function Page() {
    const [greet, setGreet] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const invokeRust = async () => {
            await invoke('greet', { name: 'World' }).then((res) => {
                setGreet(res as string);
            });

            await invoke('my_custom_command', { number: 42 })
                .then((res: any) => setMessage(`Message: ${res.message}, Other Val: ${res.other_val}`))
                .catch((e) => console.error(e));

            const dwnldChannel = new Channel<DownloadEvent>();
            dwnldChannel.onmessage = (message) => {
                setMessages((prev) => [
                    ...prev,
                    `got download event: ${message.event} with data: url-${JSON.stringify(message.data)}`,
                ]);
            };

            await invoke('download', {
                url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKIN6h9WJ1N5pBdhksJ-S3GDRhUHlrJ5kZng&s',
                onEvent: dwnldChannel,
            });
        };

        invokeRust();
    }, []);

    return (
        <div className="flex flex-col p-8">
            <h1>Hello, Next.js!</h1>

            {greet ? <p>{greet}</p> : null}
            {message ? <p>{message}</p> : null}
            {messages.length > 0 && messages.map((msg, idx) => <p key={idx}>{msg}</p>)}
        </div>
    );
}
