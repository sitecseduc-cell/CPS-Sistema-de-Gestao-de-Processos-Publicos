# 🚀 SITEC - Plataforma de Gestão Pública


[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**SITEC** é uma plataforma interna de gestão de processos e produtividade, construída com React, Vite e Firebase. O sistema é focado em um robusto **Controle de Acesso Baseado em Funções (RBAC)**, fornecendo dashboards e funcionalidades distintas para diferentes perfis de usuário.

---

## 📜 Tabela de Conteúdos

* [Sobre o Projeto](#-sobre-o-projeto)
* [Principais Funcionalidades](#✨-principais-funcionalidades)
* [Arquitetura e Funções (RBAC)](#-arquitetura-e-funções-rbac)
* [Tecnologias Utilizadas](#-tecnologias-utilizadas)
* [Começando](#-começando)
    * [Pré-requisitos](#pré-requisitos)
    * [Instalação](#instalação)
    * [Configurando Variáveis de Ambiente](#-configurando-variáveis-de-ambiente)
    * [Configuração Essencial do Firebase](#🔥-configuração-essencial-do-firebase)
* [Scripts Disponíveis](#-scripts-disponíveis)
* [Deploy (Vercel)](#-deploy-vercel)

---

## 📖 Sobre o Projeto

O **SITEC** foi desenhado para ser uma ferramenta administrativa centralizada. Ele permite que diferentes setores de uma organização (como TI, RH, Financeiro) gerenciem suas tarefas e processos diários.

O núcleo da aplicação é um sistema de autenticação que se integra ao Firestore para atribuir perfis (`role`) e setores (`sector`) a cada usuário. Com base nesses dados, a interface se adapta completamente, mostrando o dashboard e as ferramentas relevantes para aquela função (Gestor, Analista ou Suporte).

## ✨ Principais Funcionalidades

* **Autenticação Completa:** Fluxo de Login, Cadastro e Recuperação de Senha.
* **Rotas Protegidas:** O dashboard é protegido e só pode ser acessado por usuários autenticados.
* **Controle de Acesso por Função (RBAC):** A interface e as permissões mudam dinamicamente com base no perfil do usuário (`Gestor`, `Analista`, `Suporte`).
* **Dashboards por Função:** Cada perfil tem uma tela inicial (`Início`) customizada com estatísticas e ferramentas relevantes.
* **Gestão de Processos (CRUD):** Analistas e Gestores podem criar, visualizar, atualizar e filtrar processos (tarefas/demandas).
* **Dados em Tempo Real:** A aplicação usa `onSnapshot` do Firestore para que todas as tabelas e listas sejam atualizadas ao vivo.
* **Sistema de Notificações:** O cabeçalho (`Header.jsx`) possui um sino de notificações em tempo real (`useNotifications.js`).
* **Sistema de Tickets de Suporte:** Usuários podem abrir chamados de suporte (`SupportModal.jsx`), que são gerenciados pelo perfil `Suporte`.
* **Gerenciamento de Usuários:** O perfil `Suporte` pode visualizar e alterar o perfil de outros usuários (`SuporteDashboard.jsx`).
* **Hooks Customizados:** O estado é gerenciado de forma limpa através de hooks (`useAuth`, `useProcesses`, `useNotifications`).
* **Modo Escuro (Dark Mode):** Funcionalidade completa de toggle light/dark mode, com persistência no `localStorage`.

## 🏛️ Arquitetura e Funções (RBAC)

A lógica de acesso é controlada pelo `AuthContext.jsx` e aplicada pelo `DashboardPage.jsx`.

1.  **`Gestor` (Manager):**
    * Vê todos os processos de todos os setores.
    * Tem um dashboard com estatísticas globais (`GestorDashboard.jsx`).
    * Pode criar/editar processos.

2.  **`Analista` (Analyst):**
    * Vê apenas os processos do *seu próprio setor* (`useProcesses.js`).
    * Tem um dashboard focado em sua produtividade diária (`AnalistaDashboard.jsx`).
    * Pode criar/editar processos para seu setor.

3.  **`Suporte` (Support):**
    * Não vê processos de negócio.
    * Gerencia tickets de suporte de usuários (`SuporteDashboard.jsx`).
    * Gerencia os perfis e permissões de todos os usuários do sistema.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React 18 (com Hooks & Context API)
* **Build Tool:** Vite
* **Roteamento:** React Router DOM (v7)
* **Backend (BaaS):**
    * **Firebase Authentication:** Para login (Email/Senha).
    * **Firebase Firestore:** Banco de dados NoSQL para usuários, processos, notificações e tickets.
* **Estilização:**
    * TailwindCSS (com modo escuro `class`)
    * Headless UI: Para modais e transições acessíveis.
* **Linting:** ESLint

---

## 🏃 Começando

Siga estas instruções para configurar e rodar o projeto localmente.

### Pré-requisitos

* [Node.js (v18+)](https://nodejs.org/)
* [Git](https://git-scm.com/)
* Uma conta no **Firebase** com um projeto criado.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd SEU-REPOSITORIO
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```

### Configurando Variáveis de Ambiente

1.  Na raiz do projeto, crie um arquivo chamado `.env.local`.
2.  Copie as chaves do seu projeto Firebase e preencha o arquivo:

    ```env
    # .env.local

    # Substitua pelos dados do seu projeto no Firebase
    VITE_FIREBASE_API_KEY=AIza...
    VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=seu-projeto
    VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=12345...
    VITE_FIREBASE_APP_ID=1:12345:...
    ```

### 🔥 Configuração Essencial do Firebase

A aplicação **não funcionará** sem a configuração correta do Firebase.

1.  **Authentication:**
    * Vá ao seu Console do Firebase.
    * Em **Authentication** -> **Sign-in method**, ative o provedor **Email/Senha**.

2.  **Firestore (Banco de Dados):**
    * Vá para **Firestore Database** e crie um banco de dados (comece em **modo de teste** para facilitar).
    * **IMPORTANTE:** A aplicação depende que a coleção `users` exista para funcionar o RBAC.
    * Ao se cadastrar pela primeira vez, crie manualmente a coleção `users` se ela não existir.
    * Vá ao Firestore, encontre o usuário que você cadastrou na coleção `users` (o ID será o mesmo do Auth) e adicione os seguintes campos:
        * `role`: (String) "Gestor"
        * `sector`: (String) "TI"
        * (Os outros campos como `fullName` serão adicionados no cadastro).

    * **Regra de Perfil:** Para que o primeiro usuário (Gestor) possa se cadastrar e ter permissão, você pode alterar o `Register.jsx` temporariamente para definir o `role: 'Gestor'` no `setDoc` ao invés de 'Analista', ou fazer a alteração manualmente no Firestore.

3.  **Coleções Utilizadas:**
    O app irá criar e usar automaticamente as seguintes coleções:
    * `users`: Armazena dados de perfil (nome, setor, cargo).
    * `processes`: Armazena os processos e tarefas.
    * `notifications`: Armazena notificações para usuários.
    * `supportTickets`: Armazena os chamados de suporte.

## 🖥️ Scripts Disponíveis

* **Para rodar o app em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    (Acesse `http://localhost:5173`)

* **Para construir a versão de produção:**
    ```bash
    npm run build
    ```

* **Para verificar erros de linting:**
    ```bash
    npm run lint
    ```

## ☁️ Deploy (Vercel)

Este projeto está pronto para o deploy na Vercel.

1.  Envie seu projeto para um repositório no GitHub.
2.  Conecte sua conta Vercel ao GitHub e importe o projeto.
3.  A Vercel deve detectar automaticamente que é um projeto **Vite**.
4.  Antes de fazer o deploy, vá para **Settings** -> **Environment Variables** e adicione todas as chaves `VITE_FIREBASE_...` que você colocou no seu arquivo `.env.local`.
5.  Clique em **Deploy**.
