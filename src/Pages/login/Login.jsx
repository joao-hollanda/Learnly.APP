import { useState, useRef, useEffect } from "react";
import estilo from "./_login.module.css";
import service from "../../services/LoginService";
import { getApiError } from "../../services/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { startTokenRefresh } from "../../utils/tokenRefresh";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import logo from "../../img/LearnlyLogoBranca.svg";

const emailValido = (valor) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).toLowerCase());

const senhaValida = (valor) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])([^\s]){8,}$/.test(
    String(valor),
  );

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
      if (!senhaValida(senha))
        return toast.warn(
          "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número, caractere especial e sem espaços.",
        );
    } else {
      if (!usuario || !email || !senha || !confirmarSenha)
        return toast.warn("Preencha todos os campos!");
      if (!emailValido(email)) return toast.warn("Informe um e-mail válido.");
      if (!senhaValida(senha))
        return toast.warn(
          "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número, caractere especial e sem espaços.",
        );
      if (senha !== confirmarSenha)
        return toast.warn("As senhas não coincidem.");
    }

    setCarregando(true);

    try {
      if (modo === "login") {
        await service.Login(email, senha);
        startTokenRefresh();
        navigate("/home");
      } else {
        await service.Register(usuario, email, senha);
        toast.success("Usuário criado com sucesso!");
        alternarModo("login");
      }
    } catch (erro) {
      if (modo === "login") {
        toast.warning(
          erro.response
            ? "Usuário ou senha incorretos!"
            : "Erro ao conectar ao servidor.",
        );
      } else {
        toast.error(getApiError(erro, "Erro ao registrar."));
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={estilo.principal}>
      <div className={estilo.painelEsquerdo}>
        <svg
          className={estilo.cenaSvg}
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="brilho1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="brilho2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="300" rx="260" ry="220" fill="url(#brilho1)" />
          <ellipse cx="650" cy="650" rx="200" ry="180" fill="url(#brilho2)" />
          <circle cx="120" cy="160" r="2.5" fill="#93c5fd" opacity="0.4" />
          <circle cx="340" cy="90" r="1.8" fill="#bfdbfe" opacity="0.35" />
          <circle cx="580" cy="200" r="2" fill="#93c5fd" opacity="0.3" />
          <circle cx="700" cy="120" r="1.5" fill="#bfdbfe" opacity="0.4" />
          <circle cx="60" cy="420" r="2" fill="#93c5fd" opacity="0.25" />
          <circle cx="760" cy="380" r="2.5" fill="#bfdbfe" opacity="0.3" />
          <circle cx="420" cy="460" r="1.5" fill="#93c5fd" opacity="0.2" />
          <circle cx="680" cy="500" r="2" fill="#bfdbfe" opacity="0.25" />
          <line
            x1="0"
            y1="820"
            x2="800"
            y2="820"
            stroke="#3b5fc0"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="0"
            y1="840"
            x2="800"
            y2="840"
            stroke="#3b5fc0"
            strokeWidth="1"
            opacity="0.2"
          />
          <line
            x1="0"
            y1="860"
            x2="800"
            y2="860"
            stroke="#3b5fc0"
            strokeWidth="1"
            opacity="0.15"
          />
          <rect
            x="380"
            y="710"
            width="420"
            height="18"
            rx="4"
            fill="#1e3a8a"
            opacity="0.7"
          />
          <rect
            x="560"
            y="640"
            width="10"
            height="72"
            rx="3"
            fill="#1e40af"
            opacity="0.8"
          />
          <rect
            x="540"
            y="708"
            width="50"
            height="6"
            rx="2"
            fill="#1e40af"
            opacity="0.7"
          />
          <rect
            x="490"
            y="560"
            width="130"
            height="82"
            rx="6"
            fill="#1e3a8a"
            opacity="0.9"
          />
          <rect
            x="497"
            y="567"
            width="116"
            height="68"
            rx="3"
            fill="#2563eb"
            opacity="0.25"
          />
          <rect
            x="507"
            y="576"
            width="60"
            height="5"
            rx="2"
            fill="#93c5fd"
            opacity="0.5"
          />
          <rect
            x="507"
            y="586"
            width="42"
            height="4"
            rx="2"
            fill="#bfdbfe"
            opacity="0.3"
          />
          <rect
            x="507"
            y="594"
            width="50"
            height="4"
            rx="2"
            fill="#bfdbfe"
            opacity="0.25"
          />
          <rect
            x="507"
            y="602"
            width="35"
            height="4"
            rx="2"
            fill="#bfdbfe"
            opacity="0.2"
          />
          <rect
            x="572"
            y="610"
            width="10"
            height="18"
            rx="1"
            fill="#3b82f6"
            opacity="0.6"
          />
          <rect
            x="585"
            y="600"
            width="10"
            height="28"
            rx="1"
            fill="#60a5fa"
            opacity="0.5"
          />
          <rect
            x="598"
            y="606"
            width="10"
            height="22"
            rx="1"
            fill="#3b82f6"
            opacity="0.6"
          />
          <rect
            x="400"
            y="688"
            width="70"
            height="12"
            rx="2"
            fill="#1d4ed8"
            opacity="0.8"
          />
          <rect
            x="403"
            y="678"
            width="64"
            height="12"
            rx="2"
            fill="#2563eb"
            opacity="0.7"
          />
          <rect
            x="406"
            y="668"
            width="58"
            height="12"
            rx="2"
            fill="#3b82f6"
            opacity="0.6"
          />
          <line
            x1="400"
            y1="688"
            x2="400"
            y2="700"
            stroke="#93c5fd"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="403"
            y1="678"
            x2="403"
            y2="690"
            stroke="#93c5fd"
            strokeWidth="1"
            opacity="0.4"
          />
          <rect
            x="485"
            y="706"
            width="52"
            height="5"
            rx="2"
            fill="#60a5fa"
            opacity="0.6"
          />
          <polygon
            points="537,706 537,711 544,708.5"
            fill="#93c5fd"
            opacity="0.7"
          />
          <rect
            x="660"
            y="682"
            width="28"
            height="30"
            rx="4"
            fill="#1e40af"
            opacity="0.8"
          />
          <path
            d="M688,692 Q700,692 700,704 Q700,716 688,716"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M669,678 Q672,670 669,662"
            stroke="#93c5fd"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M676,676 Q679,668 676,660"
            stroke="#93c5fd"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
          <rect
            x="700"
            y="680"
            width="80"
            height="8"
            rx="3"
            fill="#1e3a8a"
            opacity="0.7"
          />
          <rect
            x="776"
            y="640"
            width="8"
            height="48"
            rx="2"
            fill="#1e3a8a"
            opacity="0.6"
          />
          <rect
            x="702"
            y="710"
            width="6"
            height="30"
            rx="2"
            fill="#1e3a8a"
            opacity="0.6"
          />
          <rect
            x="772"
            y="710"
            width="6"
            height="30"
            rx="2"
            fill="#1e3a8a"
            opacity="0.6"
          />
          <rect
            x="718"
            y="620"
            width="44"
            height="62"
            rx="8"
            fill="#1e40af"
            opacity="0.75"
          />
          <circle cx="740" cy="600" r="22" fill="#1e40af" opacity="0.75" />
          <path
            d="M718,650 Q700,660 695,690"
            stroke="#1e40af"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M762,650 Q775,660 778,688"
            stroke="#1e40af"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
          <rect
            x="105"
            y="590"
            width="50"
            height="75"
            rx="8"
            fill="#1e40af"
            opacity="0.6"
          />
          <circle cx="130" cy="572" r="24" fill="#1e40af" opacity="0.6" />
          <path
            d="M105,620 Q85,630 78,650"
            stroke="#1e40af"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <rect
            x="60"
            y="646"
            width="36"
            height="46"
            rx="3"
            fill="#2563eb"
            opacity="0.55"
          />
          <rect
            x="60"
            y="646"
            width="5"
            height="46"
            rx="2"
            fill="#1d4ed8"
            opacity="0.6"
          />
          <path
            d="M155,615 Q175,590 185,565"
            stroke="#1e40af"
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <rect
            x="108"
            y="663"
            width="18"
            height="50"
            rx="5"
            fill="#1e3a8a"
            opacity="0.6"
          />
          <rect
            x="132"
            y="663"
            width="18"
            height="50"
            rx="5"
            fill="#1e3a8a"
            opacity="0.6"
          />
          <g transform="translate(290,130) rotate(-8)">
            <rect
              x="0"
              y="0"
              width="90"
              height="62"
              rx="4"
              fill="#1e40af"
              opacity="0.45"
            />
            <rect
              x="0"
              y="0"
              width="44"
              height="62"
              rx="4"
              fill="#2563eb"
              opacity="0.35"
            />
            <line
              x1="45"
              y1="0"
              x2="45"
              y2="62"
              stroke="#93c5fd"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1="8"
              y1="15"
              x2="38"
              y2="15"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.4"
            />
            <line
              x1="8"
              y1="24"
              x2="38"
              y2="24"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.3"
            />
            <line
              x1="8"
              y1="33"
              x2="30"
              y2="33"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.25"
            />
            <line
              x1="52"
              y1="15"
              x2="82"
              y2="15"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.4"
            />
            <line
              x1="52"
              y1="24"
              x2="82"
              y2="24"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.3"
            />
            <line
              x1="52"
              y1="33"
              x2="74"
              y2="33"
              stroke="#bfdbfe"
              strokeWidth="2"
              opacity="0.25"
            />
          </g>
          <g transform="translate(560,140) rotate(5)" opacity="0.35">
            <rect x="0" y="0" width="110" height="44" rx="8" fill="#1e40af" />
            <text
              x="10"
              y="28"
              fontFamily="monospace"
              fontSize="16"
              fill="#93c5fd"
            >
              E = mc²
            </text>
          </g>
          <g transform="translate(180,200)" opacity="0.4">
            <polygon points="30,0 60,14 30,28 0,14" fill="#2563eb" />
            <rect x="24" y="14" width="12" height="18" rx="2" fill="#1d4ed8" />
            <line
              x1="54"
              y1="14"
              x2="62"
              y2="30"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="62" cy="32" r="4" fill="#60a5fa" />
          </g>
          <g transform="translate(620,280)" opacity="0.35">
            <circle cx="20" cy="18" r="16" fill="#2563eb" />
            <path
              d="M14,24 Q14,32 20,32 Q26,32 26,24"
              stroke="#93c5fd"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="16"
              y1="34"
              x2="24"
              y2="34"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="17"
              y1="38"
              x2="23"
              y2="38"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="2"
              x2="20"
              y2="6"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="8"
              x2="9"
              y2="11"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="34"
              y1="8"
              x2="31"
              y2="11"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>

        <div className={estilo.conteudoEsquerdo}>
          <div className={estilo.marca}>
            <img src={logo} alt="Learnly" className={estilo.logo} />
          </div>
          <div className={estilo.etiqueta}>Plataforma ENEM</div>
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
      </div>
    </div>
  );
};

export default Login;
