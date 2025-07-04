import { suspend } from '@hookstate/core'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'
import { useNamespaceState } from './store/namespaces.ts'
import "./App.css";
import { Toaster } from 'sonner';

function App() {
  const namespacesState = useNamespaceState()

  return (
    <React.Suspense>
        {suspend(namespacesState) || <RouterProvider router={router} />}
        <Toaster />
      </React.Suspense>
  );
}

export default App;
