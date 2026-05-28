import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// 1. COLOQUE SUAS FOTOS EM: client/public/images/
//    e ajuste os caminhos abaixo:
// ─────────────────────────────────────────────
const SLIDES = [
  {
    url: '/images/img-ifpr-1.jpg',   // ← troque pelo nome do seu arquivo
    caption: 'Campus Cascavel',
    sub: 'Instituto Federal do Paraná',
  },
  {
    url: '/images/img-ifpr-2.jpg',   // ← troque pelo nome do seu arquivo
    caption: 'Estrutura Moderna',
    sub: 'Infraestrutura de excelência',
  },
  {
    url: '/images/img-ifpr-3.jpg',   // ← troque pelo nome do seu arquivo
    caption: 'Laboratórios Equipados',
    sub: 'Ensino prático e tecnológico',
  },
];

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
  'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)',
  'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
];

const CAPTCHA_TTL = 30; // segundos

function generateCaptcha() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function Login() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const [captchaTimer, setCaptchaTimer] = useState(CAPTCHA_TTL);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuthStore();
  const [, navigate] = useLocation();

useEffect(() => {
  const interval = setInterval(() => {
    const next = (currentRef.current + 1) % SLIDES.length;
    setPrev(currentRef.current);
    setCurrent(next);
    currentRef.current = next;   // atualiza sem re-render
  }, 3000);
  return () => clearInterval(interval);
}, []); // roda uma vez só, nunca recria

  // Captcha countdown + renovação automática a cada 30s
  useEffect(() => {
    setCaptchaTimer(CAPTCHA_TTL);
    timerRef.current = setInterval(() => {
      setCaptchaTimer(t => {
        if (t <= 1) {
          refreshCaptcha();
          return CAPTCHA_TTL;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [captchaCode]);

  function refreshCaptcha() {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  }

  function goTo(idx: number) {
    if (idx === current || animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 700);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');

    if (captchaInput !== captchaCode.slice(0, 2)) {
      setLoginError('Código de verificação incorreto.');
      refreshCaptcha();
      return;
    }

    setLoginLoading(true);
    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/agenda');
    } catch (err: any) {
      const msg = err?.message || 'Erro ao realizar login.';
      setLoginError(msg);
      toast.error(msg);
      refreshCaptcha();
    } finally {
      setLoginLoading(false);
    }
  }

  // Percentual restante para o anel do timer
  const timerPct = captchaTimer / CAPTCHA_TTL;
  const radius = 10;
  const circ = 2 * Math.PI * radius;
  const dash = circ * timerPct;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Outfit', 'DM Sans', sans-serif",
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* ── Lado esquerdo: Slideshow ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {SLIDES.map((slide, i) => {
          const isActive = i === current;
          const isPrev = i === prev;
          const hasError = imgErrors[i];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                transition: 'opacity 0.7s ease, transform 0.7s ease',
                opacity: isActive ? 1 : isPrev ? 0 : 0,
                transform: isActive ? 'scale(1)' : isPrev ? 'scale(1.04)' : 'scale(1)',
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
              }}
            >
              {hasError ? (
                <div style={{ position: 'absolute', inset: 0, background: FALLBACK_GRADIENTS[i] }} />
              ) : (
                <img
                  src={slide.url}
                  alt={slide.caption}
                  onError={() => setImgErrors(e => ({ ...e, [i]: true }))}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)',
                }}
              />
            </div>
          );
        })}

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🎓</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', lineHeight: 1.2 }}>IFPR</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.5px', fontWeight: 500 }}>Instituto Federal do Paraná</div>
          </div>
        </div>

        {/* Caption + indicadores */}
        <div style={{ position: 'absolute', bottom: 60, left: 40, right: 40, zIndex: 10 }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            {SLIDES[current].sub}
          </div>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 24, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {SLIDES[current].caption}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Lado direito: Login ── */}
      <div style={{
        width: 480, flexShrink: 0,
        background: 'var(--color-background-primary, #fff)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 52px', position: 'relative',
      }}>
        {/* Linha decorativa */}
        <div style={{
          position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3,
          background: 'linear-gradient(to bottom, transparent, #16a34a, transparent)', borderRadius: 2,
        }} />

        {/* Logo no topo do formulário */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/images/logo-ifslot.png" 
            alt="Logo" 
            style={{ height: 60, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Cabeçalho */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', letterSpacing: '0.5px' }}>
              IFSlot — Gestão de Laboratórios
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 8px', color: 'var(--color-text-primary, #111)', lineHeight: 1.15 }}>
            Bem-vindo de volta
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary, #6b7280)' }}>
            Acesse com suas credenciais institucionais
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* E-mail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #111)' }}>
              E-mail institucional
            </Label>
            <Input
              id="email" type="email" placeholder="seunome@ifpr.edu.br"
              value={email} onChange={e => setEmail(e.target.value)} required
              style={{ height: 46, borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-border-tertiary, #e5e7eb)', background: 'var(--color-background-secondary, #f9fafb)' }}
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #111)' }}>Senha</Label>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#16a34a', fontWeight: 600, padding: 0 }}>
                Esqueceu a senha?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={{ height: 46, borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-border-tertiary, #e5e7eb)', background: 'var(--color-background-secondary, #f9fafb)', paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary, #9ca3af)', display: 'flex', alignItems: 'center', padding: 0,
              }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Captcha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #111)' }}>
              Código de verificação
            </Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

              {/* Bloco do código */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0,
                background: 'var(--color-background-secondary, #f9fafb)',
                border: '1.5px solid var(--color-border-tertiary, #e5e7eb)',
                borderRadius: 10, padding: '0 10px', height: 36, minWidth: 90,
              }}>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13, fontWeight: 800, letterSpacing: 3,
                  color: 'var(--color-text-primary, #111)', userSelect: 'none',
                }}>
                  {captchaCode.slice(0, 2)}
                </span>

                {/* Anel timer */}
                <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
                  <svg width="24" height="24" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="12" cy="12" r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r={radius} fill="none"
                      stroke={captchaTimer <= 8 ? '#dc2626' : '#16a34a'} strokeWidth="2.5"
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <span style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, color: captchaTimer <= 8 ? '#dc2626' : 'var(--color-text-secondary, #6b7280)',
                  }}>{captchaTimer}</span>
                </div>

                <button type="button" onClick={refreshCaptcha} title="Gerar novo código"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary, #9ca3af)', padding: 0, display: 'flex' }}>
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Input */}
              <Input
                type="text" placeholder="Digite o código" maxLength={6}
                value={captchaInput} onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))} required
                style={{ height: 36, flex: 1, borderRadius: 10, fontSize: 13, letterSpacing: 3, textAlign: 'center', border: '1.5px solid var(--color-border-tertiary, #e5e7eb)', background: 'var(--color-background-secondary, #f9fafb)' }}
              />
            </div>
          </div>

          {/* Erro de login */}
          {loginError && (
            <div style={{
              fontSize: 13, color: '#dc2626', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8,
              padding: '8px 12px', textAlign: 'center',
            }}>
              {loginError}
            </div>
          )}

          {/* Botão entrar */}
          <Button
            type="submit"
            disabled={loginLoading}
            style={{
              height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: loginLoading ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px',
              boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
              opacity: loginLoading ? 0.7 : 1,
            }}
          >
            {loginLoading ? 'Entrando...' : 'Entrar no sistema'}
          </Button>

          {/* Link discreto para o site do IFPR */}
          <a
            href="https://ifpr.edu.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 12, color: 'var(--color-text-secondary, #9ca3af)',
              textDecoration: 'none', paddingTop: 2,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#16a34a')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary, #9ca3af)')}
          >
            <ExternalLink size={12} />
            Acessar site oficial do IFPR
          </a>
        </form>

        {/* Rodapé */}
        <div style={{
          position: 'absolute', bottom: 28, left: 52, right: 52,
          textAlign: 'center', fontSize: 11,
          color: 'var(--color-text-secondary, #9ca3af)', lineHeight: 1.6,
        }}>
          © {new Date().getFullYear()} Instituto Federal do Paraná · Campus Cascavel
          <br />Acesso restrito a usuários autorizados
        </div>
      </div>
    </div>
  );
}