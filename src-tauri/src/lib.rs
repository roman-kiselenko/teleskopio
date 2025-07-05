mod k8s;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            k8s::client::get_version,
            k8s::client::get_namespaces,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
