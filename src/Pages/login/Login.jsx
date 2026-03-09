import { useState, useRef, useEffect } from "react";
import style from "./_login.module.css";
import login from "../../img/Learnly.png";
import service from "../../services/LoginService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { startTokenRefresh } from "../../utils/tokenRefresh";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();

  const isValidEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(value).toLowerCase());
  };

  const isValidPassword = (value) => {
    const password = String(value);
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])([^\s]){8,}$/;

    return regex.test(password);
  };

  function resetFields() {
    setUsuario("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setMostrarSenha(false);
    setMostrarConfirmarSenha(false);
  }

  function handleToggle(e) {
    e.preventDefault();

    const el = formRef.current;

    if (!el) {
      setIsLogin((s) => !s);
      resetFields();
      return;
    }

    el.classList.remove(style.fadeIn);
    el.classList.add(style.fadeOut);

    const timeout = 420;

    setTimeout(() => {
      setIsLogin((s) => !s);
      resetFields();

      el.classList.remove(style.fadeOut);
      el.classList.add(style.fadeIn);
    }, timeout);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !senha) return toast.warn("Preencha todos os campos!");

        if (!isValidEmail(email))
          return toast.warn("Informe um e-mail válido.");

        if (!isValidPassword(senha))
          return toast.warn(
            "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número, caractere especial e sem espaços.",
          );

        try {
          await service.Login(email, senha);

          startTokenRefresh();

          navigate("/home");
        } catch (error) {
          if (error.response) {
            toast.warning("Usuário ou senha incorretos!");
          } else {
            toast.error("Erro ao conectar ao servidor.");
          }
        }
      } else {
        if (!email || !senha || !usuario || !confirmarSenha)
          return toast.warn("Preencha todos os campos!");

        if (!isValidEmail(email))
          return toast.warn("Informe um e-mail válido.");

        if (!isValidPassword(senha))
          return toast.warn(
            "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número, caractere especial e sem espaços.",
          );

        if (senha !== confirmarSenha)
          return toast.warning("As senhas não coincidem");

        try {
          await service.Register(usuario, email, senha);

          resetFields();

          toast.success("Usuário criado com sucesso!");

          setIsLogin(true);
        } catch (err) {
          toast.error(err.response?.data || "Erro ao registrar.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const wakeApi = async () => {
      await service.Awake();
    };

    wakeApi();
  }, []);

  return (
    //#region JSX
    <div className={style.main}>
      <img src={login} alt="Learnly" className={style.loginImagem} />

      <div
        className={`${style.login} ${
          isLogin ? style.loginMode : style.registerMode
        }`}
      >
        <div className={style.container}>
          <div
            ref={formRef}
            className={`${style.formBox} ${style.fadeIn} ${
              isLogin ? style.loginMode : style.registerMode
            }`}
          >
            <h2>{isLogin ? "LOGIN" : "CADASTRO"}</h2>
            <h3>{isLogin ? "Bem vindo de volta" : "Crie sua conta"}</h3>

            <form onSubmit={handleSubmit}>
              <div>
                {isLogin ? (
                  <>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className={style.senhaWrapper}>
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                      />
                      <button
                        type="button"
                        className={style.mostrarSenhaBtn}
                        onClick={() => setMostrarSenha((prev) => !prev)}
                      >
                        {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <button
                      className={style.botaoEnviar}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <span className={style.spinner} /> : "Entrar"}
                    </button>

                    <p>
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={handleToggle}
                        className={style.link_style}
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Nome de usuário"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className={style.senhaWrapper}>
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                      />
                      <button
                        type="button"
                        className={style.mostrarSenhaBtn}
                        onClick={() => setMostrarSenha((prev) => !prev)}
                      >
                        {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <div className={style.senhaWrapper}>
                      <input
                        type={mostrarConfirmarSenha ? "text" : "password"}
                        placeholder="Confirmar Senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                      />
                      <button
                        type="button"
                        className={style.mostrarSenhaBtn}
                        onClick={() =>
                          setMostrarConfirmarSenha((prev) => !prev)
                        }
                      >
                        {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <button
                      className={style.botaoEnviar}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className={style.spinner} />
                      ) : (
                        "Cadastrar"
                      )}
                    </button>

                    <p>
                      Já tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={handleToggle}
                        className={style.link_style}
                      >
                        Entrar
                      </button>
                    </p>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    //#endregion
  );
};

export default Login;