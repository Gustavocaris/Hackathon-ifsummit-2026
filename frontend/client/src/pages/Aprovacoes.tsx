import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Calendar, Users, Beaker } from 'lucide-react';

export default function Aprovacoes() {
  const { getPendingReservations, updateReservationStatus, materials } = useDataStore();
  const { user } = useAuthStore();
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const pendingReservations = getPendingReservations();

  // Only technicians can see this page
  if (user?.perfil !== 'tecnico') {
    return (
      <DashboardLayout title="Aprovações">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Apenas técnicos podem acessar esta página
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleApprove = (reservationId: string) => {
    setIsApproving(true);
    setTimeout(() => {
      updateReservationStatus(reservationId, 'aprovada');
      toast.success('Reserva aprovada com sucesso!');
      setIsApproving(false);
    }, 500);
  };

  const handleReject = (reservationId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }

    setIsApproving(true);
    setTimeout(() => {
      updateReservationStatus(reservationId, 'reprovada', rejectionReason);
      toast.success('Reserva rejeitada');
      setSelectedReservation(null);
      setRejectionReason('');
      setIsApproving(false);
    }, 500);
  };

  const checkMaterialAvailability = (reservationId: string) => {
    const reservation = pendingReservations.find((r) => r.id === reservationId);
    if (!reservation) return [];

    return reservation.materiais.map((mat) => {
      const material = materials.find((m) => m.id === mat.material_id);
      if (!material) return { ...mat, available: false, shortage: 0 };

      const available = material.quantidade >= mat.quantidade;
      const shortage = available ? 0 : mat.quantidade - material.quantidade;

      return { ...mat, available, shortage };
    });
  };

  return (
    <DashboardLayout title="Aprovação de Reservas">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reservas Pendentes</h2>
          <p className="text-muted-foreground mt-1">
            Total de {pendingReservations.length} reserva(s) aguardando aprovação
          </p>
        </div>

        {/* Pending Reservations */}
        {pendingReservations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhuma reserva pendente</p>
              <p className="text-sm text-muted-foreground">Todas as reservas foram processadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingReservations.map((reservation) => {
              const materialStatus = checkMaterialAvailability(reservation.id);
              const hasAllMaterials = materialStatus.every((m) => m.available);

              return (
                <Card key={reservation.id} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{reservation.disciplina}</h3>
                            <Badge variant="secondary">Pendente</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Prof. {reservation.docente.nome}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
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
                          {reservation.inicio} - {reservation.fim}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {reservation.quantidade_alunos} alunos
                        </div>
                      </div>

                      {/* Materials Check */}
                      {reservation.materiais.length > 0 && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Verificação de Materiais:
                          </p>
                          <div className="space-y-2">
                            {materialStatus.map((mat) => (
                              <div
                                key={mat.material_id}
                                className={`flex items-center justify-between p-2 rounded border ${
                                  mat.available
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{mat.material.nome}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Solicitado: {mat.quantidade} {mat.material.unidade}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {mat.available ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-xs font-medium">OK</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <XCircle className="w-4 h-4" />
                                      <span className="text-xs font-medium">
                                        Faltam {mat.shortage}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observations */}
                      {reservation.observacoes && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Observações:
                          </p>
                          <p className="text-sm text-foreground">{reservation.observacoes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <Button
                          onClick={() => handleApprove(reservation.id)}
                          disabled={!hasAllMaterials || isApproving}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSelectedReservation(reservation.id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Reserva</DialogTitle>
                              <DialogDescription>
                                Informe o motivo da rejeição. O professor será notificado.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reason">Motivo da Rejeição *</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Ex: Laboratório indisponível no horário solicitado..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="resize-none"
                                  rows={4}
                                />
                              </div>

                              <div className="flex gap-3 justify-end">
                                <Button variant="outline">Cancelar</Button>
                                <Button
                                  onClick={() =>
                                    handleReject(selectedReservation || '')
                                  }
                                  disabled={isApproving}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {!hasAllMaterials && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                            <AlertCircle className="w-4 h-4" />
                            Materiais insuficientes
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
