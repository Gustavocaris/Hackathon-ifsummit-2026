# Design Brainstorm - Lab Management System

## Abordagem Selecionada: Modern Scientific Minimalism

Escolhi uma abordagem que combina **minimalismo científico** com **clareza operacional**. Este é um sistema crítico para gestão de laboratórios, portanto o design deve ser:

- **Limpo e intuitivo**: Reduz fricção na navegação
- **Hierárquico e organizado**: Prioriza informações críticas
- **Profissional e confiável**: Transmite competência
- **Responsivo e acessível**: Funciona em qualquer dispositivo

---

## Design Philosophy

### Design Movement
**Modern Scientific Minimalism** - Inspirado em interfaces de laboratório modernas, dashboards científicos e sistemas de gestão empresarial de alto padrão.

### Core Principles

1. **Clareza Radical**: Cada elemento tem propósito. Sem decoração desnecessária.
2. **Hierarquia Visual Forte**: Tamanho, cor e espaçamento guiam o olhar para ações críticas.
3. **Eficiência Operacional**: Fluxos de trabalho otimizados para reduzir cliques e erros.
4. **Confiança através da Consistência**: Padrões visuais repetidos criam familiaridade.

### Color Philosophy

**Paleta Principal:**
- **Azul Profundo (#1E40AF)**: Confiança, autoridade, ciência
- **Cinza Neutro (#6B7280)**: Equilíbrio, profissionalismo
- **Verde Sucesso (#10B981)**: Aprovação, disponibilidade
- **Âmbar Alerta (#F59E0B)**: Atenção, estoque baixo
- **Vermelho Crítico (#EF4444)**: Bloqueio, indisponibilidade
- **Branco Limpo (#FFFFFF)**: Espaço respirável
- **Cinza Fundo (#F9FAFB)**: Suporte neutro

**Raciocínio**: Cores baseadas em semântica clara (verde=ok, vermelho=problema) reduzem tempo de compreensão e erros operacionais.

### Layout Paradigm

**Sidebar + Main Content** com três camadas:

1. **Sidebar Fixa (esquerda)**: Navegação principal, sempre visível
2. **Header Dinâmico**: Breadcrumbs, notificações, perfil do usuário
3. **Conteúdo Principal**: Grid responsivo com cards, tabelas e formulários

**Estrutura não centralizada**: Aproveita espaço horizontal, melhor para dashboards complexos.

### Signature Elements

1. **Status Badges Coloridas**: Verde/Âmbar/Vermelho para estados visuais instantâneos
2. **Cards com Sombra Sutil**: Profundidade sem excesso
3. **Ícones Lucide Consistentes**: Clareza visual em botões e labels
4. **Tabelas com Hover Interativo**: Feedback visual em linhas

### Interaction Philosophy

- **Feedback Imediato**: Toasts, spinners, skeleton loading
- **Transições Suaves**: 150-200ms para dropdowns, 200-300ms para modais
- **Hover States Claros**: Mudança de cor/sombra em elementos interativos
- **Validação em Tempo Real**: Feedback de formulários enquanto o usuário digita

### Animation Guidelines

- **Botões**: Scale(0.97) ao clicar, 100ms ease-out
- **Dropdowns/Menus**: Fade-in + slide-down, 150ms ease-out
- **Modais**: Fade background + scale-up (0.95 → 1), 250ms ease-out
- **Notificações (Toasts)**: Slide-in from right, 200ms ease-out
- **Transições de Página**: Fade-in suave, 150ms
- **Carregamento**: Skeleton screens com shimmer effect

### Typography System

**Fonte Display**: Geist Sans Bold (600-700) para títulos
**Fonte Body**: Geist Sans Regular (400-500) para conteúdo
**Tamanho Base**: 16px (1rem)

**Hierarquia:**
- **H1**: 32px, Bold (600), Azul Profundo - Títulos de página
- **H2**: 24px, Semi-bold (600), Azul Profundo - Seções
- **H3**: 20px, Medium (500), Cinza Escuro - Subtítulos
- **Body**: 16px, Regular (400), Cinza Escuro - Conteúdo
- **Small**: 14px, Regular (400), Cinza Médio - Metadados
- **Label**: 12px, Medium (500), Cinza Médio - Campos de formulário

---

## Implementação

Este design será implementado através de:

1. **TailwindCSS 4**: Tokens de cor, espaçamento e tipografia
2. **shadcn/ui**: Componentes base (Button, Card, Dialog, etc.)
3. **Lucide React**: Ícones consistentes
4. **Framer Motion**: Animações suaves
5. **Sonner**: Toasts com design integrado

Todos os arquivos CSS e componentes incluirão comentários referenciando este documento.
