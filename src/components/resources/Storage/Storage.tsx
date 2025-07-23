import { usePageState } from '@/store/page';

export function Storage() {
  const currentPage = usePageState();
  const sections = [{ section: 'storageclasses', title: 'StorageClass' }];
  return (
    <div className="flex flex-col w-35 border-r border-gray-300">
      <div className="relative text-sm focus:outline-none group">
        <div className="flex items-center justify-between w-full h-12 px-3 border-b border-gray-300">
          <span className="font-medium">Storage</span>
        </div>
      </div>
      <div className="flex flex-col flex-grow p-2 overflow-auto">
        {sections.map((s: any, index: number) => (
          <a
            key={index}
            className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
              currentPage.currentPage.get() === s.section ? 'bg-blue-100' : ''
            }`}
            href="#"
            onClick={() => currentPage.currentPage.set(s.section)}
          >
            <span className="leading-none">{s.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
