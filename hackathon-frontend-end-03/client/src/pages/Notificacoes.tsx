import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, AlertCircle, Wrench, Package, FileText, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function Notificacoes() {
  const { notifications, markNotificationAsRead, getUnreadNotifications, reservations } = useDataStore();
  const [, setLocation] = useLocation();
  const unreadNotifications = getUnreadNotifications();

  // Check for finished reservations and create reminders
  useEffect(() => {
    const checkFinishedReservations = () => {
      const now = new Date();
      
      reservations.forEach((reservation) => {
        if (reservation.status === 'aprovada') {
          const [hours, minutes] = reservation.fim.split(':').map(Number);
          const reservationEndTime = new Date(reservation.data);
          reservationEndTime.setHours(hours, minutes, 0);

          // If reservation ended in the last 5 minutes, show reminder
          const timeDiff = now.getTime() - reservationEndTime.getTime();
          if (timeDiff > 0 && timeDiff < 5 * 60 * 1000) {
            // Check if reminder already exists
            const reminderExists = notifications.some(
              (n) => n.tipo === 'relatorio_pendente' && n.mensagem.includes(reservation.id)
            );
            
            if (!reminderExists) {
              // In a real app, this would be added to the store
              // For now, we just show a visual indicator
            }
          }
        }
      });
    };

    const interval = setInterval(checkFinishedReservations, 60000); // Check every minute
    checkFinishedReservations(); // Initial check

    return () => clearInterval(interval);
  }, [reservations, notifications]);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    toast.success('Notificação marcada como lida');
  };

  const handleGoToReport = () => {
    setLocation('/dashboard');
    toast.success('Redirecionando para preencher relatório...');
  };

  const getNotificationIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      reserva_aprovada: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      reserva_reprovada: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
      ajuste_solicitado: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
      estoque_insuficiente: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
      manutencao: { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100' },
      relatorio_pendente: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
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
      relatorio_pendente: 'Relatório Pendente',
    };
    return labels[tipo] || tipo;
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
  );

  // Get finished reservations that need reports
  const finishedReservationsNeedingReports = reservations.filter((reservation) => {
    if (reservation.status !== 'aprovada') return false;
    
    const [hours, minutes] = reservation.fim.split(':').map(Number);
    const reservationEndTime = new Date(reservation.data);
    reservationEndTime.setHours(hours, minutes, 0);
    
    const now = new Date();
    const timeDiff = now.getTime() - reservationEndTime.getTime();
    
    // Show reminder if reservation ended less than 24 hours ago
    return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;
  });

  // Get professors with pending reports
  const professorsWithPendingReports = finishedReservationsNeedingReports.map((reservation) => ({
    nome: reservation.docente.nome,
    laboratorio: reservation.laboratorio.nome,
    data: reservation.data,
    fim: reservation.fim,
  }));

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

        {/* Reminder for finished reservations */}
        {professorsWithPendingReports.length > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5" />
                Relatórios Pendentes
              </CardTitle>
              <CardDescription className="text-red-700">
                {professorsWithPendingReports.length} professor(es) com relatório(s) pendente(s) após uso das salas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {professorsWithPendingReports.map((prof, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">
                        {prof.nome}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {prof.laboratorio} • {new Date(prof.data).toLocaleDateString('pt-BR')} às {prof.fim}
                      </p>
                    </div>
                    <Badge variant="destructive">Pendente</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

                        <div className="flex gap-2">
                          {notification.tipo === 'relatorio_pendente' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleGoToReport}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              Ir
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Marcar como lida
                          </Button>
                        </div>
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
                          <div className="flex gap-2">
                            {notification.tipo === 'relatorio_pendente' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleGoToReport}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Ir
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Marcar como lida
                            </Button>
                          </div>
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