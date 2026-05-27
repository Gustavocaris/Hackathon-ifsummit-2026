import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Beaker, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agenda() {
  const { reservations, laboratories } = useDataStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLab, setSelectedLab] = useState<string>('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredReservations = reservations.filter((r) => {
    if (selectedLab && r.laboratorio_id !== selectedLab) return false;
    const resDate = new Date(r.data);
    return isSameMonth(resDate, currentDate) && r.status === 'aprovada';
  });

  const getReservationsForDay = (day: Date) => {
    return filteredReservations.filter((r) => isSameDay(new Date(r.data), day));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-amber-100 text-amber-800',
      aprovada: 'bg-green-100 text-green-800',
      reprovada: 'bg-red-100 text-red-800',
      ajuste_solicitado: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const upcomingReservations = reservations
    .filter((r) => r.status === 'aprovada')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout title="Agenda de Laboratórios">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
          <p className="text-muted-foreground mt-1">
            Visualize as reservas de laboratórios
          </p>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
                    <CardDescription>Reservas aprovadas</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Lab filter */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Filtrar por laboratório:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedLab === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLab('')}
                    >
                      Todos
                    </Button>
                    {laboratories.map((lab) => (
                      <Button
                        key={lab.id}
                        variant={selectedLab === lab.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLab(lab.id)}
                      >
                        {lab.nome}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="space-y-4">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {daysInMonth.map((day) => {
                      const dayReservations = getReservationsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);

                      return (
                        <div
                          key={day.toString()}
                          className={`min-h-24 p-2 rounded-lg border ${
                            isCurrentMonth
                              ? 'bg-background border-border'
                              : 'bg-muted border-border/50 opacity-50'
                          }`}
                        >
                          <p className="text-sm font-medium text-foreground">
                            {format(day, 'd')}
                          </p>
                          <div className="mt-1 space-y-1">
                            {dayReservations.slice(0, 2).map((res) => (
                              <div
                                key={res.id}
                                className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(res.status)}`}
                              >
                                {res.disciplina}
                              </div>
                            ))}
                            {dayReservations.length > 2 && (
                              <p className="text-xs text-muted-foreground px-2">
                                +{dayReservations.length - 2} mais
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Próximas Reservas</CardTitle>
                <CardDescription>Todas as reservas aprovadas</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma reserva aprovada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {reservation.disciplina}
                            </h3>
                            <Badge className="bg-green-600">Aprovada</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Beaker className="w-4 h-4" />
                              {reservation.laboratorio.nome}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(reservation.data).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {reservation.inicio} - {reservation.fim}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {reservation.quantidade_alunos} alunos
                            </div>
                          </div>

                          {reservation.observacoes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Obs:</span> {reservation.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
