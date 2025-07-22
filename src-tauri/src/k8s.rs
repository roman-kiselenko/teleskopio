pub mod client {
    use kube::config::{ Kubeconfig, KubeconfigError, KubeConfigOptions };
    use kube::{api::Api, Client, Config, Error};
    use either::{Either};
    use k8s_openapi::api::storage::v1::{
        StorageClass,
    };
    use k8s_openapi::api::core::v1::{
        Namespace,
        Node,
        Pod,
        Service,
        ConfigMap,
        Secret,
        ServiceAccount,
    };
    use k8s_openapi::api::apps::v1::{
        Deployment,
        DaemonSet,
        ReplicaSet,
        StatefulSet,
    };
   use k8s_openapi::api::batch::v1::{
        Job,
        CronJob,
    };
    use k8s_openapi::api::networking::v1::{
        Ingress,
        NetworkPolicy,
    };
    use k8s_openapi::api::rbac::v1::{
        Role,
    };
    use tauri::http::Request;
    use kube::api::{ListParams, DeleteParams};
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
    pub async fn delete_pod(path: &str, context: &str, pod_namespace: &str, pod_name: &str) -> Result<(), GenericError> {
        log::info!("delete_pod {:?} {:?} {:?} {:?}", path, context, pod_namespace, pod_name);
        let client = get_client(&path, context).await?;
        let pod_api: Api<Pod> = Api::namespaced(client, pod_namespace);
        let dp = DeleteParams::default();
        let pod = pod_api.delete(pod_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match pod {
            Either::Left(pod) => {
                log::info!("deleted pod: {}", pod.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
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
    pub async fn delete_deployment(path: &str, context: &str, dp_namespace: &str, dp_name: &str) -> Result<(), GenericError> {
        log::info!("delete_deployment {:?} {:?} {:?} {:?}", path, context, dp_namespace, dp_name);
        let client = get_client(&path, context).await?;
        let dp_api: Api<Deployment> = Api::namespaced(client, dp_namespace);
        let dp = DeleteParams::default();
        let dp = dp_api.delete(dp_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match dp {
            Either::Left(dp) => {
                log::info!("deleted deployment: {}", dp.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
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
    pub async fn delete_daemonset(path: &str, context: &str, ds_namespace: &str, ds_name: &str) -> Result<(), GenericError> {
        log::info!("delete_daemonset {:?} {:?} {:?} {:?}", path, context, ds_namespace, ds_name);
        let client = get_client(&path, context).await?;
        let ds_api: Api<DaemonSet> = Api::namespaced(client, ds_namespace);
        let dp = DeleteParams::default();
        let ds = ds_api.delete(ds_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match ds {
            Either::Left(ds) => {
                log::info!("deleted daemonset: {}", ds.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
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

    #[tauri::command]
    pub async fn delete_replicaset(path: &str, context: &str, rs_namespace: &str, rs_name: &str) -> Result<(), GenericError> {
        log::info!("delete_replicaset {:?} {:?} {:?} {:?}", path, context, rs_namespace, rs_name);
        let client = get_client(&path, context).await?;
        let rs_api: Api<ReplicaSet> = Api::namespaced(client, rs_namespace);
        let dp = DeleteParams::default();
        let rs = rs_api.delete(rs_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match rs {
            Either::Left(rs) => {
                log::info!("deleted replicaset: {}", rs.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_statefulset(path: &str, context: &str) -> Result<Vec<StatefulSet>, GenericError> {
        log::info!("get_statefulset {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let statefulset: Api<StatefulSet> = Api::all(client);

        let statefulset = statefulset.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(statefulset.items)
    }

    #[tauri::command]
    pub async fn delete_statefulset(path: &str, context: &str, ss_namespace: &str, ss_name: &str) -> Result<(), GenericError> {
        log::info!("delete_statefulset {:?} {:?} {:?} {:?}", path, context, ss_namespace, ss_name);
        let client = get_client(&path, context).await?;
        let ss_api: Api<StatefulSet> = Api::namespaced(client, ss_namespace);
        let dp = DeleteParams::default();
        let ss = ss_api.delete(ss_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match ss {
            Either::Left(ss) => {
                log::info!("deleted statefulset: {}", ss.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_jobs(path: &str, context: &str) -> Result<Vec<Job>, GenericError> {
        log::info!("get_jobs {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let jobs: Api<Job> = Api::all(client);

        let jobs = jobs.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(jobs.items)
    }

    #[tauri::command]
    pub async fn delete_job(path: &str, context: &str, job_namespace: &str, job_name: &str) -> Result<(), GenericError> {
        log::info!("delete_job {:?} {:?} {:?} {:?}", path, context, job_namespace, job_name);
        let client = get_client(&path, context).await?;
        let job_api: Api<Job> = Api::namespaced(client, job_namespace);
        let dp = DeleteParams::default();
        let job = job_api.delete(job_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match job {
            Either::Left(job) => {
                log::info!("deleted job: {}", job.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_cronjobs(path: &str, context: &str) -> Result<Vec<CronJob>, GenericError> {
        log::info!("get_cronjobs {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let cronjobs: Api<CronJob> = Api::all(client);

        let cronjobs = cronjobs.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(cronjobs.items)
    }

    #[tauri::command]
    pub async fn delete_cronjob(path: &str, context: &str, cronjob_namespace: &str, cronjob_name: &str) -> Result<(), GenericError> {
        log::info!("delete_cronjob {:?} {:?} {:?} {:?}", path, context, cronjob_namespace, cronjob_name);
        let client = get_client(&path, context).await?;
        let cronjob_api: Api<CronJob> = Api::namespaced(client, cronjob_namespace);
        let dp = DeleteParams::default();
        let cronjob = cronjob_api.delete(cronjob_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match cronjob {
            Either::Left(cronjob) => {
                log::info!("deleted cronjob: {}", cronjob.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_configmaps(path: &str, context: &str) -> Result<Vec<ConfigMap>, GenericError> {
        log::info!("get_configmaps {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let configmaps: Api<ConfigMap> = Api::all(client);

        let configmaps = configmaps.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(configmaps.items)
    }

    #[tauri::command]
    pub async fn delete_configmap(path: &str, context: &str, cm_namespace: &str, cm_name: &str) -> Result<(), GenericError> {
        log::info!("delete_configmap {:?} {:?} {:?} {:?}", path, context, cm_namespace, cm_name);
        let client = get_client(&path, context).await?;
        let configmap_api: Api<ConfigMap> = Api::namespaced(client, cm_namespace);
        let dp = DeleteParams::default();
        let cronjob = configmap_api.delete(cm_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match cronjob {
            Either::Left(configmap) => {
                log::info!("deleted configmap: {}", configmap.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_secrets(path: &str, context: &str) -> Result<Vec<Secret>, GenericError> {
        log::info!("get_secrets {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let secrets: Api<Secret> = Api::all(client);

        let secrets = secrets.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(secrets.items)
    }

    #[tauri::command]
    pub async fn delete_secret(path: &str, context: &str, secret_namespace: &str, secret_name: &str) -> Result<(), GenericError> {
        log::info!("delete_secret {:?} {:?} {:?} {:?}", path, context, secret_namespace, secret_name);
        let client = get_client(&path, context).await?;
        let secret_api: Api<Secret> = Api::namespaced(client, secret_namespace);
        let dp = DeleteParams::default();
        let secret = secret_api.delete(secret_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match secret {
            Either::Left(secret) => {
                log::info!("deleted secret: {}", secret.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_services(path: &str, context: &str) -> Result<Vec<Service>, GenericError> {
        log::info!("get_services {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let services: Api<Service> = Api::all(client);

        let services = services.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(services.items)
    }

    #[tauri::command]
    pub async fn delete_service(path: &str, context: &str, service_namespace: &str, service_name: &str) -> Result<(), GenericError> {
        log::info!("delete_service {:?} {:?} {:?} {:?}", path, context, service_namespace, service_name);
        let client = get_client(&path, context).await?;
        let service_api: Api<Service> = Api::namespaced(client, service_namespace);
        let dp = DeleteParams::default();
        let service = service_api.delete(service_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match service {
            Either::Left(service) => {
                log::info!("deleted service: {}", service.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_ingresses(path: &str, context: &str) -> Result<Vec<Ingress>, GenericError> {
        log::info!("get_ingresses {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let ingresses: Api<Ingress> = Api::all(client);

        let ingresses = ingresses.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(ingresses.items)
    }

    #[tauri::command]
    pub async fn delete_ingress(path: &str, context: &str, ingress_namespace: &str, ingress_name: &str) -> Result<(), GenericError> {
        log::info!("delete_ingress {:?} {:?} {:?} {:?}", path, context, ingress_namespace, ingress_name);
        let client = get_client(&path, context).await?;
        let ingress_api: Api<Ingress> = Api::namespaced(client, ingress_namespace);
        let dp = DeleteParams::default();
        let ingress = ingress_api.delete(ingress_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match ingress {
            Either::Left(ingress) => {
                log::info!("deleted ingress: {}", ingress.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_networkpolicies(path: &str, context: &str) -> Result<Vec<NetworkPolicy>, GenericError> {
        log::info!("get_networkpolicies {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let networkpolicies: Api<NetworkPolicy> = Api::all(client);

        let networkpolicies = networkpolicies.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(networkpolicies.items)
    }

    #[tauri::command]
    pub async fn delete_networkpolicy(path: &str, context: &str, networkpolicy_namespace: &str, networkpolicy_name: &str) -> Result<(), GenericError> {
        log::info!("delete_networkpolicy {:?} {:?} {:?} {:?}", path, context, networkpolicy_namespace, networkpolicy_name);
        let client = get_client(&path, context).await?;
        let networkpolicy_api: Api<NetworkPolicy> = Api::namespaced(client, networkpolicy_namespace);
        let dp = DeleteParams::default();
        let networkpolicy = networkpolicy_api.delete(networkpolicy_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match networkpolicy {
            Either::Left(networkpolicy) => {
                log::info!("deleted networkpolicy: {}", networkpolicy.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_storageclasses(path: &str, context: &str) -> Result<Vec<StorageClass>, GenericError> {
        log::info!("get_storageclasses {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let storageclass: Api<StorageClass> = Api::all(client);

        let storageclass = storageclass.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(storageclass.items)
    }

    #[tauri::command]
    pub async fn delete_storageclass(path: &str, context: &str, _storageclass_namespace: &str, storageclass_name: &str) -> Result<(), GenericError> {
        log::info!("delete_storageclass {:?} {:?} {:?} {:?}", path, context, _storageclass_namespace, storageclass_name);
        let client = get_client(&path, context).await?;
        let storageclass_api: Api<StorageClass> = Api::all(client);
        let dp = DeleteParams::default();
        let storageclass = storageclass_api.delete(storageclass_name, &dp).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;
        match storageclass {
            Either::Left(storageclass) => {
                log::info!("deleted storageclass: {}", storageclass.metadata.name.unwrap_or_default());
            },
            Either::Right(status) => {
                log::info!("API response: {:?}", status.message);
            }
        };
        Ok(())
    }

    #[tauri::command]
    pub async fn get_serviceaccounts(path: &str, context: &str) -> Result<Vec<ServiceAccount>, GenericError> {
        log::info!("get_serviceaccounts {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let serviceaccounts: Api<ServiceAccount> = Api::all(client);

        let serviceaccounts = serviceaccounts.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(serviceaccounts.items)
    }

    #[tauri::command]
    pub async fn get_roles(path: &str, context: &str) -> Result<Vec<Role>, GenericError> {
        log::info!("get_roles {:?} {:?}", path, context);
        let client = get_client(&path, context).await?;
        let roles: Api<Role> = Api::all(client);

        let roles = roles.list(&ListParams::default()).await.map_err(|err| {
            println!("error {:?}", err);
            GenericError::from(err)
        })?;

        Ok(roles.items)
    }
}