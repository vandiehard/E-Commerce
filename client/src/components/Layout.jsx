import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <div className="relative" style={{ zIndex: 2 }}>
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="glass border-t border-white/30 py-8 text-center text-sm text-text-light mt-8">
          <p className="font-semibold text-base gradient-text mb-1">ree-store</p>
          <p className="text-xs mb-2 text-gray-500">Where Style Meets Substance</p>
          <p>&copy; 2026 Ree-Store. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
