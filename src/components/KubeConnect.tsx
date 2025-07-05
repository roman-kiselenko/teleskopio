import toast from 'react-hot-toast';
import { setVersion } from '../store/version.ts'
import { getConfigFolder } from '../store/configs.ts'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from "react-router";

interface KubeVersion {
  gitVersion: string;
}

const KubeConnect = () => {
    const navigate = useNavigate();
    const get_version = async (path: any) => {
        console.log('path:', path);
        let version: KubeVersion
        const toastId = toast.loading("Connecting to cluster...");
        try {
            version = await invoke<KubeVersion>('get_version', { path: path });
            toast.dismiss(toastId);
            toast.success('Success!\nCluster available version: ' + version.gitVersion)
            setVersion(version.gitVersion)
            console.log('Version:', version);
            navigate("/cluster");
        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error('Cant connect to cluster.\n' + error.message)
            console.error('Cant connect to cluster:', error.message);
        }
    }
	return (
        <div className="grid items-baseline-last">
          {
            getConfigFolder() == undefined ?
            <></>
            :
            getConfigFolder().map((cluster: any, index: Number) => (
              <div key={index} className="mb-2">
                <button
                  onClick={async () => await get_version(cluster.path)}
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