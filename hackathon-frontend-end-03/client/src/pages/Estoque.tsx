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
import { Plus, Package, AlertTriangle, TrendingUp, FileDown } from 'lucide-react';
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

  const generatePDFReport = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Estoque</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1e40af; }
          .header { margin-bottom: 30px; text-align: center; }
          .stats { display: flex; gap: 20px; margin-bottom: 30px; }
          .stat-box { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .stat-box h3 { margin: 0 0 10px 0; }
          .stat-box p { margin: 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: bold; }
          tr:hover { background-color: #f9fafb; }
          .critical { color: #dc2626; }
          .low { color: #ea580c; }
          .ok { color: #16a34a; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório de Estoque de Laboratórios</h1>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="stats">
          <div class="stat-box">
            <h3>Total de Materiais</h3>
            <p>${materials.length}</p>
          </div>
          <div class="stat-box">
            <h3>Estoque Crítico</h3>
            <p class="critical">${criticalMaterials.length}</p>
          </div>
          <div class="stat-box">
            <h3>Estoque Baixo</h3>
            <p class="low">${lowStockMaterials.length}</p>
          </div>
        </div>

        <h2>Detalhamento de Materiais</h2>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Estoque Mínimo</th>
              <th>Status</th>
              <th>Validade</th>
              <th>Lote</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map((material) => {
              let statusClass = 'ok';
              let statusText = 'OK';
              if (material.quantidade <= material.estoque_minimo) {
                statusClass = 'critical';
                statusText = 'CRÍTICO';
              } else if (material.quantidade <= material.estoque_minimo * 1.5) {
                statusClass = 'low';
                statusText = 'BAIXO';
              }
              return `
                <tr>
                  <td>${material.nome}</td>
                  <td>${material.categoria}</td>
                  <td>${material.quantidade}</td>
                  <td>${material.unidade}</td>
                  <td>${material.estoque_minimo}</td>
                  <td><span class="${statusClass}">${statusText}</span></td>
                  <td>${material.validade ? new Date(material.validade).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>${material.lote || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo sistema EduManager</p>
          <p>Para apresentação à diretoria</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Relatório gerado e baixado com sucesso!');
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={generatePDFReport}
            >
              <FileDown className="w-4 h-4" />
              Gerar Relatório
            </Button>
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