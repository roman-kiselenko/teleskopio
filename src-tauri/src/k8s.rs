pub mod client {
    use dirs::home_dir;
    use either::Either;
    use futures_util::io::{AsyncBufReadExt, BufReader};
    use futures_util::stream::StreamExt;
    use k8s_openapi::api::apps::v1::{DaemonSet, Deployment, ReplicaSet, StatefulSet};
    use k8s_openapi::api::batch::v1::{CronJob, Job};
    use k8s_openapi::api::core::v1::{
        ConfigMap, Event, Namespace, Node, Pod, Secret, Service, ServiceAccount,
    };
    use k8s_openapi::api::networking::v1::{Ingress, NetworkPolicy};
    use k8s_openapi::api::policy::v1::Eviction;
    use k8s_openapi::api::rbac::v1::Role;
    use k8s_openapi::api::storage::v1::StorageClass;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::DeleteOptions;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::Status;
    use kube::api::{
        DeleteParams, ListParams, LogParams, Patch, PatchParams, PostParams, WatchEvent,
        WatchParams,
    };
    use kube::config::{KubeConfigOptions, Kubeconfig, KubeconfigError};
    use kube::core::{DynamicObject, GroupVersionKind};
    use kube::discovery::{Discovery, Scope};
    use kube::{api::Api, Client, Config, Error, ResourceExt};
    use lazy_static::lazy_static;
    use once_cell::sync::Lazy;
    use serde::Serialize;
    use serde_json;
    use serde_json::json;
    use serde_json::Value;
    use serde_yaml;
    use std::collections::HashMap;
    use std::fmt;
    use std::fs;
    use std::io;
    use std::sync::Mutex;
    use tauri::http::Request;
    use tauri::{AppHandle, Emitter};
    use tokio::task::{spawn, JoinHandle};
    use walkdir::{DirEntry, WalkDir};

    #[derive(Debug, Serialize)]
    #[warn(dead_code)]
    pub struct Cluster {
        name: String,
        path: String,
        server: Option<String>,
    }

    #[derive(Clone, serde::Serialize)]
    #[warn(dead_code)]
    struct LogLineEvent {
        container: String,
        pod: String,
        namespace: String,
        line: String,
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

    impl fmt::Display for GenericError {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}", self.message)
        }
    }

    impl std::error::Error for GenericError {}

    impl From<serde_json::Error> for GenericError {
        fn from(err: serde_json::Error) -> Self {
            GenericError {
                message: err.to_string(),
                code: None,
                reason: None,
                details: None,
            }
        }
    }

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

    static ACTIVE_STREAMS: Lazy<Mutex<HashMap<String, ()>>> =
        Lazy::new(|| Mutex::new(HashMap::new()));

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
    pub async fn update_kube_object(
        path: &str,
        context: &str,
        yaml: String,
    ) -> Result<(), GenericError> {
        let dyn_obj: DynamicObject = serde_yaml::from_str(&yaml)
            .map_err(|e| GenericError::new(format!("YAML parse error: {e}")))?;

        let name = dyn_obj.name_any();
        let namespace = dyn_obj.namespace();

        let client = get_client(&path, context).await?;

        let discovery = Discovery::new(client.clone())
            .run()
            .await
            .map_err(|e| GenericError::from(e))?;

        let type_meta = dyn_obj.types.clone().unwrap();
        let api_version = type_meta.api_version;
        let kind = type_meta.kind;

        let (group, version) = match api_version.split_once('/') {
            Some((g, v)) => (g.to_string(), v.to_string()),
            None => ("".to_string(), api_version), // core group
        };

        let gvk = GroupVersionKind {
            group,
            version,
            kind,
        };

        let (ar, caps) = discovery
            .resolve_gvk(&gvk)
            .ok_or(GenericError::new(format!("GVK not found in discovery")))?;

        let api: Api<DynamicObject> = match caps.scope {
            Scope::Namespaced => {
                let ns = namespace.unwrap_or_else(|| "default".into());
                Api::namespaced_with(client, &ns, &ar)
            }
            Scope::Cluster => Api::all_with(client, &ar),
        };

        api.replace(&name, &Default::default(), &dyn_obj)
            .await
            .map_err(|e| GenericError::from(e))?;

        Ok(())
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
    pub async fn drain_node(
        path: &str,
        context: &str,
        resource_name: &str,
    ) -> Result<(), GenericError> {
        log::info!("drain_node {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let nodes: Api<Node> = Api::all(client.clone());
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

        let pods: Api<Pod> = Api::all(client.clone());
        let pod_list = pods.list(&Default::default()).await?;

        for pod in &pod_list.items {
            if let Some(pod_node_name) = pod.spec.as_ref().and_then(|s| s.node_name.clone()) {
                if pod_node_name == resource_name {
                    if is_mirror_or_daemonset(&pod) {
                        continue;
                    }

                    let namespace = pod.namespace().unwrap_or_else(|| "default".to_string());
                    let name = pod.name_any();

                    evict_pod(client.clone(), namespace, name).await?;
                }
            }
        }

        Ok(())
    }

    async fn evict_pod(
        client: Client,
        namespace: String,
        pod_name: String,
    ) -> Result<(), GenericError> {
        let pods: Api<Pod> = Api::namespaced(client.clone(), &namespace);

        let eviction = Eviction {
            metadata: ObjectMeta {
                name: Some(pod_name.to_string()),
                namespace: Some(namespace.clone()),
                ..Default::default()
            },
            delete_options: Some(DeleteOptions::default()),
        };
        log::debug!("evict_pod {:?} {:?}", pod_name, namespace);
        let body = serde_json::to_vec(&eviction).map_err(GenericError::from)?;
        let status: Status = pods
            .create_subresource("eviction", &pod_name, &PostParams::default(), body)
            .await?;
        log::info!("eviction status {:?}", status);

        Ok(())
    }

    fn is_mirror_or_daemonset(pod: &Pod) -> bool {
        if let Some(owner_refs) = &pod.metadata.owner_references {
            for owner in owner_refs {
                if owner.kind == "DaemonSet" {
                    return true;
                }
            }
        }

        if let Some(annotations) = &pod.metadata.annotations {
            return annotations.contains_key("kubernetes.io/config.mirror");
        }

        false
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
    pub async fn get_pod_logs(
        path: &str,
        context: &str,
        name: &str,
        ns: &str,
        container: &str,
        tail_lines: Option<i64>,
    ) -> Result<Vec<String>, GenericError> {
        log::info!(
            "get_pod_logs path={:?} context={:?} name={:?} ns={:?} container={:?} tail_lines={:?}",
            path,
            context,
            name,
            ns,
            container,
            tail_lines,
        );

        let client = get_client(path, context).await?;
        let pods: Api<Pod> = Api::namespaced(client, ns);
        let mut lp = LogParams {
            ..Default::default()
        };
        lp.container = Some(container.to_string());
        let logs = pods
            .logs(name, &lp)
            .await
            .map_err(|e| GenericError::from(e))?;

        Ok(logs.lines().map(|s| s.to_string()).collect())
    }

    #[tauri::command]
    pub async fn stream_pod_logs(
        app: AppHandle,
        path: &str,
        context: &str,
        name: &str,
        ns: &str,
        container: &str,
    ) -> Result<(), GenericError> {
        let key = format!("{}/{}/{}/{}/{}", path, context, ns, name, container,);

        {
            let streams = ACTIVE_STREAMS.lock().unwrap();
            if streams.contains_key(&key) {
                log::warn!("Stream already active for {}", key);
                return Ok(());
            }
        }

        let client = get_client(path, context).await?;

        let pods: Api<Pod> = Api::namespaced(client, ns);

        let mut lp = LogParams {
            follow: true,
            ..Default::default()
        };
        lp.container = Some(container.to_string());

        let reader = pods
            .log_stream(name, &lp)
            .await
            .map_err(|e| GenericError::from(e))?;

        let mut lines = BufReader::new(reader).lines();

        let pod_name = name.to_string();
        let ns = ns.to_string();
        let app_clone = app.clone();
        {
            let mut streams = ACTIVE_STREAMS.lock().unwrap();
            streams.insert(key.clone(), ());
        }
        tokio::spawn(async move {
            while let Some(line) = lines.next().await {
                match line {
                    Ok(line) => {
                        let _ = app_clone.emit(
                            "pod_log_line",
                            LogLineEvent {
                                container: lp.container.clone().unwrap_or_default(),
                                pod: pod_name.clone(),
                                namespace: ns.clone(),
                                line,
                            },
                        );
                    }
                    Err(err) => {
                        log::error!("Error reading log line: {}", err);
                        break;
                    }
                }
            }

            let mut streams = ACTIVE_STREAMS.lock().unwrap();
            streams.remove(&key);
            log::info!("Stream closed for {}", key);
        });

        Ok(())
    }

    macro_rules! generate_event_handler_fn {
        (
        $func_name:ident,
        $resource_name:literal,
        $kube_type:ty,
        $event_updated:literal,
        $event_deleted:literal
    ) => {
            #[tauri::command]
            pub async fn $func_name(
                path: &str,
                context: &str,
                rv: &str,
                app: tauri::AppHandle,
            ) -> Result<(), GenericError> {
                log::info!(
                    "{} START: path={:?}, context={:?} rv={:?}",
                    stringify!($func_name),
                    path,
                    context,
                    rv
                );

                let client = get_client(path, context).await?;
                let api: Api<$kube_type> = Api::all(client);
                let wp: WatchParams = WatchParams::default();
                let rv_string = rv.to_string();

                {
                    let mut handles = REFLECTOR_HANDLES.lock().unwrap();
                    let key = (
                        path.to_string(),
                        context.to_string(),
                        $resource_name.to_string(),
                    );
                    let key_clone = key.clone();

                    if let Some(old_handle) = handles.remove(&key) {
                        log::warn!("Aborting existing watcher for {:?}", key);
                        old_handle.abort();
                    }

                    let app_clone = app.clone();
                    let api_clone = api.clone();

                    let handle = spawn(async move {
                        let mut stream = match api_clone.watch(&wp, rv_string.as_str()).await {
                            Ok(s) => s.boxed(),
                            Err(e) => {
                                eprintln!("watch failed: {:?}", e);
                                return;
                            }
                        };

                        while let Some(status) = stream.next().await {
                            match status {
                                Ok(WatchEvent::Added(p)) | Ok(WatchEvent::Modified(p)) => {
                                    let _ = app_clone.emit($event_updated, &p);
                                }
                                Ok(WatchEvent::Deleted(p)) => {
                                    let _ = app_clone.emit($event_deleted, &p);
                                }
                                Ok(_) => {}
                                Err(err) => {
                                    eprintln!("watch stream error: {:?}", err);
                                    break;
                                }
                            }
                        }

                        log::info!("watcher ended for {:?}", key);
                    });

                    handles.insert(key_clone, handle);
                }

                Ok(())
            }
        };
    }

    macro_rules! generate_get_page_fn {
        ($fn_name:ident, $type:ty, $log_type:literal) => {
            #[tauri::command]
            pub async fn $fn_name(
                path: &str,
                context: &str,
                limit: u32,
                continue_token: Option<String>,
            ) -> Result<(Vec<$type>, Option<String>, Option<String>), GenericError> {
                log::info!(
                    concat!("get_", $log_type, "_page {:?} {:?} {:?} {:?}"),
                    path,
                    context,
                    limit,
                    continue_token
                );
                let client = get_client(&path, context).await?;
                let api: Api<$type> = Api::all(client);

                let lp = if let Some(token) = &continue_token {
                    ListParams::default().limit(limit).continue_token(token)
                } else {
                    ListParams::default().limit(limit)
                };

                let result = api.list(&lp).await.map_err(|err| {
                    println!("error {:?}", err);
                    GenericError::from(err)
                })?;

                let next_token = result.metadata.continue_;
                let resource_version = result.metadata.resource_version.unwrap_or_default();
                let mut items = result.items;

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

                Ok((items, next_token, Some(resource_version)))
            }
        };
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

    macro_rules! generate_get_one_fn {
        ($fn_name:ident, $type:ty, cluster_scoped) => {
            #[tauri::command]
            pub async fn $fn_name(
                path: &str,
                context: &str,
                name: &str,
            ) -> Result<String, GenericError> {
                log::info!(
                    "{} path={:?} context={:?} name={:?}",
                    stringify!($fn_name),
                    path,
                    context,
                    name,
                );
                let client = get_client(&path, context).await?;
                let api: Api<$type> = Api::all(client);
                let obj = api.get(name).await.map_err(GenericError::from)?;
                let yaml = serde_yaml::to_string(&obj)
                    .map_err(|e| GenericError::new(format!("YAML serialization error: {}", e)))?;

                Ok(yaml)
            }
        };
        ($fn_name:ident, $type:ty) => {
            #[tauri::command]
            pub async fn $fn_name(
                path: &str,
                context: &str,
                name: &str,
                ns: &str,
            ) -> Result<String, GenericError> {
                log::info!(
                    "{} path={:?} context={:?} name={:?} ns={:?}",
                    stringify!($fn_name),
                    path,
                    context,
                    name,
                    ns,
                );
                let client = get_client(&path, context).await?;
                let api: Api<$type> = Api::namespaced(client, ns);
                let obj = api.get(name).await.map_err(GenericError::from)?;
                let yaml = serde_yaml::to_string(&obj)
                    .map_err(|e| GenericError::new(format!("YAML serialization error: {}", e)))?;

                Ok(yaml)
            }
        };
    }

    generate_get_page_fn!(get_nodes_page, Node, "nodes");
    generate_get_one_fn!(get_one_node, Node, cluster_scoped);
    generate_event_handler_fn!(node_events, "node", Node, "node-updated", "node-deleted");
    generate_get_page_fn!(get_pods_page, Pod, "pods");
    generate_event_handler_fn!(pod_events, "pod", Pod, "pod-updated", "pod-deleted");
    generate_get_one_fn!(get_one_pod, Pod);
    generate_delete_fn!(delete_pod, Pod, "pod");
    // Events
    generate_get_page_fn!(get_events_page, Event, "events");
    generate_event_handler_fn!(
        event_events,
        "event",
        Event,
        "event-updated",
        "event-deleted"
    );
    // Namespaces
    generate_get_page_fn!(get_namespaces_page, Namespace, "namespaces");
    generate_get_one_fn!(get_one_namespace, Namespace, cluster_scoped);
    generate_event_handler_fn!(
        namespace_events,
        "namespace",
        Namespace,
        "namespace-updated",
        "namespace-deleted"
    );
    // Deployments
    generate_get_page_fn!(get_deployments_page, Deployment, "deployments");
    generate_get_one_fn!(get_one_deployment, Deployment);
    generate_event_handler_fn!(
        deployment_events,
        "deployment",
        Deployment,
        "deployment-updated",
        "deployment-deleted"
    );
    generate_delete_fn!(delete_deployment, Deployment, "deployment");
    // DaemonSets
    generate_get_page_fn!(get_daemonsets_page, DaemonSet, "daemonsets");
    generate_get_one_fn!(get_one_daemonset, DaemonSet);
    generate_event_handler_fn!(
        daemonset_events,
        "daemonset",
        DaemonSet,
        "daemonset-updated",
        "daemonset-deleted"
    );
    generate_delete_fn!(delete_daemonset, DaemonSet, "daemonset");
    // ReplicaSets
    generate_get_page_fn!(get_replicasets_page, ReplicaSet, "replicasets");
    generate_get_one_fn!(get_one_replicaset, ReplicaSet);
    generate_event_handler_fn!(
        replicaset_events,
        "replicaset",
        ReplicaSet,
        "replicaset-updated",
        "replicaset-deleted"
    );
    generate_delete_fn!(delete_replicaset, ReplicaSet, "replicaset");
    // StatefulSets
    generate_get_page_fn!(get_statefulsets_page, StatefulSet, "statefulset");
    generate_get_one_fn!(get_one_statefulset, StatefulSet);
    generate_event_handler_fn!(
        statefulset_events,
        "statefulset",
        StatefulSet,
        "statefulset-updated",
        "statefulset-deleted"
    );
    generate_delete_fn!(delete_statefulset, StatefulSet, "statefulset");
    //Jobs
    generate_get_page_fn!(get_jobs_page, Job, "jobs");
    generate_get_one_fn!(get_one_job, Job);
    generate_event_handler_fn!(job_events, "job", Job, "job-updated", "job-deleted");
    generate_delete_fn!(delete_job, Job, "job");
    // CronJobs
    generate_get_page_fn!(get_cronjobs_page, CronJob, "cronjob");
    generate_get_one_fn!(get_one_cronjob, CronJob);
    generate_event_handler_fn!(
        cronjob_events,
        "cronjob",
        CronJob,
        "cronjob-updated",
        "cronjob-deleted"
    );
    generate_delete_fn!(delete_cronjob, CronJob, "cronjob");
    // ConfigMaps
    generate_get_page_fn!(get_configmaps_page, ConfigMap, "configmap");
    generate_get_one_fn!(get_one_configmap, ConfigMap);
    generate_event_handler_fn!(
        configmap_events,
        "configmap",
        ConfigMap,
        "configmap-updated",
        "configmap-deleted"
    );
    generate_delete_fn!(delete_configmap, ConfigMap, "configmap");
    // Secrets
    generate_get_page_fn!(get_secrets_page, Secret, "secret");
    generate_get_one_fn!(get_one_secret, Secret);
    generate_event_handler_fn!(
        secret_events,
        "secret",
        Secret,
        "secret-updated",
        "secret-deleted"
    );
    generate_delete_fn!(delete_secret, Secret, "secret");
    // Services
    generate_get_page_fn!(get_services_page, Service, "service");
    generate_get_one_fn!(get_one_service, Service);
    generate_event_handler_fn!(
        service_events,
        "service",
        Service,
        "service-updated",
        "service-deleted"
    );
    generate_delete_fn!(delete_service, Service, "service");
    // Ingresses
    generate_get_page_fn!(get_ingresses_page, Ingress, "ingress");
    generate_get_one_fn!(get_one_ingress, Ingress);
    generate_event_handler_fn!(
        ingress_events,
        "ingress",
        Ingress,
        "ingress-updated",
        "ingress-deleted"
    );
    generate_delete_fn!(delete_ingress, Ingress, "ingress");
    // NetworkPolicies
    generate_get_page_fn!(get_networkpolicies_page, NetworkPolicy, "networkpolicy");
    generate_get_one_fn!(get_one_networkpolicy, NetworkPolicy);
    generate_event_handler_fn!(
        networkpolicy_events,
        "networkpolicy",
        NetworkPolicy,
        "networkpolicy-updated",
        "networkpolicy-deleted"
    );
    generate_delete_fn!(delete_networkpolicy, NetworkPolicy, "networkpolicy");
    // StorageClasses
    generate_get_fn!(get_storageclasses, StorageClass);
    generate_get_one_fn!(get_one_storageclass, StorageClass, cluster_scoped);
    // ServiceAccounts
    generate_get_page_fn!(get_serviceaccounts_page, ServiceAccount, "serviceaccount");
    generate_get_one_fn!(get_one_serviceaccount, ServiceAccount);
    generate_event_handler_fn!(
        serviceaccount_events,
        "serviceaccount",
        ServiceAccount,
        "serviceaccount-updated",
        "serviceaccount-deleted"
    );
    generate_delete_fn!(delete_serviceaccount, ServiceAccount, "serviceaccount");
    // Roles
    generate_get_page_fn!(get_roles_page, Role, "role");
    generate_get_one_fn!(get_one_role, Role);
    generate_event_handler_fn!(role_events, "role", Role, "role-updated", "role-deleted");
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

    #[tauri::command]
    pub async fn delete_namespace(
        path: &str,
        context: &str,
        resource_name: &str,
    ) -> Result<(), GenericError> {
        log::info!(
            "delete_namespace {:?} {:?} {:?}",
            path,
            context,
            resource_name
        );
        let client = get_client(&path, context).await?;
        let namespace_api: Api<Namespace> = Api::all(client);
        let dp = DeleteParams::default();
        let namespace = namespace_api
            .delete(resource_name, &dp)
            .await
            .map_err(|err| {
                println!("error {:?}", err);
                GenericError::from(err)
            })?;
        match namespace {
            Either::Left(namespace) => {
                log::info!(
                    "deleted namespace: {}",
                    namespace.metadata.name.unwrap_or_default()
                );
            }
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }
}
