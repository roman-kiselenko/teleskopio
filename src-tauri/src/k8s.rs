pub mod client {
    use dirs::home_dir;
    use futures::future::AbortHandle;
    use futures_util::io::{AsyncBufReadExt, BufReader};
    use futures_util::stream::StreamExt;
    use k8s_openapi::api::core::v1::{Node, Pod};
    use k8s_openapi::api::events::v1::Event;
    use k8s_openapi::api::policy::v1::Eviction;
    use k8s_openapi::apiextensions_apiserver::pkg::apis::apiextensions::v1::CustomResourceDefinition;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::DeleteOptions;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::Status;
    use kube::api::{
        DeleteParams, ListParams, LogParams, Patch, PatchParams, PostParams, WatchEvent,
        WatchParams,
    };
    use kube::config::{KubeConfigOptions, Kubeconfig, KubeconfigError};
    use kube::core::{DynamicObject, GroupVersionKind, TypeMeta};
    use kube::discovery::{Discovery, Scope};
    use kube::{api::Api, discovery::ApiResource, Client, Config, Error, ResourceExt};
    use lazy_static::lazy_static;
    use once_cell::sync::Lazy;
    use serde::{Deserialize, Serialize};
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
        current_context: Option<String>,
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
    pub struct ApiResourceInfo {
        pub group: String,
        pub version: String,
        pub kind: String,
        pub namespaced: bool,
    }

    #[derive(Debug, Serialize)]
    pub struct GenericError {
        message: String,
        code: Option<u16>,
        reason: Option<String>,
        details: Option<String>,
    }

    #[derive(serde::Deserialize)]
    pub struct DeleteRequest {
        pub group: Option<String>,
        pub version: String,
        pub kind: String,
        pub name: String,
        pub namespace: Option<String>,
    }

    #[derive(serde::Deserialize)]
    pub struct GetRequest {
        pub group: Option<String>,
        pub version: String,
        pub kind: String,
        pub name: String,
        pub namespace: Option<String>,
    }

    #[derive(Debug, Deserialize)]
    pub struct ListRequest {
        pub group: Option<String>,
        pub version: String,
        pub kind: String,
        pub namespaced: bool,
        pub namespace: Option<String>,
    }

    #[derive(Debug, Deserialize)]
    pub struct WatchRequest {
        pub group: Option<String>,
        pub version: String,
        pub kind: String,
        pub namespaced: bool,
        pub namespace: Option<String>,
        pub resource_version: Option<String>,
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

    static ACTIVE_STREAMS: Lazy<Mutex<HashMap<String, AbortHandle>>> =
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
    pub async fn list_apiresources(
        path: &str,
        context: &str,
    ) -> Result<Vec<ApiResourceInfo>, GenericError> {
        log::info!("list_apiresources {} {}", path, context);
        let client = get_client(path, context).await?;
        let discovery = Discovery::new(client.clone())
            .run()
            .await
            .map_err(GenericError::from)?;

        let mut result = Vec::new();

        for group in discovery.groups() {
            for (ar, caps) in group.recommended_resources() {
                let namespaced = match caps.scope {
                    Scope::Namespaced => true,
                    Scope::Cluster => false,
                };
                result.push(ApiResourceInfo {
                    group: group.name().to_string(),
                    version: ar.version.clone(),
                    kind: ar.kind.clone(),
                    namespaced: namespaced,
                });
            }
        }

        Ok(result)
    }
    #[tauri::command]
    pub async fn list_crd_resources(
        path: &str,
        context: &str,
    ) -> Result<(Vec<CustomResourceDefinition>, Option<String>), GenericError> {
        log::info!("list_crd_resources {} {}", path, context);
        let client = get_client(path, context).await?;

        let crds: Api<CustomResourceDefinition> = Api::all(client.clone());
        let list = crds
            .list(&Default::default())
            .await
            .map_err(GenericError::from)?;

        let resource_version = list.metadata.resource_version.clone();
        Ok((list.items, resource_version))
    }

    #[tauri::command]
    pub async fn create_kube_object(
        path: &str,
        context: &str,
        yaml: &str,
    ) -> Result<DynamicObject, GenericError> {
        log::info!("create_kube_object {} {} {}", path, context, yaml);
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

        let obj = api
            .create(&PostParams::default(), &dyn_obj)
            .await
            .map_err(|e| GenericError::from(e))?;

        Ok(obj)
    }

    #[tauri::command]
    pub async fn update_kube_object(
        path: &str,
        context: &str,
        yaml: String,
    ) -> Result<(), GenericError> {
        log::info!("update_kube_object {} {} {}", path, context, yaml);
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
            .filter_map(|e| {
                let kube_config = e.path().to_str()?.to_string();
                let content = match fs::read_to_string(&kube_config) {
                    Ok(c) => c,
                    Err(err) => {
                        log::debug!("Skip file {}, can't read: {}", kube_config, err);
                        return None;
                    }
                };
                if !content.contains("apiVersion") {
                    return None;
                }
                match Kubeconfig::from_yaml(&content) {
                    Ok(kube_config_yaml) => {
                        let current_context = kube_config_yaml.current_context.clone();
                        let clusters = kube_config_yaml
                            .clusters
                            .into_iter()
                            .map(|c| Cluster {
                                name: c.name.clone(),
                                server: c.cluster.and_then(|cc| cc.server),
                                path: kube_config.clone(),
                                current_context: current_context.clone(),
                            })
                            .collect::<Vec<_>>();
                        Some(clusters)
                    }
                    Err(err) => {
                        log::debug!("Skip file {}, parse error: {}", kube_config, err);
                        None
                    }
                }
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
        log::info!("cordon node {} {} {}", path, context, resource_name);
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
        log::info!("uncordon node {} {} {}", path, context, resource_name);
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
        log::info!("cluster version {}", version_info);
        Ok(version_info)
    }

    #[tauri::command]
    pub async fn events_dynamic_resource(
        path: &str,
        context: &str,
        namespace: &str,
        uid: &str,
    ) -> Result<Vec<Event>, GenericError> {
        log::info!("events {:?} {:?} {:?} {:?}", path, context, namespace, uid);

        let client = get_client(path, context).await?;
        let events_api: Api<Event> = Api::namespaced(client, &namespace);

        let lp = ListParams::default().fields(&format!("regarding.uid={}", uid));
        let events = events_api.list(&lp).await?;
        Ok(events.items)
    }

    #[tauri::command]
    pub async fn list_events_dynamic_resource(
        path: &str,
        context: &str,
        limit: u32,
        continue_token: Option<String>,
        uid: &str,
        request: ListRequest,
    ) -> Result<(Vec<DynamicObject>, Option<String>, Option<String>), GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version;
        let kind = request.kind;
        log::info!(
            "list events {:?} {:?} {:?} {:?} {:?} {:?}",
            kind,
            path,
            context,
            uid,
            limit,
            continue_token
        );

        let client = get_client(path, context).await?;
        let gvk = GroupVersionKind {
            group,
            version,
            kind,
        };
        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = Api::all_with(client, &ar);

        let mut lp = ListParams::default();
        lp = lp.limit(limit);
        if gvk.group == "" {
            lp = lp.fields(&format!("involvedObject.uid={}", uid))
        } else {
            lp = lp.fields(&format!("regarding.uid={}", uid));
        }
        if let Some(token) = &continue_token {
            lp = lp.continue_token(token);
        }

        let mut result = api.list(&lp).await.map_err(GenericError::from)?;
        let next_token = result.metadata.continue_;
        let resource_version = result.metadata.resource_version;
        for obj in result.items.iter_mut() {
            obj.types = Some(TypeMeta {
                api_version: ar.api_version.clone(),
                kind: ar.kind.clone(),
            });
        }
        Ok((result.items, next_token, resource_version))
    }

    #[tauri::command]
    pub async fn list_dynamic_resource(
        path: &str,
        context: &str,
        limit: u32,
        continue_token: Option<String>,
        request: ListRequest,
    ) -> Result<(Vec<DynamicObject>, Option<String>, Option<String>), GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version;
        let kind = request.kind;
        log::info!(
            "list {:?} {:?} {:?} {:?} {:?}",
            kind,
            path,
            context,
            limit,
            continue_token
        );

        let client = get_client(path, context).await?;
        let gvk = GroupVersionKind {
            group,
            version,
            kind,
        };
        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = Api::all_with(client, &ar);

        let mut lp = ListParams::default();
        lp = lp.limit(limit);
        if let Some(token) = &continue_token {
            lp = lp.continue_token(token);
        }

        let mut result = api.list(&lp).await.map_err(GenericError::from)?;
        let next_token = result.metadata.continue_;
        let resource_version = result.metadata.resource_version;
        for obj in result.items.iter_mut() {
            obj.types = Some(TypeMeta {
                api_version: ar.api_version.clone(),
                kind: ar.kind.clone(),
            });
        }
        Ok((result.items, next_token, resource_version))
    }

    #[tauri::command]
    pub async fn get_dynamic_resource(
        path: &str,
        context: &str,
        request: GetRequest,
    ) -> Result<String, GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version;
        let kind = request.kind;
        let name = request.name;
        let namespace = request.namespace;

        log::info!(
            "get kind={}, name={}, namespace={:?}, group={}, version={}",
            kind,
            name,
            namespace,
            group,
            version
        );

        let client = get_client(path, context).await?;

        let gvk = GroupVersionKind {
            group,
            version,
            kind,
        };

        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = match namespace {
            Some(ref ns) => Api::namespaced_with(client, ns, &ar),
            None => Api::all_with(client, &ar),
        };

        let obj = api.get(&name).await.map_err(GenericError::from)?;
        let yaml = serde_yaml::to_string(&obj)
            .map_err(|e| GenericError::new(format!("YAML serialization error: {}", e)))?;

        Ok(yaml)
    }

    #[tauri::command]
    pub async fn delete_dynamic_resource(
        path: &str,
        context: &str,
        request: DeleteRequest,
    ) -> Result<(), GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version;
        let kind = request.kind;
        let name = request.name;
        let namespace = request.namespace;

        log::info!(
            "delete single resource: kind={}, name={}, namespace={:?}, group={}, version={}",
            kind,
            name,
            namespace,
            group,
            version
        );

        let client = get_client(path, context).await?;

        let gvk = GroupVersionKind {
            group,
            version,
            kind,
        };

        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = match namespace {
            Some(ref ns) => Api::namespaced_with(client, ns, &ar),
            None => Api::all_with(client, &ar),
        };

        let dp = DeleteParams::default();
        api.delete(&name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(())
    }

    #[tauri::command]
    pub async fn watch_dynamic_resource(
        app: tauri::AppHandle,
        path: &str,
        context: &str,
        request: WatchRequest,
    ) -> Result<(), GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version.clone();
        let kind = request.kind.clone();
        let rv_string = request.resource_version.clone().unwrap();
        log::info!("watch {:?} {:?} {:?} {:?}", kind, path, context, rv_string);
        let client = get_client(path, context).await?;
        let gvk = GroupVersionKind {
            group,
            version,
            kind: kind.clone(),
        };
        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = Api::all_with(client, &ar);

        // watcher
        let wp: WatchParams = WatchParams::default();
        let rv_string = request.resource_version.unwrap();
        let event_name_updated = format!("{}-updated", kind);
        let event_name_deleted = format!("{}-deleted", kind);

        {
            let mut handles = REFLECTOR_HANDLES.lock().unwrap();
            let key = (
                path.to_string(),
                context.to_string(),
                kind.clone().to_string(),
            );
            let key_clone = key.clone();

            if let Some(old_handle) = handles.remove(&key) {
                log::warn!("Aborting existing watcher for {:?}", key);
                old_handle.abort();
            }

            let app_clone = app.clone();
            let api_clone = api.clone();

            let handle = spawn(async move {
                let mut stream = match api_clone.watch(&wp, &rv_string).await {
                    Ok(s) => s.boxed(),
                    Err(e) => {
                        eprintln!("watch failed: {:?}", e);
                        return;
                    }
                };

                while let Some(status) = stream.next().await {
                    match status {
                        Ok(WatchEvent::Added(p)) | Ok(WatchEvent::Modified(p)) => {
                            let _ = app_clone.emit(&event_name_updated, &p);
                        }
                        Ok(WatchEvent::Deleted(p)) => {
                            let _ = app_clone.emit(&event_name_deleted, &p);
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

    #[tauri::command]
    pub async fn watch_events_dynamic_resource(
        app: tauri::AppHandle,
        path: &str,
        uid: &str,
        context: &str,
        request: WatchRequest,
    ) -> Result<(), GenericError> {
        let group = request.group.unwrap_or_default();
        let version = request.version.clone();
        let kind = request.kind.clone();
        let rv_string = request.resource_version.clone().unwrap();
        log::info!(
            "watch events {:?} {:?} {:?} {:?} {:?}",
            kind,
            path,
            uid,
            context,
            rv_string
        );
        let client = get_client(path, context).await?;
        let gvk = GroupVersionKind {
            group,
            version,
            kind: kind.clone(),
        };
        let ar = ApiResource::from_gvk(&gvk);

        let api: Api<DynamicObject> = Api::all_with(client, &ar);

        // watcher
        let mut wp: WatchParams = WatchParams::default();
        if gvk.group == "" {
            wp = wp
                .fields(&format!("involvedObject.uid={}", uid))
                .timeout(294);
        } else {
            wp = wp.fields(&format!("regarding.uid={}", uid)).timeout(294);
        }
        let rv_string = request.resource_version.unwrap();
        let event_name_updated = format!("{}-updated", uid);

        {
            let mut handles = REFLECTOR_HANDLES.lock().unwrap();
            let key = (path.to_string(), context.to_string(), uid.to_string());
            let key_clone = key.clone();

            if let Some(old_handle) = handles.remove(&key) {
                log::warn!("Aborting existing watcher for {:?}", key);
                old_handle.abort();
            }

            let app_clone = app.clone();
            let api_clone = api.clone();

            let handle = spawn(async move {
                let mut stream = match api_clone.watch(&wp, &rv_string).await {
                    Ok(s) => s.boxed(),
                    Err(e) => {
                        eprintln!("watch failed: {:?}", e);
                        return;
                    }
                };

                while let Some(status) = stream.next().await {
                    match status {
                        Ok(WatchEvent::Added(p))
                        | Ok(WatchEvent::Modified(p))
                        | Ok(WatchEvent::Deleted(p)) => {
                            let _ = app_clone.emit(&event_name_updated, &p);
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

    #[tauri::command]
    pub async fn stop_watch_events(path: &str, context: &str, uid: &str) -> Result<(), String> {
        let mut handles = REFLECTOR_HANDLES.lock().unwrap();
        let key = (path.to_string(), context.to_string(), uid.to_string());

        if let Some(handle) = handles.remove(&key) {
            log::info!("Stopping watcher for {:?}", key);
            handle.abort();
            Ok(())
        } else {
            log::warn!("No watcher found for {:?}", key);
            Err(format!("No watcher found for {:?}", key))
        }
    }

    #[tauri::command]
    pub async fn get_pod_logs(
        path: &str,
        context: &str,
        name: &str,
        namespace: &str,
        container: &str,
        tail_lines: Option<i64>,
    ) -> Result<Vec<String>, GenericError> {
        log::info!(
            "get_pod_logs path={:?} context={:?} name={:?} ns={:?} container={:?} tail_lines={:?}",
            path,
            context,
            name,
            namespace,
            container,
            tail_lines,
        );

        let client = get_client(path, context).await?;
        let pods: Api<Pod> = Api::namespaced(client, namespace);
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
        namespace: &str,
        container: &str,
    ) -> Result<(), GenericError> {
        let key = format!("{}/{}/{}/{}/{}", path, context, namespace, name, container);

        {
            let streams = ACTIVE_STREAMS.lock().unwrap();
            if streams.contains_key(&key) {
                log::warn!("Stream already active for {}", key);
                return Ok(());
            }
        }

        let client = get_client(path, context).await?;
        let pods: Api<Pod> = Api::namespaced(client, namespace);

        let mut lp = LogParams {
            follow: true,
            container: Some(container.to_string()),
            ..Default::default()
        };

        let reader = pods
            .log_stream(name, &lp)
            .await
            .map_err(GenericError::from)?;

        let mut lines = BufReader::new(reader).lines();

        let pod_name = name.to_string();
        let ns = namespace.to_string();
        let app_clone = app.clone();

        let (abort_handle, abort_reg) = AbortHandle::new_pair();

        {
            let mut streams = ACTIVE_STREAMS.lock().unwrap();
            streams.insert(key.clone(), abort_handle);
        }

        tokio::spawn(futures::future::Abortable::new(
            async move {
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
            },
            abort_reg,
        ));

        Ok(())
    }

    #[tauri::command]
    pub async fn stop_pod_log_stream(
        path: &str,
        context: &str,
        namespace: &str,
        name: &str,
        container: &str,
    ) -> Result<(), GenericError> {
        let key = format!("{}/{}/{}/{}/{}", path, context, namespace, name, container);

        let mut streams = ACTIVE_STREAMS.lock().unwrap();
        if let Some(abort_handle) = streams.remove(&key) {
            abort_handle.abort();
            log::info!("Aborted pod log stream for {}", key);
        } else {
            log::warn!("No active stream found for {}", key);
        }

        Ok(())
    }
}
