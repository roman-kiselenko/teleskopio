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
            k8s::client::lookup_configs,
            k8s::client::get_version,
            // Namespaces
            k8s::client::get_namespaces,
            k8s::client::get_namespaces_page,
            k8s::client::delete_namespace,
            // Nodes
            k8s::client::get_nodes,
            k8s::client::cordon_node,
            k8s::client::uncordon_node,
            // Pods
            k8s::client::get_pods_page,
            k8s::client::pod_events,
            k8s::client::delete_pod,
            // Deployments
            k8s::client::get_deployments_page,
            k8s::client::deployment_events,
            k8s::client::delete_deployment,
            // DaemonSets
            k8s::client::get_daemonsets_page,
            k8s::client::daemonset_events,
            k8s::client::delete_daemonset,
            // ReplicaSets
            k8s::client::get_replicasets_page,
            k8s::client::replicaset_events,
            k8s::client::delete_replicaset,
            // StatefulSets
            k8s::client::get_statefulsets_page,
            k8s::client::statefulset_events,
            k8s::client::delete_statefulset,
            // Jobs
            k8s::client::get_jobs_page,
            k8s::client::job_events,
            k8s::client::delete_job,
            // CronJobs
            k8s::client::get_cronjobs_page,
            k8s::client::cronjob_events,
            k8s::client::delete_cronjob,
            // ConfigMaps
            k8s::client::get_configmaps_page,
            k8s::client::configmap_events,
            k8s::client::delete_configmap,
            // Secrets
            k8s::client::get_secrets_page,
            k8s::client::secret_events,
            k8s::client::delete_secret,
            // Services
            k8s::client::get_services_page,
            k8s::client::service_events,
            k8s::client::delete_service,
            // Ingresses
            k8s::client::get_ingresses_page,
            k8s::client::ingress_events,
            k8s::client::delete_ingress,
            // NetworkPolicies
            k8s::client::get_networkpolicies_page,
            k8s::client::networkpolicy_events,
            k8s::client::delete_networkpolicy,
            // StorageClasses
            k8s::client::get_storageclasses,
            k8s::client::delete_storageclass,
            // ServiceAccounts
            k8s::client::get_serviceaccounts_page,
            k8s::client::serviceaccount_events,
            k8s::client::delete_serviceaccount,
            // Roles
            k8s::client::get_roles_page,
            k8s::client::role_events,
            k8s::client::delete_role,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
