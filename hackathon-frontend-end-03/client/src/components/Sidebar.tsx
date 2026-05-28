import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import {
  CalendarDays,
  LayoutDashboard,
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
    // Calendário é sempre o primeiro item — principal para docentes e técnicos
    const items = [
      { icon: CalendarDays, label: 'Calendário', href: '/agenda',      primary: true  },
      { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard', primary: false },
      { icon: Beaker,        label: 'Reservas',     href: '/reservas',  primary: false },
      { icon: Package,       label: 'Estoque',      href: '/estoque',   primary: false },
      { icon: Bell,          label: 'Notificações', href: '/notificacoes', primary: false },
    ];

    if (user?.perfil === 'tecnico' || user?.perfil === 'admin') {
      items.push({ icon: CheckCircle, label: 'Aprovações', href: '/aprovacoes', primary: false });
    }

    if (user?.perfil === 'admin') {
      items.push({ icon: Users, label: 'Usuários', href: '/usuarios', primary: false });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // Considera /agenda e / como ativas para o item Calendário
  const isActive = (href: string) =>
    location === href || (href === '/agenda' && location === '/');

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
          'fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 flex flex-col',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-center shrink-0">
          <img
            src="/images/logo-ifslot.png"
            alt="Logo"
            className="h-35 w-auto object-contain"
          />
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-lg font-bold text-sidebar-primary-foreground">
              {user?.avatar ?? user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.nome}</p>
              <p className="text-xs text-sidebar-accent-foreground capitalize">{user?.perfil}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          {/* Calendário — destaque visual separado dos outros itens */}
          {menuItems.filter(i => i.primary).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground bg-sidebar-accent/40 hover:bg-sidebar-accent border border-sidebar-border',
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {!active && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-sidebar-primary opacity-70">
                      Principal
                    </span>
                  )}
                </a>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-1 pb-1">
            <div className="border-t border-sidebar-border" />
          </div>

          {/* Demais itens */}
          {menuItems.filter(i => !i.primary).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent',
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
        <div className="p-4 border-t border-sidebar-border shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => { logout(); setIsOpen(false); }}
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
