import toast, { Toaster } from 'react-hot-toast';

const notify = () => toast.success('Here is your toast.', {
    style: {
        fontFamily: 'Red Hat Display',
    }
});

const KubeConnect = () => {
	return (
        <div className="grid items-baseline-last">
        <button onClick={notify} type="button" className="px-3 py-2 text-xs font-medium text-center text-foreground bg-blue-300 rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Connect to cluster
        </button>
            <Toaster
                toastOptions={{
                    className: "!font-medium !text-xs",
                    success: {
                        style: {
                            fontFamily: "Roboto",
                        }
                    }
                }}
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