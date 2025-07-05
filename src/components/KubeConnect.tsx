import toast from 'react-hot-toast';
import { setVersion, useVersionState } from '../store/version.ts'
import { getConfigFolder, useConfigsState } from '../store/configs.ts'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from "react-router";

interface KubeVersion {
  gitVersion: string;
}

const KubeConnect = () => {
    const clusterVersion = useVersionState()
    const navigate = useNavigate();
    const get_version = async () => {
        let version
        const toastId = toast.loading("Connecting to cluster...");
        try {
            version = await invoke<KubeVersion>('get_version');
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
            <button onClick={get_version} type="button" className="px-3 py-2 text-xs font-medium text-center text-foreground bg-blue-300 rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Connect to cluster
            </button>
          }
        </div>
	);
};

export default KubeConnect;