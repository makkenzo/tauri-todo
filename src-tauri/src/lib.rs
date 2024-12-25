use serde::Serialize;
use tauri::{ipc::Channel, AppHandle};

struct Database;

#[derive(serde::Serialize)]
struct CustomResponse {
    message: String,
    other_val: usize,
}

async fn some_other_function() -> Option<String> {
    Some("response".into())
}

#[tauri::command]
async fn my_custom_command(
    window: tauri::Window,
    number: usize,
    _database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
    println!("Called from {}", window.label());
    let result: Option<String> = some_other_function().await;
    if let Some(message) = result {
        Ok(CustomResponse {
            message,
            other_val: 42 + number,
        })
    } else {
        Err("No result".into())
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum DownloadEvent<'a> {
    #[serde(rename_all = "camelCase")]
    Started {
        url: &'a str,
        download_id: usize,
        content_length: usize,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        download_id: usize,
        chunk_length: usize,
    },
    #[serde(rename_all = "camelCase")]
    Finished { download_id: usize },
}

#[tauri::command]
fn download(app: AppHandle, url: String, on_event: Channel<DownloadEvent>) {
    let content_length = 1000;
    let download_id = 1;

    on_event
        .send(DownloadEvent::Started {
            url: &url,
            download_id,
            content_length,
        })
        .unwrap();

    for chunk_length in [15, 150, 35, 500, 300] {
        on_event
            .send(DownloadEvent::Progress {
                download_id,
                chunk_length,
            })
            .unwrap();
    }

    on_event
        .send(DownloadEvent::Finished { download_id })
        .unwrap();
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name).into()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Database {})
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, my_custom_command, download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
