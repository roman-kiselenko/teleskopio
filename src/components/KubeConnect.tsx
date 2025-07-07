import toast from 'react-hot-toast';
import { setVersion } from '../store/version.ts'
import { getConfigFolder } from '../store/configs.ts'
import { setCurrentCluster } from '../store/currentCluster.ts'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from "react-router";

interface KubeVersion {
  gitVersion: string;
}

const KubeConnect = () => {
    const navigate = useNavigate();
    const get_version = async (cluster: string, path: any) => {
        toast.promise(
          invoke<KubeVersion>('get_version', { path: path, context: cluster }),
          {
            loading: 'Connecting...',
            success: (data: KubeVersion) => {
               setVersion(data.gitVersion);
               setCurrentCluster(cluster, path)
               navigate("/cluster");
               return <span>Successfully connected to <b>{cluster}</b> <b>{data.gitVersion}</b></span>
            },
            error: (err) => <span>Cant connect to <b>{cluster}</b><br/>{err.message}</span>,
          },
        );
    }
	  return (
        <div className="grid items-baseline-last">
          {
            getConfigFolder() === undefined ?
            <></>
            :
            (getConfigFolder() || []).map((cluster: any, index) => (
              <div key={index} className="mb-2">
                <button
                  onClick={async () => await get_version(cluster.name, cluster.path)}
                  type="button"
                  className="px-3 py-2 text-xs font-medium text-center text-foreground bg-blue-300 rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Connect to cluster <b>{cluster.name}</b>
                </button>
              </div>
            ))
          }
        </div>
	);
};

export default KubeConnect;