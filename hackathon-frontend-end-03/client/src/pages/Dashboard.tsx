import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useState } from 'react';
import {
  Calendar,
  Beaker,
  FileText,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  X,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { getReservationsByDocente, getPendingReservations, laboratories } = useDataStore();
  const { user } = useAuthStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('-').slice(0, 2).join('-'));
  const [reportData, setReportData] = useState({
    observacoes: '',
    materiaisUtilizados: '',
    data: new Date().toISOString().split('T')[0],
    tipoUso: 'Ensino',
    residuo: '',
    concentracao: '',
    assinatura: '',
  });

  const myReservations = user ? getReservationsByDocente(user.id) : [];
  const upcomingReservations = myReservations
    .filter((r) => r.status === 'aprovada')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const nextReservation = myReservations
    .filter((r) => r.status === 'aprovada')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];

  const pendingReservations = getPendingReservations();

  // Mock data for usage chart
  const usageData = [
    { dia: '01', Química: 2, Biologia: 1 },
    { dia: '02', Química: 3, Biologia: 2 },
    { dia: '03', Química: 1, Biologia: 3 },
    { dia: '04', Química: 4, Biologia: 2 },
    { dia: '05', Química: 2, Biologia: 4 },
    { dia: '06', Química: 3, Biologia: 1 },
    { dia: '07', Química: 5, Biologia: 3 },
    { dia: '08', Química: 2, Biologia: 2 },
    { dia: '09', Química: 4, Biologia: 4 },
    { dia: '10', Química: 3, Biologia: 2 },
    { dia: '11', Química: 2, Biologia: 3 },
    { dia: '12', Química: 4, Biologia: 1 },
    { dia: '13', Química: 3, Biologia: 4 },
    { dia: '14', Química: 5, Biologia: 2 },
    { dia: '15', Química: 2, Biologia: 3 },
    { dia: '16', Química: 4, Biologia: 4 },
    { dia: '17', Química: 3, Biologia: 2 },
    { dia: '18', Química: 2, Biologia: 3 },
    { dia: '19', Química: 4, Biologia: 1 },
    { dia: '20', Química: 3, Biologia: 4 },
  ];

  // Technician-specific stats
  const technicianStats = [
    {
      title: 'Reservas Pendentes',
      value: pendingReservations.length,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Relatórios Preenchidos',
      value: 12,
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
  ];

  // Teacher-specific stats
  const teacherStats = [
    {
      title: 'Próxima Reserva',
      value: nextReservation 
        ? `${new Date(nextReservation.data).toLocaleDateString('pt-BR')} às ${nextReservation.inicio}`
        : 'Nenhuma',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      isText: true,
    },
    {
      title: 'Reservas Pendentes',
      value: pendingReservations.length,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  const stats = user?.perfil === 'tecnico' ? technicianStats : teacherStats;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportData.observacoes.trim()) {
      toast.error('Preencha as observações gerais');
      return;
    }

    if (!reportData.materiaisUtilizados.trim()) {
      toast.error('Preencha os materiais utilizados');
      return;
    }

    if (!reportData.residuo.trim() || !reportData.concentracao.trim() || !reportData.assinatura.trim()) {
      toast.error('Preencha todos os campos de reagentes controlados');
      return;
    }

    toast.success('Relatório enviado com sucesso!');
    setShowReportModal(false);
    setReportData({
      observacoes: '',
      materiaisUtilizados: '',
      data: new Date().toISOString().split('T')[0],
      tipoUso: 'Ensino',
      residuo: '',
      concentracao: '',
      assinatura: '',
    });
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`${'isText' in stat && stat.isText ? 'text-lg font-semibold' : 'text-3xl font-bold'} mt-2`}>
                        {stat.value}
                      </p>
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

        {/* Technician View */}
        {user?.perfil === 'tecnico' && (
          <>
            {/* Usage Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <div>
                      <CardTitle>Frequência de Uso dos Laboratórios</CardTitle>
                      <CardDescription>Média de uso durante o mês</CardDescription>
                    </div>
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-01">Janeiro 2026</SelectItem>
                      <SelectItem value="2026-02">Fevereiro 2026</SelectItem>
                      <SelectItem value="2026-03">Março 2026</SelectItem>
                      <SelectItem value="2026-04">Abril 2026</SelectItem>
                      <SelectItem value="2026-05">Maio 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Química" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Biologia" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pending Reports */}
            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Relatórios Pendentes
                </CardTitle>
                <CardDescription>Professores que precisam preencher relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nome: 'Prof. João Santos', lab: 'Química', data: '27/05/2026', tempo: '2 horas' },
                    { nome: 'Prof. Lucas Silva', lab: 'Biologia', data: '26/05/2026', tempo: '1 hora' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.nome}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.lab} • {item.data} • {item.tempo}
                        </p>
                      </div>
                      <Badge variant="destructive">Pendente</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* View Reports */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Relatórios Preenchidos
                </CardTitle>
                <CardDescription>Visualize os relatórios enviados pelos professores</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/relatorios">
                  <Button className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Ver Todos os Relatórios
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Teacher View */}
        {user?.perfil !== 'tecnico' && (
          <>
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
                </CardContent>
              </Card>
            </div>

            {/* Relatório de Uso de Laboratório */}
            <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Relatório de Uso de Laboratório
                </CardTitle>
                <CardDescription>Preencha o checklist após usar a sala</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Novo Relatório
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Relatório de Uso de Laboratório</DialogTitle>
                      <DialogDescription>
                        Preencha o formulário com as informações do uso da sala
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReportSubmit} className="space-y-6">
                      {/* Tópico 1: Observações Gerais */}
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-sm text-blue-900">
                          Tópico 1: Observações Gerais
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="observacoes">Observações Gerais</Label>
                          <Textarea
                            id="observacoes"
                            placeholder="Descreva o estado da sala, equipamentos utilizados, incidentes, etc."
                            value={reportData.observacoes}
                            onChange={(e) =>
                              setReportData({ ...reportData, observacoes: e.target.value })
                            }
                            className="min-h-24"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="materiais">Materiais Utilizados</Label>
                          <Textarea
                            id="materiais"
                            placeholder="Liste os materiais e equipamentos utilizados durante a aula/prática"
                            value={reportData.materiaisUtilizados}
                            onChange={(e) =>
                              setReportData({ ...reportData, materiaisUtilizados: e.target.value })
                            }
                            className="min-h-20"
                          />
                        </div>
                      </div>

                      {/* Tópico 2: Consumo de Reagentes Controlados */}
                      <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-sm text-amber-900">
                          Tópico 2: Consumo de Reagentes Controlados pela PF
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                              id="data"
                              type="date"
                              value={reportData.data}
                              onChange={(e) =>
                                setReportData({ ...reportData, data: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tipoUso">Ensino/Pesquisa</Label>
                            <select
                              id="tipoUso"
                              value={reportData.tipoUso}
                              onChange={(e) =>
                                setReportData({ ...reportData, tipoUso: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background"
                            >
                              <option value="Ensino">Ensino</option>
                              <option value="Pesquisa">Pesquisa</option>
                              <option value="Ambos">Ambos</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="residuo">Resíduo/Substância</Label>
                            <Input
                              id="residuo"
                              placeholder="Ex: HCl, NaOH, etc."
                              value={reportData.residuo}
                              onChange={(e) =>
                                setReportData({ ...reportData, residuo: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="concentracao">Concentração</Label>
                            <Input
                              id="concentracao"
                              placeholder="Ex: 1M, 10%, etc."
                              value={reportData.concentracao}
                              onChange={(e) =>
                                setReportData({ ...reportData, concentracao: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assinatura">Assinatura do Responsável</Label>
                          <Input
                            id="assinatura"
                            placeholder="Digite seu nome completo"
                            value={reportData.assinatura}
                            onChange={(e) =>
                              setReportData({ ...reportData, assinatura: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowReportModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Enviar Relatório
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}