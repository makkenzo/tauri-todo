'use client';

import { Channel, invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

type Todo = {
    id: number;
    title: string;
    completed: boolean;
};

export default function Page() {
    const [title, setTitle] = useState<string>();

    const [todos, setTodos] = useState<Todo[]>([]);

    const addTodo = async () => {
        await invoke('add_todo', { title }).then((res) => {
            setTitle('');
        });
        await invoke('list_todos').then((res) => {
            setTodos(res as Todo[]);
        });
    };

    useEffect(() => {
        const invokeRust = async () => {
            await invoke('list_todos').then((res) => {
                setTodos(res as Todo[]);
            });
        };

        invokeRust();
    }, []);

    return (
        <div className="flex flex-col p-8">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 border-black rounded-md p-2"
            />
            <button onClick={addTodo} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add todo
            </button>
            {todos.length > 0 && todos.map((todo, idx) => <p key={idx}>{todo.title}</p>)}
        </div>
    );
}
