# Documentação Técnica: Sistema de Gestão de Processos Públicos (CPS)

## 1. Visão Geral do Projeto
O Sistema de Gestão de Processos Públicos é uma aplicação web desenvolvida para modernizar, organizar e automatizar o fluxo de trabalho da Coordenação de Processos Seletivos (CPS) no âmbito da Secretaria de Estado de Educação (SEDUC). A plataforma centraliza o planeamento de vagas, acompanhamento de inscritos, emissão de relatórios e a gestão do ciclo de vida dos processos seletivos através de uma interface intuitiva e painéis de controlo orientados a dados.

---

## 2. Stack Tecnológico

A aplicação adota uma arquitetura moderna baseada em **Single Page Application (SPA)** acoplada a um **Backend-as-a-Service (BaaS)**.

* **Frontend Web:**
    * **Framework:** React.js (com Vite para build e HMR de alta performance).
    * **Estilização:** Tailwind CSS (utility-first) e PostCSS.
    * **Roteamento:** React Router DOM.
    * **Componentes Visuais e Animações:** Framer Motion (transições suaves) e Lucide React (ícones).
    * **Visualização de Dados:** Recharts (gráficos e funis de conversão).
* **Backend & Banco de Dados:**
    * **BaaS:** Supabase.
    * **Banco de Dados:** PostgreSQL (gerenciado via Supabase).
    * **Autenticação:** Supabase Auth (Email/Senha).
    * **Segurança:** Row Level Security (RLS) implementado no banco para garantir que cada perfil aceda apenas aos dados permitidos.
* **Inteligência Artificial:**
    * **Integração:** Google Gemini API (para análise inteligente e assistente virtual da plataforma).

---

## 3. Arquitetura e Padrões de Projeto

O projeto segue uma arquitetura modularizada focada na separação de responsabilidades (Separation of Concerns):

1.  **Camada de Apresentação (Pages & Components):** Responsável apenas pela interface (UI) e captura de interações do utilizador.
2.  **Camada de Estado (Contexts & Hooks):** Gere estados globais (como Tema e Autenticação) e abstrai lógicas complexas de UI e subscrições em tempo real.
3.  **Camada de Serviço (Services):** Atua como um repositório centralizado para comunicação externa. Todas as chamadas ao Supabase (ex: `processos.js`, `candidatos.js`) e APIs externas (`GeminiService.js`) ficam isoladas aqui, facilitando a manutenção e a criação de testes.

---

## 4. Estrutura de Diretórios (`/src`)

A estrutura do código-fonte foi organizada visando a escalabilidade:

```text
src/
├── assets/          # Imagens, logótipos (bandeira do Pará, ícones SEDUC) e SVGs.
├── components/      # Componentes de UI reutilizáveis.
│   ├── dashboard/   # Widgets específicos dos ecrãs de dashboard.
│   ├── ui/          # Elementos genéricos (tabelas, modais, loaders, badges).
│   └── ...          # Modais complexos, Kanban, Chatbot, etc.
├── contexts/        # Provedores de estado global (AuthContext, ThemeContext).
├── hooks/           # Hooks customizados (useProcesses, useNotifications, useRealtime).
├── layouts/         # Componentes estruturais de página (Sidebar, Header, AuthLayout, DashboardLayout).
├── pages/           # Views principais da aplicação mapeadas nas rotas.
│   ├── auth/        # Telas de login, recuperação de senha e registo.
│   └── dashboard/   # Visões específicas por perfil de utilizador.
├── router/          # Configuração do React Router e controlo de rotas privadas (ProtectedRoute).
├── services/        # Regras de negócio e comunicação com Supabase e APIs externas.
├── test/            # Ficheiros de configuração de testes (Setup, Benchmarks).
└── utils/           # Funções utilitárias (formatação de datas, validações de CPF, algoritmos).
```


## 5. Módulos e Funcionalidades Principais
5.1. Controlo de Acesso e Perfis (RBAC)
A aplicação possui um sistema robusto de controlo de acesso baseado no papel do utilizador (Role-Based Access Control). A rota principal redireciona o utilizador para o dashboard adequado conforme o perfil:

Administrador (AdminPerfis.jsx): Gestão total do sistema, perfis e auditoria de segurança.

Gestor (GestorDashboard.jsx): Visão macro dos processos, relatórios estratégicos e aprovação de vagas.

Analista (AnalistaDashboard.jsx): Visão operacional, controlo do Kanban e triagem de candidatos.

Suporte (SuporteDashboard.jsx): Resolução de problemas e chamados técnicos.

5.2. Gestão de Processos e Kanban
O ecrã Processos.jsx permite criar e editar processos públicos. O fluxo de andamento desses processos é gerido de forma visual através de um quadro ágil (Kanban.jsx, KanbanColumn.jsx, KanbanCard.jsx), permitindo drag-and-drop de etapas.

5.3. Planeamento de Vagas e Lotação
O sistema inclui rotinas específicas para Planejamento.jsx, Lotacao.jsx e ControleVagas.jsx, com suporte a tratamento de vagas de Pessoas com Deficiência (PcD) e cotas mapeadas em VagasEspeciais.jsx.

5.4. Inteligência Artificial Integrada
Utilizando o GeminiService.js, o projeto dispõe de:

Assistente Virtual (AiChatbot.jsx): Para tirar dúvidas e auxiliar os utilizadores internos na navegação do sistema.

Análise de Dados (AnalysisModal.jsx): Geração de resumos automáticos e insights sobre os dados dos processos utilizando o poder de processamento de linguagem natural do Gemini.

5.5. Subsistema de Tempo Real e Notificações
O uso do hook useRealtime.js possibilita escutar mudanças (inserts/updates) no Supabase via WebSockets, alimentando o sistema de notificações (Notifications.jsx) e mantendo os Dashboards atualizados sem necessidade de recarregar a página.

6. Configuração e Execução Local
Pré-requisitos
Node.js (LTS recomendado, v18+)

Gestor de pacotes (NPM ou Yarn)

Passo a Passo
Instalação das Dependências:

Bash
npm install
Configuração de Variáveis de Ambiente:
Criar um ficheiro .env na raiz do projeto (baseado no .env.example) com as seguintes chaves:

Snippet de código
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_GEMINI_API_KEY=sua_api_key_do_google_gemini
Iniciando o Servidor de Desenvolvimento:

Bash
npm run dev
A aplicação estará disponível em http://localhost:5173.
