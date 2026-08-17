import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-center">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <p className="mt-2 text-lg text-slate-600">Page not found</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Go home
      </Link>
    </div>
  );
}
