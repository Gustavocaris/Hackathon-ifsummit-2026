import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';



interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const { getUnreadNotifications } = useDataStore();
  const { user } = useAuthStore();
  const unreadNotifications = getUnreadNotifications();
  const { theme, toggleTheme } = useTheme();

  return (
    
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-foreground">{title || 'Dashboard'}</h1>
          </div>
          {/* Theme Toggle */}
          {toggleTheme && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              title={`Mudar para ${theme === 'light' ? 'modo escuro' : 'modo claro'}`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          )}
          {/* Notifications */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  ) : (
                    unreadNotifications.slice(0, 5).map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-4 cursor-pointer">
                        <p className="text-sm font-medium">{notif.mensagem}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.data_criacao).toLocaleDateString('pt-BR')}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.nome}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.perfil}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                {user?.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
