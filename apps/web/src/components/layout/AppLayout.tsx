import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { Home, BookOpen, FileText, LogOut, Presentation } from 'lucide-react';
import { cn } from '../../lib/utils';
import NotificationBell from './NotificationBell'; // 🔥 Imported

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Courses', icon: BookOpen, path: '/courses' },
    { name: 'Past Questions', icon: FileText, path: '/past-questions' },
  ];

  if (user?.role === 'lecturer' || user?.role === 'admin') {
    navItems.push({ name: 'Lecturer Hub', icon: Presentation, path: '/lecturer' });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold text-brand-500 tracking-tight">Cengoal.</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-brand-500" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-main truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-text-main">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center gap-6">
            <span className="text-sm text-text-muted hidden sm:block">Department of Computer Engineering</span>
            {/* 🔥 THE NOTIFICATION BELL */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}