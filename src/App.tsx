import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './App.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <React.Suspense>
      <RouterProvider router={router} />
      <Toaster />
    </React.Suspense>
  );
}

export default App;
