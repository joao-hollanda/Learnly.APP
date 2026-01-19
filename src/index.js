import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Pages/login/Login";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./Pages/inicio/Inicio";
import Planos from "./Pages/planos/Planos";
import Simulados from "./Pages/simulados/Simulados";
import Desempenho from "./Pages/desempenho/Desempenho";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ToastContainer } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={4500}
        closeOnClick
        pauseOnHover={false}
        bodyClassName="learnly-toast-body"
      />

      <Routes>
        <Route path="/" element={<Login />} />
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
        {/* <Route
          path="/desempenho"
          element={
            <ProtectedRoute>
              <Desempenho />
          Q</ProtectedRoute>
          }
        /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
