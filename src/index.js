import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Login from "./Pages/login/Login";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { iniciarAnalytics, registrarPageview } from "./utils/analytics";
import Inicio from "./Pages/inicio/Inicio";
import Planos from "./Pages/planos/Planos";
import Simulados from "./Pages/simulados/Simulados";
import Redacao from "./Pages/redacao/Redacao";
import Desempenho from "./Pages/desempenho/Desempenho";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import MentorIA from "./Pages/MentorIA/MentorIA";
import Comunidade from "./Pages/comunidade/Comunidade";
import Chat from "./Pages/chat/Chat";
import Perfil from "./Pages/perfil/Perfil";
import NotFound from "./Pages/notFound/NotFound";
import ConfirmarEmail from "./Pages/auth/ConfirmarEmail";
import EsqueciSenha from "./Pages/auth/EsqueciSenha";
import RedefinirSenha from "./Pages/auth/RedefinirSenha";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

iniciarAnalytics();

function RastreadorRotas() {
  const { pathname } = useLocation();
  useEffect(() => {
    registrarPageview(pathname);
  }, [pathname]);
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SpeedInsights />
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RastreadorRotas />
        <ToastContainer
          position="bottom-right"
          autoClose={4500}
          closeOnClick
          pauseOnHover={false}
          bodyClassName="learnly-toast-body"
        />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/confirmar-email" element={<ConfirmarEmail />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planos"
            element={
              <ProtectedRoute>
                <Planos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulados"
            element={
              <ProtectedRoute>
                <Simulados />
              </ProtectedRoute>
            }
          />
          <Route
            path="/redacao"
            element={
              <ProtectedRoute>
                <Redacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentoria"
            element={
              <ProtectedRoute>
                <MentorIA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/desempenho"
            element={
              <ProtectedRoute>
                <Desempenho />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunidade"
            element={
              <ProtectedRoute>
                <Comunidade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

reportWebVitals();
