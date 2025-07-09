import KubeConnect from '~/components/KubeConnect';
import { useLoaderData } from 'react-router';

export function StartPage() {
  const { configs } = useLoaderData();

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300">
        {/* <button className="relative text-sm focus:outline-none group">
                <div className="flex items-center justify-between w-full h-12 px-2 hover:bg-blue-300">
                    <span className="font-medium">
                    Workloads
                    </span>
                </div>
            </button> */}
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-3">
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-2 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-1 bg-white">
            <KubeConnect configs={configs} />
          </div>
          <div className="h-24 col-span-2 bg-white"></div>
          <div className="h-24 col-span-3 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
          <div className="h-24 col-span-2 bg-white"></div>
          <div className="h-24 col-span-1 bg-white"></div>
        </div>
      </div>
    </div>
  );
}
