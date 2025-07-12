pub mod client {
    use kube::config::{ Kubeconfig, KubeconfigError, KubeConfigOptions };
    use kube::{api::Api, Client, Config, Error, };
    use k8s_openapi::api::core::v1::{
        Namespace,
        Node,
        Pod,
    };
    use k8s_openapi::api::apps::v1::{
        Deployment,
        DaemonSet,
        ReplicaSet,
    };
    use tauri::http::Request;
    use kube::api::{ListParams};
    use std::fmt;
    use std::io;
    use std::fs;
    use serde_json::Value;
    use serde::Serialize;
    use dirs::home_dir;
    use walkdir::{DirEntry, WalkDir};

    #[derive(Debug, Serialize)]
    pub struct Cluster {
        name: String,
        path: String,
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
        let kube_config_path = home_dir().expect("Could not determine home directory").join(path);
        let config = fs::read_to_string(kube_config_path).map_err(|e| {
            println!("error {:?}", e);
            GenericError::from(e)
        })?;
        let kube_config_yaml = Kubeconfig::from_yaml(config.as_str()).expect("cant parse kube_config");
        println!("Config loaded, size: {} bytes", config.len());
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

    #[tauri::command]
    pub async fn lookup_configs() -> Result<Vec<Cluster>, GenericError> {
         log::info!("lookup_configs");
        let kube_config_path = home_dir().expect("Could not determine home directory").join(".kube/");
        if !kube_config_path.exists() {
            return Err(GenericError::new(format!("No such directory: {}", kube_config_path.display())));
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
                let kube_config_yaml = Kubeconfig::from_yaml(config.unwrap().as_str()).expect("cant parse kube_config");
                Some(
                    kube_config_yaml.clusters
                    .into_iter()
                    .map(move |c| Cluster {
                         name: c.name.clone(),
                         path: kube_config_clone.clone(),
                    }),
                )
            })
            .flatten()
            .collect();

        Ok(clusters)
    }

    #[tauri::command]
    pub async fn get_version(path: &str, context: &str) -> Result<Value, GenericError> {
        log::info!("get_version {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let req = Request::builder()
          .uri("/version")
          .body(vec![])
          .unwrap();


        let version_info: Value = client.request(req).await?;
        Ok(version_info)
    }

    #[tauri::command]
    pub async fn get_namespaces(path: &str, context: &str) -> Result<Vec<Namespace>, GenericError> {
        let client = get_client(&path, context).await?;
        let namespace_api: Api<Namespace> = Api::all(client);

        let namespaces = namespace_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(namespaces.items)
    }

    #[tauri::command]
    pub async fn get_nodes(path: &str, context: &str) -> Result<Vec<Node>, GenericError> {
        log::info!("get_nodes {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let node_api: Api<Node> = Api::all(client);

        let nodes = node_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(nodes.items)
    }

    #[tauri::command]
    pub async fn get_pods(path: &str, context: &str) -> Result<Vec<Pod>, GenericError> {
        log::info!("get_pods {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let pod_api: Api<Pod> = Api::all(client);

        let pods = pod_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(pods.items)
    }

    #[tauri::command]
    pub async fn get_deployments(path: &str, context: &str) -> Result<Vec<Deployment>, GenericError> {
        log::info!("get_deployments {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let deployment_api: Api<Deployment> = Api::all(client);

        let deployments = deployment_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(deployments.items)
    }

    #[tauri::command]
    pub async fn get_daemonset(path: &str, context: &str) -> Result<Vec<DaemonSet>, GenericError> {
        log::info!("get_daemonset {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let daemonset: Api<DaemonSet> = Api::all(client);

        let daemonset = daemonset.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(daemonset.items)
    }

    #[tauri::command]
    pub async fn get_replicaset(path: &str, context: &str) -> Result<Vec<ReplicaSet>, GenericError> {
        log::info!("get_replicaset {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let replicaset: Api<ReplicaSet> = Api::all(client);

        let replicaset = replicaset.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(replicaset.items)
    }
}