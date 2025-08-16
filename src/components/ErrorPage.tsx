import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ban, ArrowBigLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  let navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'Cant render a page';

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-sm font-bold mb-4">{title}</h1>
        <div className="flex gap-2 pb-2 items-center justify-center ">
          <Ban size={12} />
          <p className="text-xs">{message}</p>
        </div>
        <div className="flex gap-4 justify-center mt-6">
          <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
            <ArrowBigLeft /> Esc
          </Button>
        </div>
      </div>
    </div>
  );
}
