import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Material } from '@/types';

export default function Estoque() {
  const { materials, addMaterial, updateMaterialQuantity } = useDataStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    unidade: '',
    validade: '',
    lote: '',
    estoque_minimo: '',
    categoria: 'reagente' as const,
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || !filterCategory || m.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalMaterials = filteredMaterials.filter((m) => m.quantidade <= m.estoque_minimo);
  const lowStockMaterials = filteredMaterials.filter(
    (m) => m.quantidade > m.estoque_minimo && m.quantidade <= m.estoque_minimo * 1.5
  );

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.quantidade || !formData.unidade) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newMaterial: Material = {
      id: `mat_${Date.now()}`,
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade),
      unidade: formData.unidade,
      validade: formData.validade || undefined,
      lote: formData.lote || undefined,
      estoque_minimo: parseInt(formData.estoque_minimo) || 0,
      categoria: formData.categoria,
    };

    addMaterial(newMaterial);
    toast.success('Material adicionado com sucesso!');
    setIsOpen(false);
    setFormData({
      nome: '',
      quantidade: '',
      unidade: '',
      validade: '',
      lote: '',
      estoque_minimo: '',
      categoria: 'reagente',
    });
  };

  const handleResetFilter = () => {
    setFilterCategory('all');
  };

  const getStockStatus = (material: Material) => {
    if (material.quantidade <= material.estoque_minimo) {
      return { label: 'Crítico', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    }
    if (material.quantidade <= material.estoque_minimo * 1.5) {
      return { label: 'Baixo', color: 'bg-amber-100 text-amber-700', icon: TrendingUp };
    }
    return { label: 'OK', color: 'bg-green-100 text-green-700', icon: Package };
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      reagente: '🧪 Reagente',
      equipamento: '⚙️ Equipamento',
      vidraria: '🧬 Vidraria',
    };
    return labels[category] || category;
  };

  return (
    <DashboardLayout title="Controle de Estoque">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Inventário de Materiais</h2>
            <p className="text-muted-foreground mt-1">
              Total de {materials.length} material(is)
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Material</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo material para o estoque
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Material *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Ácido Clorídrico"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Input
                      id="unidade"
                      placeholder="Ex: mL, g, unidade"
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimo">Estoque Mínimo</Label>
                    <Input
                      id="minimo"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.estoque_minimo}
                      onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value as any })}>
                      <SelectTrigger id="categoria">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reagente">Reagente</SelectItem>
                        <SelectItem value="equipamento">Equipamento</SelectItem>
                        <SelectItem value="vidraria">Vidraria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validade">Validade</Label>
                    <Input
                      id="validade"
                      type="date"
                      value={formData.validade}
                      onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      placeholder="Ex: L001"
                      value={formData.lote}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Adicionar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Materiais</p>
                  <p className="text-3xl font-bold mt-2">{materials.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">{criticalMaterials.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                  <p className="text-3xl font-bold mt-2 text-amber-600">{lowStockMaterials.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Buscar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filterCategory || 'all'} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="reagente">Reagentes</SelectItem>
              <SelectItem value="equipamento">Equipamentos</SelectItem>
              <SelectItem value="vidraria">Vidraria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Materials Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Materiais em Estoque</CardTitle>
            <CardDescription>{filteredMaterials.length} material(is) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Material</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Quantidade</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Mínimo</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => {
                    const status = getStockStatus(material);
                    const StatusIcon = status.icon;

                    return (
                      <tr key={material.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium">{material.nome}</p>
                          {material.lote && (
                            <p className="text-xs text-muted-foreground">Lote: {material.lote}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{getCategoryLabel(material.categoria)}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold">
                            {material.quantidade} {material.unidade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {material.estoque_minimo} {material.unidade}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`p-2 rounded-lg ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium">{status.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {material.validade
                            ? new Date(material.validade).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
