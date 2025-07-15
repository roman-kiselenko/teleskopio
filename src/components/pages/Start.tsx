import KubeConnect from '~/components/KubeConnect';
import { useLoaderData } from 'react-router';

export function StartPage() {
  const { configs } = useLoaderData();

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300"></div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-3">
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-2 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-1 bg-background">
            <KubeConnect configs={configs} />
          </div>
          <div className="h-24 col-span-2 bg-background"></div>
          <div className="h-24 col-span-3 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
          <div className="h-24 col-span-2 bg-background"></div>
          <div className="h-24 col-span-1 bg-background"></div>
        </div>
      </div>
    </div>
  );
}
