import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import estilo from "./_login.module.css";
import service from "../../services/LoginService";
import { getApiError } from "../../services/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { startTokenRefresh } from "../../utils/tokenRefresh";
import { registrarEvento } from "../../utils/analytics";
import {
  emailValido,
  senhaValida,
  REGRA_SENHA_MSG,
} from "../../utils/validacao";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import logo from "../../img/LearnlyLogoBranca.svg";
import IlustracaoLogin from "../../components/IlustracaoLogin/IlustracaoLogin";

const CampoSenha = ({ id, rotulo, valor, aoAlterar, autoComplete }) => {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className={estilo.campo}>
      <label htmlFor={id}>{rotulo}</label>
      <div className={`${estilo.campoWrapper} ${estilo.temIcone}`}>
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          placeholder="••••••••"
          value={valor}
          onChange={aoAlterar}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={estilo.botaoOlho}
          onClick={() => setMostrar((s) => !s)}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
        >
          {mostrar ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

const Login = () => {
  const [modo, setModo] = useState("login");
  const [animando, setAnimando] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const trilhaRef = useRef(null);
  const loginRef = useRef(null);
  const cadastroRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    service.Awake();
  }, []);

  const alternarModo = (proximo) => {
    if (proximo === modo || animando) return;

    const paraLogin = proximo === "login";
    const elSaindo = paraLogin ? cadastroRef.current : loginRef.current;
    const elEntrando = paraLogin ? loginRef.current : cadastroRef.current;
    const classeSaida = paraLogin ? estilo.sairDireita : estilo.sairEsquerda;
    const classeEntrada = paraLogin
      ? estilo.entrarEsquerda
      : estilo.entrarDireita;

    const trilha = trilhaRef.current;
    trilha.style.height = elSaindo.offsetHeight + "px";

    elEntrando.style.display = "block";
    setAnimando(true);

    void elSaindo.offsetWidth;

    elSaindo.classList.add(classeSaida);
    elEntrando.classList.add(classeEntrada);

    requestAnimationFrame(() => {
      trilha.style.height = elEntrando.offsetHeight + "px";
    });

    setTimeout(() => {
      elSaindo.style.display = "none";
      elSaindo.classList.remove(classeSaida);
      elEntrando.classList.remove(classeEntrada);
      trilha.style.height = "";
      setModo(proximo);
      setAnimando(false);
      limparCampos();
    }, 400);
  };

  const limparCampos = () => {
    setEmail("");
    setSenha("");
    setUsuario("");
    setConfirmarSenha("");
  };

  const aoEnviar = async (e) => {
    e.preventDefault();

    if (modo === "login") {
      if (!email || !senha) return toast.warn("Preencha todos os campos!");
      if (!emailValido(email)) return toast.warn("Informe um e-mail válido.");
      if (!senhaValida(senha)) return toast.warn(REGRA_SENHA_MSG);
    } else {
      if (!usuario || !email || !senha || !confirmarSenha)
        return toast.warn("Preencha todos os campos!");
      if (!emailValido(email)) return toast.warn("Informe um e-mail válido.");
      if (!senhaValida(senha)) return toast.warn(REGRA_SENHA_MSG);
      if (senha !== confirmarSenha)
        return toast.warn("As senhas não coincidem.");
    }

    setCarregando(true);

    try {
      if (modo === "login") {
        const dados = await service.Login(email, senha);
        if (dados?.id) {
          sessionStorage.setItem("id", dados.id);
          sessionStorage.setItem("nome", dados.nome ?? "");
          queryClient.setQueryData(["userData"], dados);
        }
        sessionStorage.setItem("recemLogado", "1");
        startTokenRefresh();
        registrarEvento("login_realizado");
        navigate("/home");
      } else {
        await service.Register(usuario, email, senha);
        registrarEvento("cadastro_realizado");
        toast.success(
          "Conta criada! Enviamos um link de confirmação para o seu e-mail.",
        );
        alternarModo("login");
      }
    } catch (erro) {
      if (modo === "login") {
        if (erro.response?.status === 403) {
          toast.info(
            "Confirme seu e-mail para entrar. Reenviamos o link de confirmação para você.",
          );
          try {
            await service.ReenviarConfirmacao(email);
          } catch {}
        } else if (erro.response) {
          toast.warning("Usuário ou senha incorretos!");
        } else {
          toast.warning("Erro ao conectar ao servidor.");
        }
      } else {
        toast.error(getApiError(erro, "Erro ao registrar."));
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={estilo.principal}>
      <div className={estilo.heroMobile}>
        <img src={logo} alt="Learnly" className={estilo.heroMobileLogo} />
        <span className={estilo.heroMobileEtiqueta}>Plataforma EDTECH</span>
        <h1 className={estilo.heroMobileTitulo}>
          Estude com <em>inteligência.</em>
        </h1>
      </div>

      <div className={estilo.painelEsquerdo}>
        <IlustracaoLogin className={estilo.cenaSvg} />

        <div className={estilo.conteudoEsquerdo}>
          <div className={estilo.marca}>
            <img src={logo} alt="Learnly" className={estilo.logo} />
          </div>
          <div className={estilo.etiqueta}>Plataforma EDTECH</div>
          <h1 className={estilo.titulo}>
            Estude com
            <br />
            <em>inteligência.</em>
          </h1>
          <p className={estilo.subtitulo}>
            Planos adaptativos, simulados completos e feedback de IA em tempo
            real — calibrados para o seu ritmo e objetivo.
          </p>
          <div className={estilo.listaRecursos}>
            {[
              "Cronograma de estudos personalizado",
              "Simulados com questões de vestibulares reais",
              "MentorIA: feedback instantâneo com IA",
              "Acompanhe seu progresso em tempo real",
            ].map((item) => (
              <div key={item} className={estilo.recurso}>
                <div className={estilo.pontoRecurso}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className={estilo.rodape}>
          © 2025 Learnly · Todos os direitos reservados
        </div>
      </div>

      <div className={estilo.painelDireito}>
        <div className={estilo.formularioCartao}>
          <div className={estilo.cabecalho}>
            <h2>
              {modo === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p>
              {modo === "login"
                ? "Entre na sua conta para continuar estudando"
                : "Comece a estudar com inteligência hoje"}
            </p>
          </div>

          <div className={estilo.abas}>
            <button
              type="button"
              className={`${estilo.aba} ${modo === "login" ? estilo.abaAtiva : ""}`}
              onClick={() => alternarModo("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`${estilo.aba} ${modo === "cadastro" ? estilo.abaAtiva : ""}`}
              onClick={() => alternarModo("cadastro")}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={aoEnviar}>
            <div className={estilo.trilha} ref={trilhaRef}>
              <div className={estilo.painel} ref={loginRef}>
                <div className={estilo.campo}>
                  <label htmlFor="login-email">Email</label>
                  <div className={estilo.campoWrapper}>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <CampoSenha
                  id="login-senha"
                  rotulo="Senha"
                  valor={senha}
                  aoAlterar={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                />
                <div style={{ textAlign: "right", margin: "-0.35rem 0 0.7rem" }}>
                  <Link
                    to="/esqueci-senha"
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--brand)",
                      textDecoration: "none",
                    }}
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <button
                  className={estilo.botaoEnviar}
                  type="submit"
                  disabled={carregando}
                >
                  {carregando ? <span className={estilo.spinner} /> : "Entrar"}
                </button>
              </div>

              <div
                className={estilo.painel}
                ref={cadastroRef}
                style={{ display: "none" }}
              >
                <div className={estilo.campo}>
                  <label htmlFor="cad-usuario">Nome de usuário</label>
                  <div className={estilo.campoWrapper}>
                    <input
                      id="cad-usuario"
                      type="text"
                      placeholder="Seu nome"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div className={estilo.campo}>
                  <label htmlFor="cad-email">Email</label>
                  <div className={estilo.campoWrapper}>
                    <input
                      id="cad-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <CampoSenha
                  id="cad-senha"
                  rotulo="Senha"
                  valor={senha}
                  aoAlterar={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <CampoSenha
                  id="cad-confirmar"
                  rotulo="Confirmar senha"
                  valor={confirmarSenha}
                  aoAlterar={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  className={estilo.botaoEnviar}
                  type="submit"
                  disabled={carregando}
                >
                  {carregando ? (
                    <span className={estilo.spinner} />
                  ) : (
                    "Criar conta"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className={estilo.seguranca}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Seus dados estão seguros e criptografados
          </div>
        </div>

        <div className={estilo.rodapeMobile}>
          © 2025 Learnly · Todos os direitos reservados
        </div>
      </div>
    </div>
  );
};

export default Login;
