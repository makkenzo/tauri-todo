'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

type Todo = {
    id: number;
    title: string;
    completed: boolean;
};

export default function Page() {
    const [title, setTitle] = useState<string>('');

    const [todos, setTodos] = useState<Todo[]>([]);

    const getTodos = async () => {
        await invoke<Todo[]>('list_todos').then((res) => {
            setTodos(res);
        });
    };

    const addTodo = async () => {
        await invoke<Todo>('add_todo', { title }).then(() => {
            setTitle('');
        });
        await getTodos();
    };

    useEffect(() => {
        const invokeRust = async () => {
            await getTodos();
        };

        invokeRust();
    }, []);

    return (
        <div className="flex flex-col py-8 gap-4 container mx-auto">
            <div className="flex gap-2 items-center">
                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Button onClick={addTodo}>Add</Button>
            </div>
            {todos.length > 0 && todos.map((todo, idx) => <Todo key={idx} todo={todo} getTodos={getTodos} />)}
        </div>
    );
}

const Todo: React.FC<{ todo: Todo; getTodos: () => Promise<void> }> = ({ todo, getTodos }) => {
    const [checked, setChecked] = useState(todo.completed);

    return (
        <div className="flex flex-col gap-2 p-4 border-2 border-border rounded-md">
            <div className="flex items-center gap-2">
                <Checkbox
                    id={`todo-${todo.id}`}
                    checked={checked}
                    onCheckedChange={async (val) => {
                        await invoke('toggle_todo', { id: todo.id });
                        setChecked(val as boolean);
                    }}
                />
                <Label htmlFor={`todo-${todo.id}`} className="text-sm">
                    {todo.title}
                </Label>
            </div>
            <Button
                onClick={async () => {
                    invoke('delete_todo', { id: todo.id });
                    await getTodos();
                }}
            >
                Delete
            </Button>
        </div>
    );
};
