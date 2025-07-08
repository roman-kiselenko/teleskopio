import { suspend } from '@hookstate/core';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useConfigsState } from './store/configs';
import './App.css';
import { Toaster } from 'sonner';

function App() {
  const configsState = useConfigsState();

  return (
    <React.Suspense>
      {suspend(configsState) || <RouterProvider router={router} />}
      <Toaster />
    </React.Suspense>
  );
}

export default App;
