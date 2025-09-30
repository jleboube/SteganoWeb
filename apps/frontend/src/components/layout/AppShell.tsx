import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCallback } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/#honest', label: 'Honest Uses', external: false },
  { to: '/#nefarious', label: 'Nefarious Laughs', external: false },
  { to: '/#how-it-works', label: 'How It Works', external: false },
  { to: '/api', label: 'API Docs', external: true }
];

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/60 flex items-center justify-center">
              <span className="text-accent font-bold text-xl">SW</span>
            </div>
            <span className="font-display text-2xl tracking-wide">SteganoWeb</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) =>
              item.external ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'text-sm uppercase tracking-wide transition',
                      isActive ? 'text-white' : 'text-white/70 hover:text-white'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.label}
                  href={item.to}
                  className="text-sm uppercase tracking-wide text-white/70 hover:text-white transition"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition',
                      isActive ? 'bg-white text-black' : 'hover:border-accent hover:text-accent'
                    )
                  }
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-red-400/60 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 hover:bg-red-400/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition',
                      isActive ? 'bg-white text-black' : 'hover:border-accent hover:text-accent'
                    )
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_0_30px_-10px_rgba(0,245,160,0.8)] transition',
                      isActive ? 'scale-105' : 'hover:scale-105'
                    )
                  }
                >
                  Join Free
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-black/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SteganoWeb. Hide boldly, use ethically.</p>
          <p className="max-w-xl text-xs">
            SteganoWeb promotes ethical use. Misuse is at your own risk and may violate laws.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
