import ReactDOM from 'react-dom/client';
import App from './App';
import { WSProvider } from '@/wsContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <WSProvider>
    <App />,
  </WSProvider>,
  // </React.StrictMode>,
);
