import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import estilo from "./_auth.module.css";
import logo from "../../img/LearnlyLogoBranca.svg";
import service from "../../services/LoginService";
import { startTokenRefresh } from "../../utils/tokenRefresh";

export default function ConfirmarEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [estado, setEstado] = useState("carregando");
  const jaRodou = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (jaRodou.current) return;
    jaRodou.current = true;

    if (!token) {
      setEstado("erro");
      return;
    }

    service
      .ConfirmarEmail(token)
      .then((dados) => {
        if (dados?.id) {
          sessionStorage.setItem("id", dados.id);
          sessionStorage.setItem("nome", dados.nome ?? "");
          queryClient.setQueryData(["userData"], dados);
        }
        sessionStorage.setItem("recemLogado", "1");
        startTokenRefresh();
        setEstado("ok");
      })
      .catch(() => setEstado("erro"));
  }, [token]);

  return (
    <div className={estilo.tela}>
      <img src={logo} alt="Learnly" className={estilo.logo} />
      <div className={estilo.card}>
        {estado === "carregando" && (
          <>
            <span className={estilo.kicker}>Confirmação de e-mail</span>
            <h1 className={estilo.titulo}>Confirmando sua conta…</h1>
            <div className={estilo.spinnerWrap}>
              <span className={estilo.spinner} />
            </div>
          </>
        )}

        {estado === "ok" && (
          <div className={estilo.estado}>
            <span className={`${estilo.estadoIcone} ${estilo.ok}`}>
              <FaCircleCheck />
            </span>
            <span className={estilo.kicker}>Tudo certo</span>
            <h1 className={estilo.titulo}>E-mail confirmado!</h1>
            <p className={estilo.subtitulo}>
              Sua conta está ativa. Entre para começar a estudar.
            </p>
            <Link to="/home" className={estilo.botao}>
              Entrar
            </Link>
          </div>
        )}

        {estado === "erro" && (
          <div className={estilo.estado}>
            <span className={`${estilo.estadoIcone} ${estilo.erro}`}>
              <FaCircleXmark />
            </span>
            <span className={estilo.kicker}>Link inválido</span>
            <h1 className={estilo.titulo}>Não foi possível confirmar</h1>
            <p className={estilo.subtitulo}>
              O link é inválido ou expirou. Tente entrar — reenviaremos um novo
              link de confirmação automaticamente.
            </p>
            <Link to="/" className={estilo.botao}>
              Ir para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
