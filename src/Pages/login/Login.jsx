import { useState, useRef } from "react";
import style from "./_login.module.css";
import Button from "../../components/Button/Button";
import login from "../../img/Learnly.png";
import service from "../../services/LoginService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ initialPage }) => {
  const [isLogin, setIsLogin] = useState(initialPage === "login");

  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();

  function resetFields() {
    setUsuario("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
  }

  function handleToggle(e) {
    e && e.preventDefault();
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
    setLoading(true);
    e.preventDefault();

    try {
      if (isLogin) {
        if (!email || !senha) return toast("Preencha todos os campos!");
        try {
          const response = await service.Login(email, senha);
          sessionStorage.setItem("token", response);
          navigate("/home");
        } catch (error) {
          if (error.response) {
            toast("Usuário ou senha incorretos!");
          } else {
            toast("Erro ao conectar ao servidor.");
            console.log(error);
          }
        }
      } else {
        if (!email || !senha || !usuario || !confirmarSenha)
          return toast("Preencha todos os campos!");

        if (senha !== confirmarSenha) return toast("As senhas não coincidem");

        try {
          await service.Register(usuario, email, senha);
          toast("Usuario criado com sucesso!");
          await setTimeout(4500);
          window.location.reload();
        } catch (err) {
          toast(err.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
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
                    <input
                      type="password"
                      placeholder="Senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <button
                      className={style.botaoEnviar}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? <span className={style.spinner} /> : "Entrar"}
                    </button>
                    <p>
                      Não tem uma conta?{" "}
                      <a href="#" onClick={handleToggle}>
                        Cadastre-se
                      </a>
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
                    <input
                      type="password"
                      placeholder="Senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Confirmar senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                    <button
                      className={style.botaoEnviar}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? <span className={style.spinner} /> : "Cadastrar"}
                    </button>

                    <p>
                      Já tem uma conta?{" "}
                      <a href="#" onClick={handleToggle}>
                        Entrar
                      </a>
                    </p>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
