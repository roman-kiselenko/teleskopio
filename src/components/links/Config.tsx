import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { faToolbox } from '@fortawesome/free-solid-svg-icons';

export function ConfigLink({ disabled = false }) {
  const children = (
    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-3 rounded hover:bg-blue-300">
      <div
        className="rounded-lg px-4 h-8 relative
              flex items-center justify-center text-sm cursor-pointer text-foreground gap-2 transition-colors"
      >
        <FontAwesomeIcon icon={faToolbox} size="lg" className="" />
      </div>
    </div>
  );
  return (
    <>
      {disabled ? (
        <a className="text-foreground-400 cursor-not-allowed opacity-50">{children}</a>
      ) : (
        <NavLink to="/config" className="cursor-pointer rounded flex flex-col items-center">
          {children}
        </NavLink>
      )}
    </>
  );
}
