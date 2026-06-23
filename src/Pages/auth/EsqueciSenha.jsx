import { useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import { FaCircleCheck } from "react-icons/fa6";
import { toast } from "react-toastify";
import estilo from "./_auth.module.css";
import logo from "../../img/LearnlyLogoBranca.svg";
import service from "../../services/LoginService";
import { emailValido } from "../../utils/validacao";
import { getApiError } from "../../services/client";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!emailValido(email)) return toast.warn("Informe um e-mail válido.");

    try {
      setCarregando(true);
      await service.EsqueciSenha(email);
      setEnviado(true);
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao enviar. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={estilo.tela}>
      <img src={logo} alt="Learnly" className={estilo.logo} />
      <div className={estilo.card}>
        {enviado ? (
          <div className={estilo.estado}>
            <span className={`${estilo.estadoIcone} ${estilo.ok}`}>
              <FaCircleCheck />
            </span>
            <h1 className={estilo.titulo}>Verifique seu e-mail</h1>
            <p className={estilo.subtitulo}>
              Se houver uma conta com <strong>{email}</strong>, enviamos um link
              para redefinir sua senha. Ele expira em 30 minutos.
            </p>
            <Link to="/" className={estilo.link}>
              <LuArrowLeft /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <span className={estilo.kicker}>Recuperação de senha</span>
            <h1 className={estilo.titulo}>Esqueceu a senha?</h1>
            <p className={estilo.subtitulo}>
              Informe o e-mail da sua conta e enviaremos um link para criar uma
              nova senha.
            </p>

            <form className={estilo.form} onSubmit={enviar}>
              <div className={estilo.campo}>
                <label htmlFor="email">E-mail</label>
                <div className={estilo.inputWrap}>
                  <input
                    id="email"
                    type="email"
                    className={estilo.input}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={estilo.botao}
                disabled={carregando}
              >
                {carregando ? (
                  <span className={estilo.botaoSpinner} />
                ) : (
                  "Enviar link"
                )}
              </button>
            </form>

            <Link to="/" className={estilo.link}>
              <LuArrowLeft /> Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
