pub mod client {
    use kube::config::{ Kubeconfig, KubeconfigError };
    use kube::{api::Api, Client, Config, Error, };
    use k8s_openapi::api::core::v1::{
        Namespace,
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

    async fn get_client() -> Result<Client, GenericError> {
        let kube_config_path = home_dir().expect("Could not determine home directory").join(".kube/config");
        let config = fs::read_to_string(kube_config_path).map_err(|e| {
            println!("error {:?}", e);
            GenericError::from(e)
        })?;
        let kube_config_yaml = Kubeconfig::from_yaml(config.as_str()).expect("cant parse kube_config");
        println!("Config loaded, size: {} bytes", config.len());
        let default = &Default::default();
        let config = Config::from_custom_kubeconfig(kube_config_yaml, default).await?;

        let client = Client::try_from(config)?;
        Ok(client)
    }

    fn is_excluded(entry: &DirEntry) -> bool {
        entry.path().components().any(|c| c.as_os_str() == "cache")
    }

    #[tauri::command]
    pub fn lookup_configs() -> Result<Vec<String>, GenericError> {
        let kube_config_path = home_dir().expect("Could not determine home directory").join(".kube/");
        if !kube_config_path.exists() {
            return Err(GenericError::new(format!("No such directory: {}", kube_config_path.display())));
        }
        let files: Vec<String> = WalkDir::new(kube_config_path)
            .into_iter()
            .filter_entry(|e| !is_excluded(e))
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter_map(|e| e.path().to_str().map(|s| s.to_string()))
            .collect();

        Ok(files)
    }

    #[tauri::command]
    pub async fn get_version() -> Result<Value, GenericError> {
        let client = get_client().await?;
        let req = Request::builder()
          .uri("/version")
          .body(vec![])
          .unwrap();

        let version_info: Value = client.request(req).await?;
        Ok(version_info)
    }

    #[tauri::command]
    pub async fn get_namespaces() -> Result<Vec<Namespace>, GenericError> {
        let client = get_client().await?;
        let namespace_api: Api<Namespace> = Api::all(client);

        let namespaces = namespace_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(namespaces.items)
    }
}