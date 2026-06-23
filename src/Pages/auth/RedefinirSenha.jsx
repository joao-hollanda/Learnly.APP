import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import { FaCircleCheck, FaCircleXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
import { toast } from "react-toastify";
import estilo from "./_auth.module.css";
import logo from "../../img/LearnlyLogoBranca.svg";
import service from "../../services/LoginService";
import { senhaValida, REGRA_SENHA_MSG } from "../../utils/validacao";
import { getApiError } from "../../services/client";

export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [ok, setOk] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!senhaValida(senha)) return toast.warn(REGRA_SENHA_MSG);
    if (senha !== confirmar) return toast.warn("As senhas não coincidem.");

    try {
      setCarregando(true);
      await service.RedefinirSenha(token, senha);
      setOk(true);
    } catch (erro) {
      toast.error(
        getApiError(erro, "Não foi possível redefinir. O link pode ter expirado."),
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={estilo.tela}>
      <img src={logo} alt="Learnly" className={estilo.logo} />
      <div className={estilo.card}>
        {!token ? (
          <div className={estilo.estado}>
            <span className={`${estilo.estadoIcone} ${estilo.erro}`}>
              <FaCircleXmark />
            </span>
            <h1 className={estilo.titulo}>Link inválido</h1>
            <p className={estilo.subtitulo}>
              O endereço de redefinição está incompleto. Solicite um novo link.
            </p>
            <Link to="/esqueci-senha" className={estilo.botao}>
              Solicitar novo link
            </Link>
          </div>
        ) : ok ? (
          <div className={estilo.estado}>
            <span className={`${estilo.estadoIcone} ${estilo.ok}`}>
              <FaCircleCheck />
            </span>
            <h1 className={estilo.titulo}>Senha redefinida!</h1>
            <p className={estilo.subtitulo}>
              Sua nova senha já está valendo. Entre para continuar estudando.
            </p>
            <button
              type="button"
              className={estilo.botao}
              onClick={() => navigate("/")}
            >
              Entrar
            </button>
          </div>
        ) : (
          <>
            <span className={estilo.kicker}>Recuperação de senha</span>
            <h1 className={estilo.titulo}>Crie uma nova senha</h1>
            <p className={estilo.subtitulo}>
              Escolha uma senha forte que você ainda não usou nesta conta.
            </p>

            <form className={estilo.form} onSubmit={enviar}>
              <div className={estilo.campo}>
                <label htmlFor="senha">Nova senha</label>
                <div className={estilo.inputWrap}>
                  <input
                    id="senha"
                    type={mostrar ? "text" : "password"}
                    className={estilo.input}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={estilo.olho}
                    onClick={() => setMostrar((s) => !s)}
                    aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrar ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className={estilo.campo}>
                <label htmlFor="confirmar">Confirmar nova senha</label>
                <div className={estilo.inputWrap}>
                  <input
                    id="confirmar"
                    type={mostrar ? "text" : "password"}
                    className={estilo.input}
                    placeholder="••••••••"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <p className={estilo.dica}>{REGRA_SENHA_MSG}</p>

              <button
                type="submit"
                className={estilo.botao}
                disabled={carregando}
              >
                {carregando ? (
                  <span className={estilo.botaoSpinner} />
                ) : (
                  "Redefinir senha"
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
