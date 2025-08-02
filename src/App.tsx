import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './App.css';
import './userWorker';

function App() {
  return (
    <React.Suspense>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}

export default App;
