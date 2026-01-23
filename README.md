# 🎨 Learnly App – Frontend

Frontend da aplicação **Learnly**, uma plataforma educacional focada em organização de estudos, eventos e planos personalizados para alunos.

---

## 📌 Visão Geral

Esta aplicação web é a interface principal do sistema **Learnly**, responsável por fornecer uma experiência intuitiva para criação de planos de estudo, visualização de eventos, organização por disciplinas e acompanhamento de progresso.

O frontend consome a **Learnly API** e apresenta os dados de forma interativa e responsiva.

---

## 🛠️ Tecnologias Utilizadas

* **React.js**
* **JavaScript**
* **CSS Modules**
* **React Hooks**
* **Axios** (consumo de API)
* **React Icons**

---

## 🧱 Estrutura do Projeto

```
Learnly.APP
│
├── src
│   ├── components     # Componentes reutilizáveis
│   ├── pages          # Páginas da aplicação
│   ├── services       # Comunicação com a API
│
├── public
├── package.json
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* npm ou yarn
* Git

---

## 🔧 Configuração do Ambiente

### 1. Clonar o repositório

```bash
git clone https://github.com/joao-hollanda/Learnly.APP
cd Learnly.APP
```

---

### 2. Instalar dependências

Com npm:

```bash
npm install
```

ou com yarn:

```bash
yarn
```

---

### 3. Configurar API

Edite o arquivo de configuração do serviço (ex: `src/services/api.js` ou similar) e informe a URL da API:

```js
export const api = axios.create({
  baseURL: "https://localhost:5001",
});
```

---

## ▶️ Executando a Aplicação

```bash
npm start
```

ou

```bash
yarn dev
```

A aplicação ficará disponível em:

```
http://localhost:3000
```

---

## 📷 Screenshots

<img width="1914" height="941" alt="image" src="https://github.com/user-attachments/assets/5912da9b-3965-452d-9a7e-e0ba9b905a4e" />
<img width="1914" height="930" alt="image" src="https://github.com/user-attachments/assets/0479718a-38ba-4db4-be36-7131b1f18c47" />
<img width="1912" height="935" alt="image" src="https://github.com/user-attachments/assets/4f2a7b8f-a807-4a2d-8b1b-a520d61a993a" />
<img width="1913" height="841" alt="image" src="https://github.com/user-attachments/assets/e004a92e-ae47-440c-975f-dd2d4c7c8cf3" />
<img width="1907" height="934" alt="image" src="https://github.com/user-attachments/assets/b85bf546-c63b-46d5-a08a-0c0c2173ed35" />

---

## 📌 Funcionalidades Principais

* Criação e edição de planos de estudo
* Visualização de eventos em calendário
* Organização por disciplinas
* Interface em formato de chat (aluno x IA)
* Feedback visual de progresso

---

## 🎯 Boas Práticas

* Componentização
* Separação de responsabilidades
* Consumo centralizado da API
* Estilos isolados com CSS Modules

---

## 🧪 Testes

*(Projeto de testes ainda não incluído — seção reservada para expansão futura)*

---

## 👤 Autor

**João Victor Hollanda**
