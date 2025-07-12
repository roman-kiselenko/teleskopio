import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export function StorageLink({ disabled = false }) {
  const currentPath = useLocation();
  const isStoragePage = useMemo(() => currentPath.pathname === '/storage', [currentPath]);
  const children = (
    <div
      className={`flex items-center justify-center flex-shrink-0 w-10 h-10 mt-3 rounded hover:bg-blue-300 ${
        isStoragePage ? 'bg-blue-100' : ''
      }`}
    >
      <div
        className="rounded-lg px-4 h-8 relative
              flex items-center justify-center text-sm cursor-pointer text-foreground gap-2 transition-colors"
      >
        <FontAwesomeIcon icon={faDatabase} size="lg" className="" />
      </div>
    </div>
  );
  return (
    <>
      {disabled ? (
        <a className="text-foreground-400 cursor-not-allowed opacity-50">{children}</a>
      ) : (
        <NavLink to="/storage" className="cursor-pointer rounded flex flex-col items-center">
          {children}
        </NavLink>
      )}
    </>
  );
}
