mod k8s;

use log::{Record, Level, Metadata, SetLoggerError, LevelFilter};
use std::sync::{Mutex, Arc};
use lazy_static::lazy_static;

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
    log::set_logger(&*LOGGER)
        .map(|()| log::set_max_level(LevelFilter::Info))
}

// Доступ к логам
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
            k8s::client::lookup_configs,
            k8s::client::get_version,
            k8s::client::get_namespaces,
            k8s::client::get_nodes,
            k8s::client::get_pods,
            k8s::client::delete_pod,
            k8s::client::get_deployments,
            k8s::client::delete_deployment,
            k8s::client::get_daemonset,
            k8s::client::delete_daemonset,
            k8s::client::get_replicaset,
            k8s::client::delete_replicaset,
            k8s::client::get_statefulset,
            k8s::client::delete_statefulset,
            k8s::client::get_jobs,
            k8s::client::delete_job,
            k8s::client::get_cronjobs,
            k8s::client::delete_cronjob,
            k8s::client::get_configmaps,
            k8s::client::delete_configmap,
            k8s::client::get_secrets,
            k8s::client::delete_secret,
            k8s::client::get_services,
            k8s::client::delete_service,
            k8s::client::get_ingresses,
            k8s::client::delete_ingress,
            k8s::client::get_networkpolicies,
            k8s::client::delete_networkpolicy,
            k8s::client::get_serviceaccounts,
            k8s::client::get_roles,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
