import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Beaker, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      setLocation('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    try {
      await login(demoEmail, '123456');
      toast.success('Login realizado com sucesso!');
      setLocation('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <Beaker className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LabSys</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Laboratórios</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Faça Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Contas de demonstração:
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => handleDemoLogin('docente@lab.com')}
                  disabled={loading}
                >
                  👨‍🏫 Docente (docente@lab.com)
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => handleDemoLogin('tecnico@lab.com')}
                  disabled={loading}
                >
                  👨‍🔧 Técnico (tecnico@lab.com)
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => handleDemoLogin('admin@lab.com')}
                  disabled={loading}
                >
                  👨‍💼 Admin (admin@lab.com)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Senha: <code className="bg-muted px-2 py-1 rounded">123456</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema de gestão de laboratórios acadêmicos
        </p>
      </div>
    </div>
  );
}
