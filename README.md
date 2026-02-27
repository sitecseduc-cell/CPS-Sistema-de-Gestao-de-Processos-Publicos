CPS - Sistema de Gestão de Processos Públicos
O CPS é uma solução avançada para a gestão de processos de seleção pública e recrutamento, desenvolvida para modernizar e automatizar fluxos de trabalho administrativos. A plataforma integra ferramentas de inteligência artificial, análise de dados e um ecossistema completo para monitorização de candidatos, gestão de vagas e conformidade regulatória.

🚀 Funcionalidades Principais
Dashboard Executivo: Visualização em tempo real de estatísticas críticas, mapas de distribuição e métricas de desempenho dos processos.

Gestão de Candidatos (Kanban): Interface intuitiva para mover candidatos entre diferentes etapas do processo seletivo (Inscrição, Pré-Avaliação, Convocação, etc.).

Inteligência Artificial (Cortex AI): Chatbot integrado e motores de análise para auxílio na tomada de decisões e automação de respostas.

Algoritmo de Convocação Inteligente: Sistema automatizado para seleção e convocação de candidatos com base em critérios pré-definidos.

Controlo de Vagas e Lotação: Módulos específicos para planeamento de vagas e gestão da distribuição de pessoal em diferentes unidades.

Auditoria e Segurança: Registo detalhado de todas as ações no sistema e controlo rigoroso de perfis de acesso.

Relatórios Personalizados: Geração de relatórios analíticos para avaliação de resultados e transparência pública.

🛠️ Tecnologias Utilizadas
Frontend: React.js com Vite.

Estilização: Tailwind CSS.

Backend & Base de Dados: Supabase (PostgreSQL + RLS para segurança).

Inteligência Artificial: Integração com Google Gemini API.

Linguagens: JavaScript, TypeScript e scripts auxiliares em Python.

📦 Estrutura do Projeto
src/components/: Componentes de interface reutilizáveis (Modais, Tabelas, Cartões).

src/pages/: Páginas principais do sistema (Dashboard, Kanban, Auditoria, Inscritos).

src/services/: Integração com APIs externas e serviços do Supabase/Gemini.

src/utils/: Lógica de negócio, como o algoritmo de convocação e validadores.

scripts/: Ferramentas para migração de dados e depuração do sistema.

🔧 Configuração e Instalação
Pré-requisitos
Node.js (versão LTS recomendada).

Conta no Supabase com projeto configurado.

Instalação
Clone o repositório:

Bash
git clone https://github.com/usuario/cps-sistema-de-gestao.git
Instale as dependências:

Bash
npm install
Configure as variáveis de ambiente num ficheiro .env (ex: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

Inicie o servidor de desenvolvimento:

Bash
npm run dev
🧪 Testes e Qualidade
O projeto utiliza Vitest para testes unitários e de performance.

Para correr os testes:

Bash
npm test
Para relatórios de linting:

Bash
npm run lint
📄 Licença
Este projeto é desenvolvido para uso interno da SEDUC. Verifique as permissões de acesso e direitos de autor antes da distribuição.
