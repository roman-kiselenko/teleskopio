pub mod client {
    use dirs::home_dir;
    use either::Either;
    use futures::StreamExt;
    use k8s_openapi::api::apps::v1::{DaemonSet, Deployment, ReplicaSet, StatefulSet};
    use k8s_openapi::api::batch::v1::{CronJob, Job};
    use k8s_openapi::api::core::v1::{
        ConfigMap, ContainerStatus, Namespace, Node, Pod, Secret, Service, ServiceAccount,
    };
    use k8s_openapi::api::networking::v1::{Ingress, NetworkPolicy};
    use k8s_openapi::api::rbac::v1::Role;
    use k8s_openapi::api::storage::v1::StorageClass;
    use kube::api::{DeleteParams, ListParams, Patch, PatchParams};
    use kube::config::{KubeConfigOptions, Kubeconfig, KubeconfigError};
    use kube::runtime::watcher::Config as WatcherConfig;
    use kube::{
        api::Api,
        runtime::{reflector, reflector::store::Writer, watcher},
        Client, Config, Error,
    };
    use lazy_static::lazy_static;
    use serde::Serialize;
    use serde_json::json;
    use serde_json::Value;
    use std::collections::HashMap;
    use std::fmt;
    use std::fs;
    use std::io;
    use std::sync::Arc;
    use std::sync::Mutex;
    use tauri::async_runtime::JoinHandle;
    use tauri::http::Request;
    use tauri::{AppHandle, Emitter};
    use walkdir::{DirEntry, WalkDir};

    #[derive(Debug, Serialize)]
    pub struct Cluster {
        name: String,
        path: String,
        server: Option<String>,
    }

    #[derive(Debug, Serialize)]
    pub struct PodData {
        uid: String,
        name: String,
        namespace: String,
        node_name: Option<String>,
        host_ip: Option<String>,
        pod_ip: Option<String>,
        phase: Option<String>,
        is_terminating: bool,
        creation_timestamp: k8s_openapi::apimachinery::pkg::apis::meta::v1::Time,
        containers: Vec<Container>,
    }

    #[derive(Debug, Serialize)]
    pub struct Container {
        name: String,
        phase: Option<String>,
        started: bool,
        container_type: String,
        running: bool,
        terminated: bool,
        waiting: bool,
        started_at: String,
        reason: String,
        exit_code: Option<u16>,
    }

    #[derive(Debug, Serialize)]
    pub struct GenericError {
        message: String,
        code: Option<u16>,
        reason: Option<String>,
        details: Option<String>,
    }

    impl GenericError {
        pub fn new(msg: String) -> Self {
            Self {
                message: msg,
                code: None,
                reason: None,
                details: None,
            }
        }
    }

    fn extract_containers(pod: &Pod) -> Vec<Container> {
        let mut all = Vec::new();
        let phase = pod.status.as_ref().and_then(|s| s.phase.clone());

        if let Some(status) = &pod.status {
            if let Some(init_statuses) = &status.init_container_statuses {
                all.extend(process_statuses(init_statuses, "Init", &phase));
            }
            if let Some(main_statuses) = &status.container_statuses {
                all.extend(process_statuses(main_statuses, "Main", &phase));
            }
        }

        all
    }

    fn process_statuses(
        statuses: &Vec<ContainerStatus>,
        container_type: &str,
        phase: &Option<String>,
    ) -> Vec<Container> {
        statuses
            .iter()
            .map(|status| {
                let state = status.state.as_ref();

                let (started_at, reason, exit_code) = if let Some(state) = state {
                    if let Some(running) = &state.running {
                        let started = running
                            .started_at
                            .as_ref()
                            .map(|t| t.0.to_rfc3339())
                            .unwrap_or_default();
                        (started, "Running".to_string(), None)
                    } else if let Some(waiting) = &state.waiting {
                        (
                            "".to_string(),
                            waiting.reason.clone().unwrap_or("Waiting".to_string()),
                            None,
                        )
                    } else if let Some(terminated) = &state.terminated {
                        let started = terminated
                            .started_at
                            .as_ref()
                            .map(|t| t.0.to_rfc3339())
                            .unwrap_or_default();
                        let reason = terminated
                            .reason
                            .clone()
                            .unwrap_or("Terminated".to_string());
                        let code = Some(terminated.exit_code as u16);
                        (started, reason, code)
                    } else {
                        ("".to_string(), "-".to_string(), None)
                    }
                } else {
                    ("".to_string(), "-".to_string(), None)
                };

                Container {
                    name: status.name.clone(),
                    phase: phase.clone(),
                    container_type: container_type.to_string(),
                    started: status.started.unwrap_or(false),
                    running: matches!(state.and_then(|s| s.running.as_ref()), Some(_)),
                    waiting: matches!(state.and_then(|s| s.waiting.as_ref()), Some(_)),
                    terminated: matches!(state.and_then(|s| s.terminated.as_ref()), Some(_)),
                    started_at,
                    reason,
                    exit_code,
                }
            })
            .collect()
    }

    impl fmt::Display for GenericError {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}", self.message)
        }
    }

    impl std::error::Error for GenericError {}

    impl From<KubeconfigError> for GenericError {
        fn from(error: KubeconfigError) -> Self {
            return GenericError {
                message: error.to_string(),
                code: None,
                reason: None,
                details: None,
            };
        }
    }

    impl From<io::Error> for GenericError {
        fn from(err: io::Error) -> Self {
            GenericError {
                message: format!("IO error: {}", err),
                code: None,
                reason: None,
                details: None,
            }
        }
    }

    impl From<Error> for GenericError {
        fn from(error: Error) -> Self {
            match error {
                Error::Api(api_error) => {
                    let code = api_error.code;
                    let reason = api_error.reason;
                    let message = api_error.message;
                    return GenericError {
                        message,
                        code: Option::from(code),
                        reason: Option::from(reason),
                        details: None,
                    };
                }
                _ => {
                    return GenericError {
                        message: error.to_string(),
                        code: None,
                        reason: None,
                        details: None,
                    };
                }
            }
        }
    }

    async fn get_client(path: &str, context: &str) -> Result<Client, GenericError> {
        let kube_config_path = home_dir()
            .expect("Could not determine home directory")
            .join(path);
        let config = fs::read_to_string(kube_config_path).map_err(|e| {
            println!("error {:?}", e);
            GenericError::from(e)
        })?;
        let kube_config_yaml =
            Kubeconfig::from_yaml(config.as_str()).expect("cant parse kube_config");
        let options = KubeConfigOptions {
            context: Some(context.to_string()),
            ..Default::default()
        };
        let config = Config::from_custom_kubeconfig(kube_config_yaml, &options).await?;

        let client = Client::try_from(config)?;
        Ok(client)
    }

    fn is_excluded(entry: &DirEntry) -> bool {
        entry.path().components().any(|c| c.as_os_str() == "cache")
    }

    type Key = (String, String, String); // (path, context, resource)

    lazy_static! {
        static ref REFLECTOR_HANDLES: Mutex<HashMap<Key, JoinHandle<()>>> =
            Mutex::new(HashMap::new());
    }

    pub fn has_reflector(path: &str, context: &str, resource: &str) -> bool {
        let map = REFLECTOR_HANDLES.lock().unwrap();
        map.contains_key(&(path.to_string(), context.to_string(), resource.to_string()))
    }

    pub fn insert_reflector(
        path: String,
        context: String,
        resource: String,
        handle: JoinHandle<()>,
    ) {
        let mut map = REFLECTOR_HANDLES.lock().unwrap();
        map.insert((path, context, resource), handle);
    }

    pub fn remove_reflector(path: &str, context: &str, resource: &str) {
        let mut map = REFLECTOR_HANDLES.lock().unwrap();
        map.remove(&(path.to_string(), context.to_string(), resource.to_string()));
    }

    #[tauri::command]
    pub async fn lookup_configs() -> Result<Vec<Cluster>, GenericError> {
        let kube_config_path = home_dir()
            .expect("Could not determine home directory")
            .join(".kube/");
        log::info!("lookup_configs {:?}", kube_config_path);
        if !kube_config_path.exists() {
            return Err(GenericError::new(format!(
                "No such directory: {}",
                kube_config_path.display()
            )));
        }
        let clusters: Vec<Cluster> = WalkDir::new(kube_config_path)
            .into_iter()
            .filter_entry(|e| !is_excluded(e))
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .flat_map(|e| {
                let kube_config = e.path().to_str().map(|s| s.to_string()).unwrap();
                let kube_config_clone = kube_config.clone();
                let config = fs::read_to_string(kube_config).map_err(|e| {
                    println!("error {:?}", e);
                    GenericError::from(e)
                });
                let kube_config_yaml = Kubeconfig::from_yaml(config.unwrap().as_str())
                    .expect("cant parse kube_config");
                Some(kube_config_yaml.clusters.into_iter().map(move |c| Cluster {
                    name: c.name.clone(),
                    server: Some(c.cluster.unwrap().server.unwrap()),
                    path: kube_config_clone.clone(),
                }))
            })
            .flatten()
            .collect();

        Ok(clusters)
    }

    #[tauri::command]
    pub async fn cordon_node(
        path: &str,
        context: &str,
        resource_name: &str,
    ) -> Result<(), GenericError> {
        let client = get_client(&path, context).await?;
        let nodes: Api<Node> = Api::all(client);
        let patch = json!({
            "spec": {
                "unschedulable": true
            }
        });

        nodes
            .patch(
                resource_name,
                &PatchParams::apply("teleskopio-cordon"),
                &Patch::Merge(&patch),
            )
            .await?;
        Ok(())
    }

    #[tauri::command]
    pub async fn uncordon_node(
        path: &str,
        context: &str,
        resource_name: &str,
    ) -> Result<(), GenericError> {
        let client = get_client(&path, context).await?;
        let nodes: Api<Node> = Api::all(client);
        let patch = json!({
            "spec": {
                "unschedulable": false
            }
        });

        nodes
            .patch(
                resource_name,
                &PatchParams::apply("teleskopio-cordon"),
                &Patch::Merge(&patch),
            )
            .await?;
        Ok(())
    }

    #[tauri::command]
    pub async fn get_version(path: &str, context: &str) -> Result<Value, GenericError> {
        log::info!("get_version {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let req = Request::builder().uri("/version").body(vec![]).unwrap();

        let version_info: Value = client.request(req).await?;
        Ok(version_info)
    }

    #[tauri::command]
    pub async fn get_namespaces(path: &str, context: &str) -> Result<Vec<Namespace>, GenericError> {
        let client = get_client(&path, context).await?;
        let namespace_api: Api<Namespace> = Api::all(client);

        let namespaces = namespace_api
            .list(&ListParams::default())
            .await
            .map_err(|err| {
                println!("error {:?}", err);
                GenericError::from(err)
            })?;

        Ok(namespaces.items)
    }

    #[tauri::command]
    pub async fn get_pods_page(
        path: &str,
        context: &str,
        limit: u32,
        continue_token: Option<String>,
    ) -> Result<(Vec<PodData>, Option<String>), GenericError> {
        log::info!(
            "get_pods_page {:?} {:?} {:?} {:?}",
            path,
            context,
            limit,
            continue_token
        );
        let client = get_client(&path, context).await?;
        let pod_api: Api<Pod> = Api::all(client);

        let lp = if let Some(token) = &continue_token {
            ListParams::default().limit(limit).continue_token(token)
        } else {
            ListParams::default().limit(limit)
        };

        let pods = pod_api.list(&lp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        let next_token = pods.metadata.continue_;
        let mut items = pods.items;

        items.sort_by(|a, b| {
            let a_time = a
                .metadata
                .creation_timestamp
                .as_ref()
                .map(|t| t.0)
                .unwrap_or_default();
            let b_time = b
                .metadata
                .creation_timestamp
                .as_ref()
                .map(|t| t.0)
                .unwrap_or_default();
            b_time.cmp(&a_time)
        });
        let pod_items = items
            .iter()
            .map(|p| PodData {
                uid: p.metadata.uid.clone().unwrap_or_default(),
                name: p.metadata.name.clone().unwrap_or_default(),
                creation_timestamp: p.metadata.creation_timestamp.clone().unwrap(),
                namespace: p.metadata.namespace.clone().unwrap_or_default(),
                node_name: p.spec.clone().unwrap().node_name,
                host_ip: p.status.as_ref().and_then(|s| s.host_ip.clone()),
                pod_ip: p.status.as_ref().and_then(|s| s.pod_ip.clone()),
                phase: p.status.as_ref().and_then(|s| s.phase.clone()),
                containers: extract_containers(p),
                is_terminating: p.metadata.deletion_timestamp.is_some(),
            })
            .collect();
        Ok((pod_items, next_token))
    }

    #[tauri::command]
    pub async fn start_pod_reflector(
        path: &str,
        context: &str,
        app: AppHandle,
    ) -> Result<(), GenericError> {
        if has_reflector(path, context, "pod") {
            log::info!("pod reflector already running");
            return Ok(());
        }
        log::info!("start_pod_reflector {:?} {:?}", path, context,);

        let client = get_client(path, context).await?;
        let api: Api<Pod> = Api::all(client);

        let config = WatcherConfig {
            ..Default::default()
        };
        let watch_stream = watcher(api, config);

        let store = Writer::<Pod>::default();
        let reader = store.as_reader();

        let rf = reflector(store, watch_stream);

        let path = path.to_string();
        let path_clone = path.clone();
        let context = context.to_string();
        let context_clone = context.clone();
        let resource = "pod".to_string();
        let resource_clone = resource.clone();
        let app_handle = Arc::new(app);

        let task = tauri::async_runtime::spawn({
            let app_handle = Arc::clone(&app_handle);
            async move {
                let mut rf = Box::pin(rf);
                while let Some(event) = rf.next().await {
                    match event {
                        Ok(_) => {
                            let mut items: Vec<Pod> = reader
                                .state()
                                .iter()
                                .map(|arc_pod| (**arc_pod).clone())
                                .collect();

                            items.sort_by(|a, b| {
                                let a_time = a
                                    .metadata
                                    .creation_timestamp
                                    .as_ref()
                                    .map(|t| t.0)
                                    .unwrap_or_default();
                                let b_time = b
                                    .metadata
                                    .creation_timestamp
                                    .as_ref()
                                    .map(|t| t.0)
                                    .unwrap_or_default();
                                b_time.cmp(&a_time)
                            });
                            let pods: Vec<PodData> = items
                                .iter()
                                .map(|p| PodData {
                                    uid: p.metadata.uid.clone().unwrap_or_default(),
                                    name: p.metadata.name.clone().unwrap_or_default(),
                                    namespace: p.metadata.namespace.clone().unwrap_or_default(),
                                    node_name: p.spec.clone().unwrap().node_name,
                                    creation_timestamp: p
                                        .metadata
                                        .creation_timestamp
                                        .clone()
                                        .unwrap(),
                                    host_ip: p.status.as_ref().and_then(|s| s.host_ip.clone()),
                                    pod_ip: p.status.as_ref().and_then(|s| s.pod_ip.clone()),
                                    phase: p.status.as_ref().and_then(|s| s.phase.clone()),
                                    containers: extract_containers(&p),
                                    is_terminating: p.metadata.deletion_timestamp.is_some(),
                                })
                                .collect();
                            let _ = app_handle.emit("pods-update", &pods);
                        }
                        Err(err) => {
                            eprintln!("reflector error: {:?}", err);
                        }
                    }
                }

                remove_reflector(&path, &context, &resource);
            }
        });

        insert_reflector(path_clone, context_clone, resource_clone, task);
        Ok(())
    }

    #[tauri::command]
    pub async fn get_daemonsets_page(
        path: &str,
        context: &str,
        limit: u32,
        continue_token: Option<String>,
    ) -> Result<(Vec<DaemonSet>, Option<String>), GenericError> {
        log::info!(
            "get_daemonsets_page {:?} {:?} {:?} {:?}",
            path,
            context,
            limit,
            continue_token
        );
        let client = get_client(&path, context).await?;
        let ds_api: Api<DaemonSet> = Api::all(client);

        let lp = if let Some(token) = &continue_token {
            ListParams::default().limit(limit).continue_token(token)
        } else {
            ListParams::default().limit(limit)
        };

        let ds = ds_api.list(&lp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        let next_token = ds.metadata.continue_;
        let mut items = ds.items;

        items.sort_by(|a, b| {
            let a_time = a
                .metadata
                .creation_timestamp
                .as_ref()
                .map(|t| t.0)
                .unwrap_or_default();
            let b_time = b
                .metadata
                .creation_timestamp
                .as_ref()
                .map(|t| t.0)
                .unwrap_or_default();
            b_time.cmp(&a_time)
        });
        Ok((items, next_token))
    }

    #[tauri::command]
    pub async fn start_daemonset_reflector(
        path: &str,
        context: &str,
        app: AppHandle,
    ) -> Result<(), GenericError> {
        if has_reflector(path, context, "daemonset") {
            log::info!("daemonset reflector already running");
            return Ok(());
        }
        log::info!("start_daemonset_reflector {:?} {:?}", path, context,);

        let client = get_client(path, context).await?;
        let api: Api<DaemonSet> = Api::all(client);

        let config = WatcherConfig {
            ..Default::default()
        };
        let watch_stream = watcher(api, config);

        let store = Writer::<DaemonSet>::default();
        let reader = store.as_reader();

        let rf = reflector(store, watch_stream);

        let path = path.to_string();
        let path_clone = path.clone();
        let context = context.to_string();
        let context_clone = context.clone();
        let resource = "daemonset".to_string();
        let resource_clone = resource.clone();
        let app_handle = Arc::new(app);

        let task = tauri::async_runtime::spawn({
            let app_handle = Arc::clone(&app_handle);
            async move {
                let mut rf = Box::pin(rf);
                while let Some(event) = rf.next().await {
                    match event {
                        Ok(_) => {
                            let mut items: Vec<DaemonSet> = reader
                                .state()
                                .iter()
                                .map(|arc_ds| (**arc_ds).clone())
                                .collect();

                            items.sort_by(|a, b| {
                                let a_time = a
                                    .metadata
                                    .creation_timestamp
                                    .as_ref()
                                    .map(|t| t.0)
                                    .unwrap_or_default();
                                let b_time = b
                                    .metadata
                                    .creation_timestamp
                                    .as_ref()
                                    .map(|t| t.0)
                                    .unwrap_or_default();
                                b_time.cmp(&a_time)
                            });
                            let _ = app_handle.emit("daemonset-update", &items);
                        }
                        Err(err) => {
                            eprintln!("reflector error: {:?}", err);
                        }
                    }
                }

                remove_reflector(&path, &context, &resource);
            }
        });

        insert_reflector(path_clone, context_clone, resource_clone, task);
        Ok(())
    }

    macro_rules! generate_delete_fn {
        ($fn_name:ident, $type:ty, $log_type:literal) => {
            #[tauri::command]
            pub async fn $fn_name(
                path: &str,
                context: &str,
                resource_namespace: &str,
                resource_name: &str,
            ) -> Result<(), GenericError> {
                log::info!(
                    concat!("delete_", $log_type, " {:?} {:?} {:?} {:?}"),
                    path,
                    context,
                    resource_namespace,
                    resource_name
                );
                let client = get_client(&path, context).await?;
                let api: Api<$type> = Api::namespaced(client, resource_namespace);
                let dp = DeleteParams::default();
                let res = api.delete(resource_name, &dp).await.map_err(|err| {
                    println!("error {:?}", err);
                    GenericError::from(err)
                })?;

                match res {
                    Either::Left(obj) => {
                        log::info!(
                            concat!("deleted ", $log_type, ": {}"),
                            obj.metadata.name.unwrap_or_default()
                        );
                    }
                    Either::Right(status) => {
                        log::info!(
                            concat!("API response (", $log_type, "): {:?}"),
                            status.status
                        );
                    }
                };
                Ok(())
            }
        };
    }

    macro_rules! generate_get_fn {
        ($fn_name:ident, $type:ty) => {
            #[tauri::command]
            pub async fn $fn_name(path: &str, context: &str) -> Result<Vec<$type>, GenericError> {
                log::info!("{} {:?} {:?}", stringify!($fn_name), path, context);
                let client = get_client(&path, context).await?;
                let api: Api<$type> = Api::all(client);

                let list = api.list(&ListParams::default()).await.map_err(|err| {
                    println!("error {:?}", err);
                    GenericError::from(err)
                })?;

                Ok(list.items)
            }
        };
    }
    generate_get_fn!(get_nodes, Node);
    generate_delete_fn!(delete_pod, Pod, "pod");
    generate_get_fn!(get_deployments, Deployment);
    generate_delete_fn!(delete_deployment, Deployment, "deployment");
    generate_get_fn!(get_daemonsets, DaemonSet);
    generate_delete_fn!(delete_daemonset, DaemonSet, "daemonset");
    generate_get_fn!(get_replicasets, ReplicaSet);
    generate_delete_fn!(delete_replicaset, ReplicaSet, "replicaset");
    generate_get_fn!(get_statefulsets, StatefulSet);
    generate_delete_fn!(delete_statefulset, StatefulSet, "statefulset");
    generate_get_fn!(get_jobs, Job);
    generate_delete_fn!(delete_job, Job, "job");
    generate_get_fn!(get_cronjobs, CronJob);
    generate_delete_fn!(delete_cronjob, CronJob, "cronjob");
    generate_get_fn!(get_configmaps, ConfigMap);
    generate_delete_fn!(delete_configmap, ConfigMap, "configmap");
    generate_get_fn!(get_secrets, Secret);
    generate_delete_fn!(delete_secret, Secret, "secret");
    generate_get_fn!(get_services, Service);
    generate_delete_fn!(delete_service, Service, "service");
    generate_get_fn!(get_ingresses, Ingress);
    generate_delete_fn!(delete_ingress, Ingress, "ingress");
    generate_get_fn!(get_networkpolicies, NetworkPolicy);
    generate_delete_fn!(delete_networkpolicy, NetworkPolicy, "networkpolicy");
    generate_get_fn!(get_storageclasses, StorageClass);
    // generate_delete_fn!(delete_networkpolicy, NetworkPolicy, "networkpolicy");
    generate_get_fn!(get_serviceaccounts, ServiceAccount);
    generate_delete_fn!(delete_serviceaccount, ServiceAccount, "serviceaccount");
    generate_get_fn!(get_roles, Role);
    generate_delete_fn!(delete_role, Role, "role");

    #[tauri::command]
    pub async fn delete_storageclass(
        path: &str,
        context: &str,
        resource_name: &str,
    ) -> Result<(), GenericError> {
        log::info!(
            "delete_storageclass {:?} {:?} {:?}",
            path,
            context,
            resource_name
        );
        let client = get_client(&path, context).await?;
        let storageclass_api: Api<StorageClass> = Api::all(client);
        let dp = DeleteParams::default();
        let storageclass = storageclass_api
            .delete(resource_name, &dp)
            .await
            .map_err(|err| {
                println!("error {:?}", err);
                GenericError::from(err)
            })?;
        match storageclass {
            Either::Left(storageclass) => {
                log::info!(
                    "deleted storageclass: {}",
                    storageclass.metadata.name.unwrap_or_default()
                );
            }
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }
}
