mod k8s;

use lazy_static::lazy_static;
use log::{Level, LevelFilter, Metadata, Record, SetLoggerError};
use std::sync::{Arc, Mutex};

struct MemoryLogger {
    logs: Arc<Mutex<Vec<String>>>,
}

impl log::Log for MemoryLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            let msg = format!("{} - {}", record.level(), record.args());
            if let Ok(mut logs) = self.logs.lock() {
                logs.push(msg.clone());
            }

            println!("{}", msg);
        }
    }

    fn flush(&self) {}
}

lazy_static! {
    static ref MEMORY_LOGS: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));
    static ref LOGGER: MemoryLogger = MemoryLogger {
        logs: MEMORY_LOGS.clone()
    };
}

pub fn init_logger() -> Result<(), SetLoggerError> {
    log::set_logger(&*LOGGER).map(|()| log::set_max_level(LevelFilter::Info))
}

pub fn get_logs() -> Vec<String> {
    MEMORY_LOGS.lock().unwrap().clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logger().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Api Resources
            k8s::client::list_apiresources,
            k8s::client::list_dynamic_resource,
            k8s::client::get_dynamic_resource,
            k8s::client::delete_dynamic_resource,
            k8s::client::watch_dynamic_resource,
            k8s::client::lookup_configs,
            k8s::client::get_version,
            k8s::client::update_kube_object,
            // Pod
            k8s::client::get_pod_logs,
            k8s::client::stream_pod_logs,
            // Node
            k8s::client::drain_node,
            k8s::client::cordon_node,
            k8s::client::uncordon_node,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
