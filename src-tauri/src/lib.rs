use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::State;

struct Database {
    todos: Mutex<Vec<Todo>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Todo {
    id: usize,
    title: String,
    completed: bool,
}

impl Database {
    fn new() -> Self {
        Database {
            todos: Mutex::new(Vec::new()),
        }
    }

    fn add_todo(&self, title: String) -> Todo {
        let mut todos = self.todos.lock().unwrap();
        let id = todos.len() + 1;
        let todo = Todo {
            id,
            title,
            completed: false,
        };
        todos.push(todo.clone());
        todo
    }

    fn list_todos(&self) -> Vec<Todo> {
        let todos = self.todos.lock().unwrap();
        todos.clone()
    }

    fn toggle_todo(&self, id: usize) -> Option<Todo> {
        let mut todos = self.todos.lock().unwrap();
        if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
            todo.completed = !todo.completed;
            Some(todo.clone())
        } else {
            None
        }
    }

    fn delete_todo(&self, id: usize) -> Option<Todo> {
        let mut todos = self.todos.lock().unwrap();
        if let Some(index) = todos.iter().position(|t| t.id == id) {
            Some(todos.remove(index))
        } else {
            None
        }
    }
}

#[tauri::command]
fn add_todo(title: String, database: State<'_, Database>) -> Todo {
    database.add_todo(title)
}

#[tauri::command]
fn list_todos(database: State<'_, Database>) -> Vec<Todo> {
    database.list_todos()
}

#[tauri::command]
fn toggle_todo(id: usize, database: State<'_, Database>) -> Result<Todo, String> {
    database
        .toggle_todo(id)
        .ok_or_else(|| "Todo not found".to_string())
}

#[tauri::command]
fn delete_todo(id: usize, database: State<'_, Database>) -> Result<Todo, String> {
    database
        .delete_todo(id)
        .ok_or_else(|| "Todo not found".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Database::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_todo,
            list_todos,
            toggle_todo,
            delete_todo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
