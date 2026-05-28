import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserFormData {
  nome: string;
  email: string;
  senha: string;
  departamento: string;
  materia?: string;
  laboratorios?: string[];
  perfil: 'docente' | 'tecnico' | 'admin';
  foto?: string;
}

export default function Admin() {
  const { laboratories } = useDataStore();
  const [users, setUsers] = useState<any[]>([
    {
      id: '1',
      nome: 'João Santos',
      email: 'joao@lab.com',
      departamento: 'Ciências Exatas',
      materia: 'Química Orgânica',
      perfil: 'docente',
      criado_em: '2026-01-15',
      foto: null,
    },
    {
      id: '2',
      nome: 'Lucas Silva',
      email: 'lucas@lab.com',
      departamento: 'Ciências Biológicas',
      materia: 'Biologia Molecular',
      perfil: 'docente',
      criado_em: '2026-01-20',
      foto: null,
    },
    {
      id: '3',
      nome: 'Técnico Admin',
      email: 'tecnico@lab.com',
      departamento: 'Infraestrutura',
      laboratorios: ['lab-quimica', 'lab-biologia'],
      perfil: 'tecnico',
      criado_em: '2026-01-10',
      foto: null,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPerfil, setSelectedPerfil] = useState<'docente' | 'tecnico' | 'admin'>('docente');
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    senha: '',
    departamento: '',
    materia: '',
    laboratorios: [],
    perfil: 'docente',
  });
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasMinLength && hasSpecialChar;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '', color: '' };
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let level = 0;
    if (hasMinLength) level++;
    if (hasSpecialChar) level++;
    if (hasUpperCase) level++;
    if (hasNumber) level++;

    const strengthMap = {
      0: { text: 'Muito fraca', color: 'text-red-600' },
      1: { text: 'Fraca', color: 'text-orange-600' },
      2: { text: 'Média', color: 'text-yellow-600' },
      3: { text: 'Forte', color: 'text-blue-600' },
      4: { text: 'Muito forte', color: 'text-green-600' },
    };

    return { level, ...strengthMap[level as keyof typeof strengthMap] };
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData({ ...formData, foto: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData({ ...formData, foto: undefined });
  };

  const handleAddUser = () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.departamento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!validatePassword(formData.senha)) {
      toast.error('Senha deve ter no mínimo 8 caracteres e 1 caractere especial');
      return;
    }

    if (selectedPerfil === 'tecnico' && selectedLabs.length === 0) {
      toast.error('Selecione pelo menos um laboratório para o técnico');
      return;
    }

    if (selectedPerfil === 'docente' && !formData.materia) {
      toast.error('Preencha a matéria para o docente');
      return;
    }

    const newUser = {
      id: Math.random().toString(),
      ...formData,
      perfil: selectedPerfil,
      laboratorios: selectedPerfil === 'tecnico' ? selectedLabs : undefined,
      criado_em: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, newUser]);
    toast.success(`${selectedPerfil.charAt(0).toUpperCase() + selectedPerfil.slice(1)} criado com sucesso!`);
    
    // Reset form
    setFormData({
      nome: '',
      email: '',
      senha: '',
      departamento: '',
      materia: '',
      laboratorios: [],
      perfil: 'docente',
      foto: undefined,
    });
    setSelectedLabs([]);
    setPhotoPreview(null);
    setOpenDialog(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('Usuário removido com sucesso');
  };

  const handlePefilChange = (newPerfil: 'docente' | 'tecnico' | 'admin') => {
    setSelectedPerfil(newPerfil);
    setFormData({ ...formData, perfil: newPerfil });
    setSelectedLabs([]);
  };

  const toggleLaboratory = (labId: string) => {
    setSelectedLabs((prev) =>
      prev.includes(labId) ? prev.filter((l) => l !== labId) : [...prev, labId]
    );
  };

  const filteredUsers = {
    docentes: users.filter((u) => u.perfil === 'docente'),
    tecnicos: users.filter((u) => u.perfil === 'tecnico'),
    admins: users.filter((u) => u.perfil === 'admin'),
  };

  const renderUserTable = (userList: any[]) => {
    if (userList.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {userList.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              {user.foto ? (
                <img
                  src={user.foto}
                  alt={user.nome}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{user.nome}</h3>
                  <Badge variant="outline">{user.email}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Departamento:</span> {user.departamento}
                  </div>
                  {user.materia && (
                    <div>
                      <span className="font-medium">Matéria:</span> {user.materia}
                    </div>
                  )}
                  {user.laboratorios && (
                    <div>
                      <span className="font-medium">Labs:</span>{' '}
                      {user.laboratorios
                        .map((labId: string) => {
                          const lab = laboratories.find((l) => l.id === labId);
                          return lab?.nome || labId;
                        })
                        .join(', ')}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Criado em:</span> {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const passwordStrength = getPasswordStrength(formData.senha);

  return (
    <DashboardLayout title="Gestão de Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestão de Usuários</h2>
            <p className="text-muted-foreground mt-1">
              Gerencie docentes, técnicos e administradores do sistema
            </p>
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar um novo acesso ao sistema
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Photo Upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-blue-200"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-medium">Selecionar Foto</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Máximo 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Perfil Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Tipo de Usuário</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['docente', 'tecnico', 'admin'] as const).map((perfil) => (
                      <button
                        key={perfil}
                        onClick={() => handlePefilChange(perfil)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedPerfil === perfil
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-border hover:border-blue-300'
                        }`}
                      >
                        <p className="font-medium capitalize text-sm">{perfil}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: João Santos"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail Institucional *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ex: joao@lab.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Input
                      id="departamento"
                      placeholder="Ex: Ciências Exatas"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    />
                  </div>

                  {selectedPerfil === 'docente' && (
                    <div>
                      <Label htmlFor="materia">Matéria *</Label>
                      <Input
                        id="materia"
                        placeholder="Ex: Química Orgânica"
                        value={formData.materia}
                        onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres + 1 caractere especial"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {formData.senha && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.level === 0
                                ? 'w-0'
                                : passwordStrength.level === 1
                                ? 'w-1/4 bg-red-500'
                                : passwordStrength.level === 2
                                ? 'w-1/2 bg-yellow-500'
                                : passwordStrength.level === 3
                                ? 'w-3/4 bg-blue-500'
                                : 'w-full bg-green-500'
                            }`}
                          />
                        </div>
                        <span className={`text-sm font-medium ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {formData.senha.length >= 8 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>Mínimo 8 caracteres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.senha) ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>1 caractere especial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Laboratories for Technicians */}
                {selectedPerfil === 'tecnico' && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Laboratórios Responsáveis *
                    </Label>
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
                      {laboratories.map((lab) => (
                        <div key={lab.id} className="flex items-center gap-3">
                          <Checkbox
                            id={lab.id}
                            checked={selectedLabs.includes(lab.id)}
                            onCheckedChange={() => toggleLaboratory(lab.id)}
                          />
                          <Label htmlFor={lab.id} className="cursor-pointer font-normal">
                            {lab.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Info */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Requisitos de Segurança:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Senha com mínimo 8 caracteres</li>
                        <li>Pelo menos 1 caractere especial (!@#$%^&*)</li>
                        <li>Recomendado: Incluir números e letras maiúsculas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={!validatePassword(formData.senha)}
                    className="flex-1"
                  >
                    Criar Usuário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="docentes" className="w-full">
          <TabsList>
            <TabsTrigger value="docentes">
              Docentes ({filteredUsers.docentes.length})
            </TabsTrigger>
            <TabsTrigger value="tecnicos">
              Técnicos ({filteredUsers.tecnicos.length})
            </TabsTrigger>
            <TabsTrigger value="admins">
              Admins ({filteredUsers.admins.length})
            </TabsTrigger>
          </TabsList>

          {/* Docentes Tab */}
          <TabsContent value="docentes" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Professores</CardTitle>
                <CardDescription>
                  Gerencie os acessos dos professores ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUserTable(filteredUsers.docentes)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Técnicos Tab */}
          <TabsContent value="tecnicos" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Técnicos de Laboratório</CardTitle>
                <CardDescription>
                  Gerencie os acessos dos técnicos e suas responsabilidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUserTable(filteredUsers.tecnicos)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Administradores</CardTitle>
                <CardDescription>
                  Gerencie os acessos dos administradores do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUserTable(filteredUsers.admins)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}