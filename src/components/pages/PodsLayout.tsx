import { Outlet } from 'react-router';
export function PodsLayout() {
  return (
    <div className="flex flex-col flex-grow">
      PodsLayout
      <Outlet />
    </div>
  );
}
