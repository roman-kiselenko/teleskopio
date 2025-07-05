import { suspend } from '@hookstate/core'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'
// import { useVersionState } from './store/version.ts'
// import { useNamespaceState } from './store/namespaces.ts'
import "./App.css";
import { Toaster } from 'sonner';

function App() {
  // const versionState = useVersionState()
  // const namespacesState = useNamespaceState()

  return (
    <React.Suspense>
        {<RouterProvider router={router} />}
        {/* {suspend(namespacesState) ||
        suspend(versionState) || <RouterProvider router={router} />} */}
        <Toaster />
      </React.Suspense>
  );
}

export default App;
