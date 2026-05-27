import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Calendar, Beaker, Users, Clock } from 'lucide-react';
import { Reservation } from '@/types';

export default function Reservas() {
  const { getReservationsByDocente, laboratories, materials, createReservation } = useDataStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const myReservations = user ? getReservationsByDocente(user.id) : [];

  const [formData, setFormData] = useState({
    laboratorio_id: '',
    data: '',
    inicio: '',
    fim: '',
    disciplina: '',
    turma: '',
    quantidade_alunos: '',
    observacoes: '',
    materiais: [] as Array<{ material_id: string; quantidade: number }>,
  });

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      materiais: [...formData.materiais, { material_id: '', quantidade: 0 }],
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      materiais: formData.materiais.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.laboratorio_id || !formData.data || !formData.inicio || !formData.fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newReservation: Reservation = {
      id: `res_${Date.now()}`,
      laboratorio_id: formData.laboratorio_id,
      laboratorio: laboratories.find((l) => l.id === formData.laboratorio_id)!,
      docente_id: user!.id,
      docente: user!,
      data: formData.data,
      inicio: formData.inicio,
      fim: formData.fim,
      disciplina: formData.disciplina,
      turma: formData.turma,
      quantidade_alunos: parseInt(formData.quantidade_alunos) || 0,
      status: 'pendente',
      observacoes: formData.observacoes,
      materiais: formData.materiais
        .filter((m) => m.material_id)
        .map((m) => ({
          material_id: m.material_id,
          material: materials.find((mat) => mat.id === m.material_id)!,
          quantidade: m.quantidade,
          disponivel: true,
        })),
      data_criacao: new Date().toISOString().split('T')[0],
    };

    createReservation(newReservation);
    toast.success('Reserva criada com sucesso! Aguardando aprovação do técnico.');
    setIsOpen(false);
    setFormData({
      laboratorio_id: '',
      data: '',
      inicio: '',
      fim: '',
      disciplina: '',
      turma: '',
      quantidade_alunos: '',
      observacoes: '',
      materiais: [],
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: { variant: 'secondary', label: 'Pendente' },
      aprovada: { variant: 'default', label: 'Aprovada', className: 'bg-green-600' },
      reprovada: { variant: 'destructive', label: 'Reprovada' },
      ajuste_solicitado: { variant: 'secondary', label: 'Ajuste Solicitado' },
    };
    const config = variants[status] || variants.pendente;
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Reservas de Laboratório">
      <div className="space-y-6">
        {/* Header with action button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Minhas Reservas</h2>
            <p className="text-muted-foreground mt-1">
              Total de {myReservations.length} reserva(s)
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Reserva</DialogTitle>
                <DialogDescription>
                  Preencha os dados para reservar um laboratório
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Laboratório */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lab">Laboratório *</Label>
                    <Select value={formData.laboratorio_id} onValueChange={(value) => setFormData({ ...formData, laboratorio_id: value })}>
                      <SelectTrigger id="lab">
                        <SelectValue placeholder="Selecione um laboratório" />
                      </SelectTrigger>
                      <SelectContent>
                        {laboratories.filter((l) => l.status === 'disponivel').map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inicio">Horário Inicial *</Label>
                    <Input
                      id="inicio"
                      type="time"
                      value={formData.inicio}
                      onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fim">Horário Final *</Label>
                    <Input
                      id="fim"
                      type="time"
                      value={formData.fim}
                      onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Disciplina e Turma */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina</Label>
                    <Input
                      id="disciplina"
                      placeholder="Ex: Química Geral"
                      value={formData.disciplina}
                      onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turma">Turma</Label>
                    <Input
                      id="turma"
                      placeholder="Ex: A1"
                      value={formData.turma}
                      onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                    />
                  </div>
                </div>

                {/* Quantidade de alunos */}
                <div className="space-y-2">
                  <Label htmlFor="alunos">Quantidade de Alunos</Label>
                  <Input
                    id="alunos"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={formData.quantidade_alunos}
                    onChange={(e) => setFormData({ ...formData, quantidade_alunos: e.target.value })}
                  />
                </div>

                {/* Materiais */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Materiais Necessários</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMaterial}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {formData.materiais.map((mat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Select
                        value={mat.material_id}
                        onValueChange={(value) => {
                          const newMateriais = [...formData.materiais];
                          newMateriais[idx].material_id = value;
                          setFormData({ ...formData, materiais: newMateriais });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        className="w-20"
                        value={mat.quantidade}
                        onChange={(e) => {
                          const newMateriais = [...formData.materiais];
                          newMateriais[idx].quantidade = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, materiais: newMateriais });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMaterial(idx)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    placeholder="Informações adicionais sobre a reserva..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Criar Reserva
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reservations list */}
        {myReservations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhuma reserva criada ainda</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Criar Primeira Reserva
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myReservations.map((reservation) => (
              <Card key={reservation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{reservation.disciplina}</h3>
                        {getStatusBadge(reservation.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Beaker className="w-4 h-4" />
                          {reservation.laboratorio.nome}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(reservation.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {reservation.inicio} - {reservation.fim}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {reservation.quantidade_alunos} alunos
                        </div>
                      </div>

                      {reservation.materiais.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Materiais:</p>
                          <div className="flex flex-wrap gap-2">
                            {reservation.materiais.map((mat) => (
                              <Badge key={mat.material_id} variant="secondary" className="text-xs">
                                {mat.material.nome} ({mat.quantidade} {mat.material.unidade})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {reservation.observacoes && (
                        <p className="text-sm text-muted-foreground mt-3">
                          <span className="font-medium">Observações:</span> {reservation.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
