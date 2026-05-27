import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  Calendar,
  Beaker,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Package,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { getReservationsByDocente, getPendingReservations, laboratories, materials } = useDataStore();
  const { user } = useAuthStore();

  const myReservations = user ? getReservationsByDocente(user.id) : [];
  const upcomingReservations = myReservations
    .filter((r) => r.status === 'aprovada')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const pendingReservations = getPendingReservations();
  const availableLabs = laboratories.filter((l) => l.status === 'disponivel');
  const criticalMaterials = materials.filter((m) => m.quantidade <= m.estoque_minimo);

  const stats = [
    {
      title: 'Próximas Reservas',
      value: upcomingReservations.length,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Laboratórios Disponíveis',
      value: availableLabs.length,
      icon: Beaker,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Reservas Pendentes',
      value: pendingReservations.length,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Materiais Críticos',
      value: criticalMaterials.length,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximas Reservas */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximas Reservas
              </CardTitle>
              <CardDescription>Suas reservas aprovadas</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma reserva aprovada</p>
                  <Link href="/reservas">
                    <Button variant="outline" size="sm">
                      Criar Reserva
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reservation.disciplina}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reservation.laboratorio.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reservation.data).toLocaleDateString('pt-BR')} •{' '}
                          {reservation.inicio} - {reservation.fim}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Aprovada
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/reservas">
                <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4" />
                  Nova Reserva
                </Button>
              </Link>
              <Link href="/agenda">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Ver Agenda
                </Button>
              </Link>
              <Link href="/estoque">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="w-4 h-4" />
                  Estoque
                </Button>
              </Link>
              {user?.perfil === 'tecnico' && (
                <Link href="/aprovacoes">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Aprovar Reservas
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals (for tecnico) */}
        {user?.perfil === 'tecnico' && pendingReservations.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Reservas Aguardando Aprovação
              </CardTitle>
              <CardDescription>{pendingReservations.length} reservas pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReservations.slice(0, 5).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reservation.disciplina}</p>
                      <p className="text-xs text-muted-foreground">
                        Prof. {reservation.docente.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.laboratorio.nome} • {reservation.quantidade_alunos} alunos
                      </p>
                    </div>
                    <Link href={`/aprovacoes?id=${reservation.id}`}>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Materials */}
        {criticalMaterials.length > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Materiais com Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalMaterials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
                  >
                    <div>
                      <p className="text-sm font-medium">{material.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.quantidade} {material.unidade} (mín: {material.estoque_minimo})
                      </p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
