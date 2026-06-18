import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="glass-strong border-b border-white/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight gradient-text">ree-store</span>
            <span className="text-[10px] text-text-light font-medium tracking-widest uppercase hidden sm:block">Where Style Meets Substance</span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-text-light transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/cart" className="relative p-2.5 hover:bg-white/60 rounded-xl transition-all hover:scale-110">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2.5 hover:bg-white/60 rounded-xl transition-all hover:scale-105"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">{user.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl shadow-xl border border-white/40 py-2 z-50 overflow-hidden">
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/60 transition-colors">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/60 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-white/30" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-white/60 text-red-600 transition-colors text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:bg-white/60 rounded-xl transition-all hover:scale-105">Login</Link>
                <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-300/50 hover:scale-105 transition-all duration-300">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-text-light transition-all"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
