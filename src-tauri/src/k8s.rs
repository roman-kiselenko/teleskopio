pub mod client {
    use kube::config::{ Kubeconfig, KubeconfigError };
    use kube::{api::Api, Client, Config, Error};
    use k8s_openapi::api::core::v1::{
        Namespace,
    };
    use kube::api::{ListParams};
    use std::fmt;
    use std::io;
    use std::fs;
    use serde::Serialize;
    use dirs::home_dir;

    #[derive(Debug, Serialize)]
    pub struct SerializableKubeError {
        message: String,
        code: Option<u16>,
        reason: Option<String>,
        details: Option<String>,
    }

    impl fmt::Display for SerializableKubeError {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}", self.message)
        }
    }

    impl std::error::Error for SerializableKubeError {}

    impl From<KubeconfigError> for SerializableKubeError {
        fn from(error: KubeconfigError) -> Self {
            return SerializableKubeError {
                message: error.to_string(),
                code: None,
                reason: None,
                details: None,
            };
        }
    }

    impl From<io::Error> for SerializableKubeError {
        fn from(err: io::Error) -> Self {
            SerializableKubeError {
                    message: format!("IO error: {}", err),
                    code: None,
                    reason: None,
                    details: None,
                }
            }
        }

    impl From<Error> for SerializableKubeError {
        fn from(error: Error) -> Self {
          match error {
                Error::Api(api_error) => {
                    let code = api_error.code;
                    let reason = api_error.reason;
                    let message = api_error.message;
                    return SerializableKubeError {
                        message,
                        code: Option::from(code),
                        reason: Option::from(reason),
                        details: None,
                    };
                }
                _ => {
                    return SerializableKubeError {
                        message: error.to_string(),
                        code: None,
                        reason: None,
                        details: None,
                    };
                }
        }
    }
    }

    async fn get_client() -> Result<Client, SerializableKubeError> {
        let kube_config_path = home_dir().expect("Could not determine home directory").join(".kube/config");
        let config = fs::read_to_string(kube_config_path).map_err(|e| {
            println!("error {:?}", e);
            SerializableKubeError::from(e)
        })?;
        let kube_config_yaml = Kubeconfig::from_yaml(config.as_str()).expect("cant parse kube_config");
        println!("Config loaded, size: {} bytes", config.len());
        let default = &Default::default();
        let config = Config::from_custom_kubeconfig(kube_config_yaml, default).await?;

        let client = Client::try_from(config)?;
        Ok(client)
    }

    #[tauri::command]
    pub async fn get_namespaces() -> Result<Vec<Namespace>, SerializableKubeError> {
        let client = get_client().await?;
        let namespace_api: Api<Namespace> = Api::all(client);

        let namespaces = namespace_api.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            SerializableKubeError::from(err)
        })?;

        Ok(namespaces.items)
    }
}