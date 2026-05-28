import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookOpen, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showAuth, setShowAuth] = useState(false);
  const { login } = useAuthStore();
  const [, setLocation] = useLocation();

  // Generate new auth code every 30 seconds
  useEffect(() => {
    const generateNewCode = () => {
      setGeneratedCode(Math.floor(Math.random() * 101)); // 0-100
      setTimeLeft(30);
    };

    generateNewCode();
    const interval = setInterval(generateNewCode, 30000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      toast.error('Preencha email e senha');
      return;
    }

    if (!authCode) {
      toast.error('Preencha o código do autenticador');
      return;
    }

    if (parseInt(authCode) !== generatedCode) {
      toast.error(`Código inválido. Código correto: ${generatedCode}`);
      setAuthCode('');
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-6 border border-white/30 shadow-2xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EduManager</h1>
          <p className="text-white/80 text-lg font-medium">Gestão e Reserva de Laboratórios</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 backdrop-blur-md bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription className="text-base">
              Acesse sua conta com segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-semibold">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              {/* Authenticator Field */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Label htmlFor="authCode" className="text-sm font-semibold">
                    <ShieldAlert className="w-4 h-4 inline mr-2" />
                    Código do Autenticador
                  </Label>
                  <div className="text-xs font-mono bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-full text-indigo-700 font-bold">
                    {generatedCode}
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="authCode"
                    type="text"
                    placeholder="Digite o código acima"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value.slice(0, 3))}
                    required
                    disabled={loading}
                    maxLength={3}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-center text-2xl font-mono tracking-widest"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>Código gerado automaticamente</span>
                  <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-600'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-11 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  'Entrar com Segurança'
                )}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAuth(!showAuth)}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-semibold mb-3 transition-colors"
              >
                {showAuth ? '✕ Ocultar' : '+ Contas de Demonstração'}
              </button>

              {showAuth && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <p className="text-xs text-gray-500 text-center mb-3 font-medium">
                    Clique para fazer login com uma conta demo
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-sm border-indigo-200 hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDemoLogin('joao@lab.com')}
                    disabled={loading}
                  >
                    👨‍🏫 Prof. João
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm border-indigo-200 hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDemoLogin('lucas@lab.com')}
                    disabled={loading}
                  >
                    👨‍🏫 Prof. Lucas
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm border-indigo-200 hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDemoLogin('tecnico@lab.com')}
                    disabled={loading}
                  >
                    👨‍🔧 Técnico
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm border-indigo-200 hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDemoLogin('admin@lab.com')}
                    disabled={loading}
                  >
                    👨‍💼 Admin
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Senha: <code className="bg-gray-100 px-2 py-1 rounded font-mono">123456</code>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            Sistema seguro de gestão de laboratórios acadêmicos
          </p>
          <p className="text-white/50 text-xs mt-2">
            © 2026 EduManager. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}