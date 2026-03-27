# Learnly — Frontend

Interface web da plataforma **Learnly** — preparatório inteligente para o ENEM com planos de estudo, simulados e MentorIA.

---

## Visão Geral

SPA construída em **React 19** com roteamento via React Router, gerenciamento de server state com **TanStack Query v5** e estilização por **CSS Modules**. A autenticação é feita via **HttpOnly Cookie JWT**, com refresh automático do token a cada 23 horas.

---

## Stack

| Categoria | Tecnologia |
|---|---|
| Framework | React 19 |
| Roteamento | React Router v7 |
| Server State | TanStack Query v5 |
| HTTP Client | Axios |
| UI Components | React Bootstrap 2 |
| Calendário | React Big Calendar |
| Markdown | React Markdown |
| Gráficos | Recharts |
| Ícones | React Icons, Lucide React |
| Toasts | React Toastify |
| Deploy | Vercel |

---

## Estrutura do Projeto

```
src/
├── Pages/
│   ├── login/          # Tela de login e cadastro (split-panel + animação de slide)
│   ├── inicio/         # Dashboard com cards de resumo e calendário semanal
│   ├── planos/         # Gerenciamento de planos de estudo (manual ou IA)
│   ├── simulados/      # Geração, resposta e histórico de simulados
│   ├── MentorIA/       # Chat com o mentor IA (streaming de texto)
│   └── desempenho/     # (Em desenvolvimento)
│
├── components/
│   ├── Header/         # Navbar responsiva com menu hambúrguer
│   ├── Card/           # Card genérico reutilizável
│   ├── Plano/          # Card de plano de estudo com barra de progresso
│   ├── Calendario/     # Wrapper do React Big Calendar com tooltip customizado
│   ├── Bolinha/        # Indicador de status colorido
│   ├── Evento/         # Card de evento de estudo
│   ├── Logout/         # Botão de logout com limpeza de sessão
│   ├── ProtectedRoute/ # Guard de rota com AuthCheck no backend
│   └── Modais/
│       ├── Inicio/     # ModalCriarEvento, ModalResetEventos
│       ├── Planos/     # ModalCriarPlano, ModalCriarPlanoIA, ModalConfigurarPlano,
│       │               # ModalVisualizarPlano, ModalLancarHoras, ModalExcluirPlano
│       └── Simulados/  # ModalCriarSimulado, ModalResultado, ModalPreviewResultado
│
├── services/
│   ├── client.js       # Instância Axios + interceptor de refresh automático
│   ├── LoginService.js
│   ├── PlanoService.js
│   ├── SimuladoService.js
│   ├── EventoService.js
│   └── MentorIAService.js
│
└── utils/
    ├── cookieHelper.js  # Busca dados do usuário logado via JWT
    └── tokenRefresh.js  # Gerencia o timer de renovação automática do token
```

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend da Learnly rodando (local ou Render)

---

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/joao-hollanda/Learnly
cd Learnly
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure a URL da API

Em `src/services/client.js`, ajuste a variável `baseURL`:

```js
const local = "http://localhost:5080/api/";
const deploy = "https://learnly-api-yrdu.onrender.com/api/";

// Para rodar localmente, troque deploy por local no axios.create:
export const HTTPClient = axios.create({
  baseURL: local,
  ...
});
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm start
```

Acesse em: `http://localhost:3000`

---

## Build para Produção

```bash
npm run build
```

O projeto está configurado com `CI=false` para ignorar warnings como erros durante o build.

---

## Deploy

O frontend é hospedado no **Vercel**. O arquivo `vercel.json` redireciona todas as rotas para `/index.html`, necessário para SPAs com React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

URL de produção: [learnly-edu.vercel.app](https://learnly-edu.vercel.app)

---

## Páginas

### Login (`/`)
Tela split-panel com SVG decorativo à esquerda e formulário à direita. Alterna entre login e cadastro com animação de slide. Valida email e senha com regex antes de submeter.

### Início (`/home`)
Dashboard com 4 cards de métricas (horas hoje, plano ativo, progresso geral, simulados concluídos), cronograma do dia e calendário semanal com tooltip ao hover. Permite criar eventos de estudo recorrentes por dia da semana ou resetar todos os eventos.

### Planos (`/planos`)
Lista planos de estudo com destaque para o plano ativo. Criação manual (com configuração de matérias e horas) ou gerada por IA (LLaMA 70B via Groq). Exibe progresso por matéria, lançamento de horas e limite de 5 planos por usuário.

### Simulados (`/simulados`)
Seleciona disciplinas e quantidade de questões (máx. 25), exibe questões com suporte a contexto em markdown e imagens. Ao enviar, exibe nota, feedback da IA e explicação por questão errada. Histórico dos últimos 5 simulados com visualização completa.

### MentorIA (`/mentoria`)
Chat com o mentor IA. Mantém histórico da conversa na sessão, simula efeito de digitação ao exibir respostas, bloqueia envio enquanto a IA responde e renderiza markdown nas respostas.

---

## Autenticação

O fluxo de auth usa **HttpOnly Cookie JWT**:

1. Login chama `POST /api/Login` → backend seta o cookie `jwt`
2. Todas as requisições via Axios incluem `withCredentials: true`
3. `ProtectedRoute` faz `GET /api/Login/AuthCheck` antes de renderizar rotas protegidas
4. O interceptor de resposta do Axios detecta `401` e tenta `POST /api/Login/refresh` automaticamente
5. Se o refresh falhar, redireciona para `/`
6. `startTokenRefresh()` inicia um timer de 23h para renovar proativamente

---

## Cache e Server State

Todas as chamadas à API usam **TanStack Query** com as seguintes queryKeys:

| queryKey | Dados |
|---|---|
| `["userData"]` | Nome e email do usuário logado |
| `["planoAtivo"]` | Plano de estudo ativo |
| `["planos"]` | Lista de planos |
| `["resumo"]` | Horas totais e concluídas |
| `["comparacaoHoras"]` | Horas hoje vs ontem |
| `["eventos"]` | Eventos do calendário |
| `["simulados"]` | Histórico de simulados |
| `["totalSimulados"]` | Contador de simulados |

Mutations invalidam as queryKeys afetadas via `queryClient.invalidateQueries`.

---

## Autor

**João Victor Hollanda** — [github.com/joao-hollanda](https://github.com/joao-hollanda)
