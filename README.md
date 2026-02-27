# CPS - Sistema de Gestão de Processos Públicos

O **CPS (Controle de Processos Seletivos)** é uma solução avançada para a gestão de processos de seleção pública e recrutamento educativo. Desenvolvido para modernizar e automatizar fluxos de trabalho administrativos, a plataforma integra ferramentas de análise de inteligência artificial, dashboards táticos e um ecossistema completo para o monitoramento da jornada de candidatos e gestão inteligente de vagas.

---

## 🚀 Funcionalidades Principais

* **Dashboard Executivo:** Visualização em tempo real de estatísticas críticas, métricas de desempenho dos processos, ocupação de vagas e fluxos funilares.
* **Gestão de Candidatos (Kanban):** Interface ágil e visual para mover candidatos entre diferentes etapas do processo seletivo estruturado (Inscrição, Pré-Avaliação, Aprovação e Convocação).
* **Convocação Inteligente (IA):** Sistema simulado de algoritmos para seleção e classificação autônoma de candidatos baseado em critérios e match de perfil.
* **Controle de Vagas e Lotação:** Planejamento centralizado da distribuição de pessoal docente e de apoio na rede educacional.
* **Ambiente Multicanais (Internal Chat):** Chat em tempo real para equipes internas e comunicação em broadcast.
* **Central de Relatórios:** Geração e exportação instantânea de relatórios operacionais em formato CSV e visualização unificada de dados demográficos.
* **Modo de Homologação Embutido:** Acesso instantâneo para avaliação técnica com dados controlados, eliminando a dependência de setups complexos de banco de dados por avaliadores.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js construído com [Vite](https://vitejs.dev/) para máxima performance.
* **Estilização e UI:** Tailwind CSS puro com extensões modulares, garantindo design responsivo e `glassmorphism`. Ícones via `lucide-react`.
* **Roteamento:** React Router DOM (v6).
* **Gráficos e Visualização:** Recharts.
* **Backend & Banco de Dados (Produção):** Supabase (PostgreSQL, Realtime Subscriptions, Row-Level Security e Edge Functions).
* **Gestão de Formulários:** React Hook Form + validação via Zod.

---

## 🧪 Ambiente de Avaliação Técnica (Homologação / Demo)

Para simplificar a avaliação arquitetural da aplicação sem a necessidade de configurar chaves do Supabase, o repositório é embarcado com um Modo de Homologação nativo (Mock Data Offline-First).

### Acessando a Demo
1. No ecrã de Autenticação/Login, procure pelo módulo inferior com o ícone de Erlenmeyer (Laboratório).
2. Clique no botão **"Preencher Credenciais Demo"** para injetar as credenciais provisórias de homologação nos formulários virtuais.
3. Clique em acessar.

Este modo ativará `sessionStorage('cps_demo_mode')` e os principais serviços e tabelas (Processos, Vagas, Candidatos, Relatórios, etc.) consultarão o banco local (arrays exportados via `demoData.js`) de imediato, simulando latência onde seja relevante contornando as políticas do Supabase RLS.

---

## ⚙️ Instalação e Uso Local

**Pré-requisitos:**
* Node.js v18 ou superior.

### Passos de Inicialização:

1. **Clone do repositório:**
```sh
git clone [repository-url]
cd [repository-folder]
```

2. **Instalação das dependências:**
```sh
npm install
```

3. **Iniciando a aplicação:**
Assim que instalados os pacotes necessários, para correr em localhost basta:
```sh
npm run dev
```

4. **Build para Produção:**
O sistema está estritamente ajustado para ser construído em Vite via rollup, sem warnings.
```sh
npm run build
```

---

*Sistema projetado com foco em resiliência, baixa latência cliente-servidor e design cognitivo superior.*
