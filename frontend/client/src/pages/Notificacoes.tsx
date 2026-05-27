import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, AlertCircle, Wrench, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Notificacoes() {
  const { notifications, markNotificationAsRead, getUnreadNotifications } = useDataStore();
  const unreadNotifications = getUnreadNotifications();

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    toast.success('Notificação marcada como lida');
  };

  const getNotificationIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      reserva_aprovada: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      reserva_reprovada: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
      ajuste_solicitado: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
      estoque_insuficiente: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
      manutencao: { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100' },
    };
    return icons[tipo] || icons.reserva_aprovada;
  };

  const getNotificationLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      reserva_aprovada: 'Reserva Aprovada',
      reserva_reprovada: 'Reserva Reprovada',
      ajuste_solicitado: 'Ajuste Solicitado',
      estoque_insuficiente: 'Estoque Insuficiente',
      manutencao: 'Manutenção',
    };
    return labels[tipo] || tipo;
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
  );

  return (
    <DashboardLayout title="Notificações">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notificações</h2>
            <p className="text-muted-foreground mt-1">
              {unreadNotifications.length} não lida(s) de {notifications.length} total
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="unread" className="w-full">
          <TabsList>
            <TabsTrigger value="unread">
              Não Lidas ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          </TabsList>

          {/* Unread Notifications */}
          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma notificação não lida</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map((notification) => {
                const notifConfig = getNotificationIcon(notification.tipo);
                const Icon = notifConfig.icon;

                return (
                  <Card
                    key={notification.id}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${notifConfig.bg}`}>
                          <Icon className={`w-6 h-6 ${notifConfig.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Badge className="mb-2">
                                {getNotificationLabel(notification.tipo)}
                              </Badge>
                              <p className="text-sm font-medium text-foreground">
                                {notification.mensagem}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.data_criacao).toLocaleDateString('pt-BR')}{' '}
                                às{' '}
                                {new Date(notification.data_criacao).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Marcar como lida
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* All Notifications */}
          <TabsContent value="all" className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma notificação</p>
                </CardContent>
              </Card>
            ) : (
              sortedNotifications.map((notification) => {
                const notifConfig = getNotificationIcon(notification.tipo);
                const Icon = notifConfig.icon;

                return (
                  <Card
                    key={notification.id}
                    className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                      !notification.lida ? 'bg-blue-50' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${notifConfig.bg}`}>
                          <Icon className={`w-6 h-6 ${notifConfig.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>
                                  {getNotificationLabel(notification.tipo)}
                                </Badge>
                                {!notification.lida && (
                                  <Badge variant="default" className="bg-blue-600">
                                    Novo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {notification.mensagem}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.data_criacao).toLocaleDateString('pt-BR')}{' '}
                                às{' '}
                                {new Date(notification.data_criacao).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {!notification.lida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
