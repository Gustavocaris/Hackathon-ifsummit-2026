import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function Unauthorized() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Button
          onClick={() => setLocation('/dashboard')}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
