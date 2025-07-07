import { suspend } from '@hookstate/core'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'
import { useConfigsState } from './store/configs.ts'
import "./App.css";
import { Toaster } from 'sonner';

function App() {
  const configsState = useConfigsState()

  return (
    <React.Suspense>
        {suspend(configsState) || <RouterProvider router={router} />}
        <Toaster />
      </React.Suspense>
  );
}

export default App;
