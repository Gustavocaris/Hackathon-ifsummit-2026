import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import {
  LayoutDashboard,
  Calendar,
  Beaker,
  Package,
  CheckCircle,
  Bell,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Calendar, label: 'Agenda', href: '/agenda' },
      { icon: Beaker, label: 'Reservas', href: '/reservas' },
      { icon: Package, label: 'Estoque', href: '/estoque' },
      { icon: Bell, label: 'Notificações', href: '/notificacoes' },
    ];

    if (user?.perfil === 'tecnico') {
      baseItems.push({
        icon: CheckCircle,
        label: 'Aprovações',
        href: '/aprovacoes',
      });
    }

    if (user?.perfil === 'admin') {
      baseItems.push({
        icon: Users,
        label: 'Usuários',
        href: '/usuarios',
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Beaker className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">LabSys</h1>
              <p className="text-xs text-sidebar-accent-foreground">Gestão de Labs</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-lg">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.nome}
              </p>
              <p className="text-xs text-sidebar-accent-foreground capitalize">
                {user?.perfil}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
