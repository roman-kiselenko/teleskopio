import toast, { Toaster } from 'react-hot-toast';
import { setVersion, useVersionState } from '../store/version.ts'
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
            toast.success('Success!', {
                style: {
                    fontFamily: 'Red Hat Display',
                }
            })
            setVersion(version.gitVersion)
            console.log('Version:', version);
            navigate("/cluster");
        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error('Cant connect to cluster. ' + error.message, {
                style: {
                    fontFamily: 'Red Hat Display',
                }
            })
            console.error('Cant connect to cluster:', error.message);
        }
    }
	return (
        <div className="grid items-baseline-last">
        <button onClick={get_version} type="button" className="px-3 py-2 text-xs font-medium text-center text-foreground bg-blue-300 rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Connect to cluster {clusterVersion.version.get()}
        </button>
            <Toaster
                toastOptions={{ className: "!font-medium !text-xs" }}
                containerStyle={{
                    top: 20,
                    left: 20,
                    bottom: 20,
                    right: 20,
                }}
                position="bottom-right"
                reverseOrder={false} />
        </div>
	);
};

export default KubeConnect;