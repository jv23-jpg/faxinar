import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Sparkles,
  Shield,
  Users,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('cleaner-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Try to load cleaner or client profile
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: userData.email });
      if (cleanerProfiles.length > 0) {
        setUserProfile({ type: 'cleaner', data: cleanerProfiles[0] });
        return;
      }
      
      const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: userData.email });
      if (clientProfiles.length > 0) {
        setUserProfile({ type: 'client', data: clientProfiles[0] });
      }
    } catch (e) {
      // Not logged in
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cleaner-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isPublicPage = ['Home', 'Precos', 'Cadastro'].includes(currentPageName);

  const getNavItems = () => {
    if (!user) {
      return [
        { name: 'Início', page: 'Home', icon: Home },
        { name: 'Preços', page: 'Precos', icon: ClipboardList },
        { name: 'Cadastro', page: 'Cadastro', icon: User },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', page: 'AdminDashboard', icon: Shield },
        { name: 'Faxineiras', page: 'AdminCleaners', icon: Users },
        { name: 'Pedidos', page: 'AdminRequests', icon: Calendar },
        { name: 'Saques', page: 'AdminWithdrawals', icon: Sparkles },
        { name: 'Suporte', page: 'AdminSupport', icon: Shield },
        { name: 'Configurações', page: 'AdminSettings', icon: Settings },
      ];
    }

    if (userProfile?.type === 'cleaner') {
      return [
        { name: 'Meus Serviços', page: 'CleanerDashboard', icon: Home },
        { name: 'Agenda', page: 'CleanerSchedule', icon: Calendar },
        { name: 'Disponibilidade', page: 'CleanerAvailability', icon: Calendar },
        { name: 'Saques', page: 'CleanerWithdrawals', icon: Sparkles },
        { name: 'Perfil', page: 'CleanerProfile', icon: User },
      ];
    }

    return [
      { name: 'Início', page: 'ClientDashboard', icon: Home },
      { name: 'Pedir Limpeza', page: 'BookCleaning', icon: Calendar },
      { name: 'Meus Pedidos', page: 'ClientRequests', icon: ClipboardList },
      { name: 'Perfil', page: 'ClientProfilePage', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 transition-colors duration-300">
      <style>{`
        :root {
          --primary: 16 185 129;
          --primary-foreground: 255 255 255;
        }
        .dark {
          --primary: 52 211 153;
          --primary-foreground: 0 0 0;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Leidy Cleaner
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" 
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-slate-600" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
              </Button>

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {user.full_name || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-lg text-slate-500 hover:text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="hidden md:flex bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                >
                  Entrar
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-16 right-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" 
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  Entrar
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Leidy Cleaner © 2026
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Limpeza profissional com qualidade garantida
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <a href="tel:+555198033-0422" className="hover:text-emerald-600 transition-colors">
                  📞 (51) 98033-0422
                </a>
                <a href="mailto:contato@leidycleaner.com.br" className="hover:text-emerald-600 transition-colors">
                  ✉️ contato@leidycleaner.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {isPublicPage && <WhatsAppButton />}
      </div>
      );
      }