import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/hooks/useAuth';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      <main className={user ? "pt-4" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
