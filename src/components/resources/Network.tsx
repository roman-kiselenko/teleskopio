export function Network() {
  return (
    <div className="flex flex-col w-45 border-r border-gray-300">
      <button className="relative text-sm focus:outline-none group">
        <div className="flex items-center justify-between w-full h-12 px-3 border-b border-gray-300 hover:bg-blue-300">
          <span className="font-medium">Network</span>
        </div>
      </button>
      <div className="flex flex-col flex-grow p-2 overflow-auto">
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">Services</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">Ingresses</span>
        </a>
        <a
          className="flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300"
          href="#"
        >
          <span className="leading-none">NetworkPolicies</span>
        </a>
      </div>
    </div>
  );
}
