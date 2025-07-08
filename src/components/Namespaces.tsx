export function Namespaces() {
  return (
    <div className="flex flex-col w-38 border-r border-gray-300">
      <button className="relative text-sm focus:outline-none group">
        <div className="flex items-center justify-between w-full h-12 px-3 border-b border-gray-300 hover:bg-blue-300">
          <span className="font-medium">Namespaces</span>
        </div>
        <div className="absolute z-10 flex-col items-start hidden w-full pb-1 bg-white shadow-lg group-focus:flex">
          <a className="w-full px-4 py-1 text-left hover:bg-blue-300" href="#">
            default
          </a>
          <a className="w-full px-4 py-1 text-left hover:bg-blue-300" href="#">
            kube-system
          </a>
          <a className="w-full px-4 py-1 text-left hover:bg-blue-300" href="#">
            core-dns
          </a>
        </div>
      </button>
      <div className="flex flex-col flex-grow p-2 overflow-auto">
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-sm font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">default</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-sm font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">kube-system</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-sm font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">core-dns</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-sm font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">argocd</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-sm font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">prometheus</span>
        </a>
      </div>
    </div>
  );
}
