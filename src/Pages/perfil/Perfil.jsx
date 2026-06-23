import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import {
  LuCamera,
  LuTrash2,
  LuUser,
  LuLock,
  LuEye,
  LuEyeOff,
  LuShieldCheck,
  LuShieldAlert,
  LuCalendarDays,
  LuFileText,
  LuClipboardList,
  LuTriangleAlert,
} from "react-icons/lu";
import Header from "../../components/Header/Header";
import Avatar from "../../components/Avatar/Avatar";
import ModalBase from "../../components/Modais/ModalBase";
import EditorFotoModal from "../../components/EditorFoto/EditorFotoModal";
import style from "./_perfil.module.css";
import UsuarioAPI from "../../services/UsuarioService";
import SimuladoAPI from "../../services/SimuladoService";
import PlanoAPI from "../../services/PlanoService";
import { getUserData } from "../../utils/cookieHelper";
import { getApiError } from "../../services/client";
import {
  emailValido,
  senhaValida,
  REGRA_SENHA_MSG,
} from "../../utils/validacao";
import { stopTokenRefresh } from "../../utils/tokenRefresh";
import { pararChat } from "../../services/chatHub";
import { limparIdentidade } from "../../utils/analytics";
import LoginAPI from "../../services/LoginService";

const formatarData = (iso) => {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const CampoSenha = ({ id, rotulo, valor, aoAlterar }) => {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className={style.campo}>
      <label htmlFor={id}>{rotulo}</label>
      <div className={style.inputWrap}>
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          className={style.input}
          placeholder="••••••••"
          value={valor}
          onChange={aoAlterar}
          autoComplete="off"
        />
        <button
          type="button"
          className={style.olho}
          onClick={() => setMostrar((s) => !s)}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
        >
          {mostrar ? <LuEyeOff /> : <LuEye />}
        </button>
      </div>
    </div>
  );
};

export default function Perfil() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const inputFoto = useRef(null);

  const { data: usuario } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: "always",
  });

  const { data: totalSimulados } = useQuery({
    queryKey: ["totalSimulados"],
    queryFn: () => SimuladoAPI.Contar(),
    staleTime: Infinity,
  });

  const { data: planos } = useQuery({
    queryKey: ["planosPerfil"],
    queryFn: () => PlanoAPI.Listar5(),
    staleTime: Infinity,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [editorUrl, setEditorUrl] = useState(null);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [desativando, setDesativando] = useState(false);
  const [modalDesativar, setModalDesativar] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome ?? "");
      setEmail(usuario.email ?? "");
    }
  }, [usuario]);

  const dadosAlterados =
    usuario && (nome.trim() !== usuario.nome || email.trim() !== usuario.email);

  const persistirFoto = async (foto) => {
    setSalvandoFoto(true);
    try {
      await UsuarioAPI.AtualizarFoto(foto);
      await queryClient.invalidateQueries({ queryKey: ["userData"] });
      toast.success(foto ? "Foto atualizada!" : "Foto removida.");
      return true;
    } catch (erro) {
      toast.error(getApiError(erro, "Não foi possível atualizar a foto."));
      return false;
    } finally {
      setSalvandoFoto(false);
    }
  };

  const aoSelecionarFoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.warn("Selecione um arquivo de imagem.");
    if (file.size > 5 * 1024 * 1024)
      return toast.warn("Imagem muito grande. O limite é 5 MB.");

    setEditorUrl(URL.createObjectURL(file));
  };

  const fecharEditor = () => {
    if (editorUrl) URL.revokeObjectURL(editorUrl);
    setEditorUrl(null);
  };

  const confirmarFoto = async (dataUrl) => {
    if (await persistirFoto(dataUrl)) fecharEditor();
  };

  const salvarDados = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return toast.warn("Informe seu nome.");
    if (!emailValido(email)) return toast.warn("Informe um e-mail válido.");

    setSalvandoDados(true);
    try {
      await UsuarioAPI.Atualizar({ nome: nome.trim(), email: email.trim() });
      await queryClient.invalidateQueries({ queryKey: ["userData"] });
      toast.success("Dados atualizados!");
    } catch (erro) {
      toast.error(getApiError(erro, "Não foi possível salvar os dados."));
    } finally {
      setSalvandoDados(false);
    }
  };

  const salvarSenha = async (e) => {
    e.preventDefault();
    if (!senhaAtual) return toast.warn("Informe sua senha atual.");
    if (!senhaValida(novaSenha)) return toast.warn(REGRA_SENHA_MSG);
    if (novaSenha !== confirmarSenha)
      return toast.warn("As senhas não coincidem.");
    if (novaSenha === senhaAtual)
      return toast.warn("A nova senha deve ser diferente da atual.");

    setSalvandoSenha(true);
    try {
      await UsuarioAPI.AtualizarSenha(senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success("Senha alterada com sucesso!");
    } catch (erro) {
      toast.error(getApiError(erro, "Não foi possível alterar a senha."));
    } finally {
      setSalvandoSenha(false);
    }
  };

  const desativarConta = async () => {
    setDesativando(true);
    try {
      await UsuarioAPI.Desativar(usuario.id);
      try {
        stopTokenRefresh();
        await pararChat();
        await LoginAPI.Logout();
      } catch {}
      limparIdentidade();
      queryClient.clear();
      sessionStorage.clear();
      localStorage.removeItem("mentorSessao");
      toast.info("Sua conta foi desativada.");
      navigate("/");
    } catch (erro) {
      toast.error(getApiError(erro, "Não foi possível desativar a conta."));
      setDesativando(false);
      setModalDesativar(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <div className={style.container}>
        <section className={style.masthead}>
          <div className={style.avatarWrap}>
            <Avatar nome={usuario?.nome} foto={usuario?.foto} size={104} />
            <button
              type="button"
              className={style.cameraBtn}
              onClick={() => inputFoto.current?.click()}
              disabled={salvandoFoto}
              aria-label="Trocar foto"
            >
              {salvandoFoto ? <span className={style.spinner} /> : <LuCamera />}
            </button>
            <input
              ref={inputFoto}
              type="file"
              accept="image/*"
              hidden
              onChange={aoSelecionarFoto}
            />
          </div>

          <div className={style.mastInfo}>
            <span className={style.kicker}>Minha conta</span>
            <h1 className={style.nomeTitulo}>{usuario?.nome || "—"}</h1>
            <p className={style.emailTexto}>{usuario?.email}</p>
            <div className={style.badges}>
              {usuario?.emailConfirmado ? (
                <span className={`${style.badge} ${style.badgeOk}`}>
                  <LuShieldCheck /> E-mail confirmado
                </span>
              ) : (
                <span className={`${style.badge} ${style.badgeAlerta}`}>
                  <LuShieldAlert /> E-mail não confirmado
                </span>
              )}
              {usuario?.foto && (
                <button
                  type="button"
                  className={style.removerFoto}
                  onClick={() => persistirFoto(null)}
                  disabled={salvandoFoto}
                >
                  <LuTrash2 /> Remover foto
                </button>
              )}
            </div>
          </div>
        </section>

        <div className={style.grid}>
          <section className={style.card}>
            <header className={style.cardHead}>
              <span className={style.cardIcon}>
                <LuUser />
              </span>
              <div>
                <h2 className={style.cardTitulo}>Dados pessoais</h2>
                <p className={style.cardSub}>Seu nome e e-mail de acesso.</p>
              </div>
            </header>

            <form className={style.form} onSubmit={salvarDados}>
              <div className={style.campo}>
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  className={style.input}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={100}
                  placeholder="Seu nome"
                />
              </div>
              <div className={style.campo}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className={style.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={150}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
                {usuario && email.trim() !== usuario.email && (
                  <span className={style.dica}>
                    Alterar o e-mail muda seu login de acesso.
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={style.botao}
                disabled={salvandoDados || !dadosAlterados}
              >
                {salvandoDados ? (
                  <span className={style.spinner} />
                ) : (
                  "Salvar alterações"
                )}
              </button>
            </form>
          </section>

          <section className={style.card}>
            <header className={style.cardHead}>
              <span className={style.cardIcon}>
                <LuLock />
              </span>
              <div>
                <h2 className={style.cardTitulo}>Segurança</h2>
                <p className={style.cardSub}>Altere a senha da sua conta.</p>
              </div>
            </header>

            <form className={style.form} onSubmit={salvarSenha}>
              <CampoSenha
                id="senha-atual"
                rotulo="Senha atual"
                valor={senhaAtual}
                aoAlterar={(e) => setSenhaAtual(e.target.value)}
              />
              <CampoSenha
                id="senha-nova"
                rotulo="Nova senha"
                valor={novaSenha}
                aoAlterar={(e) => setNovaSenha(e.target.value)}
              />
              <CampoSenha
                id="senha-confirmar"
                rotulo="Confirmar nova senha"
                valor={confirmarSenha}
                aoAlterar={(e) => setConfirmarSenha(e.target.value)}
              />
              <span className={style.dica}>{REGRA_SENHA_MSG}</span>
              <button
                type="submit"
                className={style.botao}
                disabled={salvandoSenha}
              >
                {salvandoSenha ? (
                  <span className={style.spinner} />
                ) : (
                  "Alterar senha"
                )}
              </button>
            </form>
          </section>

          <section className={style.card}>
            <header className={style.cardHead}>
              <span className={style.cardIcon}>
                <LuCalendarDays />
              </span>
              <div>
                <h2 className={style.cardTitulo}>Resumo da conta</h2>
                <p className={style.cardSub}>Sua atividade na plataforma.</p>
              </div>
            </header>

            <ul className={style.resumo}>
              <li>
                <span className={style.resumoIcon}>
                  <LuCalendarDays />
                </span>
                <div>
                  <span className={style.resumoLabel}>Membro desde</span>
                  <strong className={style.resumoValor}>
                    {formatarData(usuario?.dataCriacao)}
                  </strong>
                </div>
              </li>
              <li>
                <span className={style.resumoIcon}>
                  <LuFileText />
                </span>
                <div>
                  <span className={style.resumoLabel}>Simulados realizados</span>
                  <strong className={style.resumoValor}>
                    {totalSimulados ?? 0}
                  </strong>
                </div>
              </li>
              <li>
                <span className={style.resumoIcon}>
                  <LuClipboardList />
                </span>
                <div>
                  <span className={style.resumoLabel}>Planos de estudo</span>
                  <strong className={style.resumoValor}>
                    {planos?.length ?? 0}
                  </strong>
                </div>
              </li>
            </ul>
          </section>

          <section className={`${style.card} ${style.cardPerigo}`}>
            <header className={style.cardHead}>
              <span className={`${style.cardIcon} ${style.cardIconPerigo}`}>
                <LuTriangleAlert />
              </span>
              <div>
                <h2 className={style.cardTitulo}>Zona de perigo</h2>
                <p className={style.cardSub}>
                  Desative sua conta a qualquer momento.
                </p>
              </div>
            </header>

            <p className={style.perigoTexto}>
              Ao desativar, você perde o acesso e será desconectado. Seus dados
              são preservados — entre em contato com o suporte para reativar.
            </p>
            <button
              type="button"
              className={style.botaoPerigo}
              onClick={() => setModalDesativar(true)}
            >
              Desativar minha conta
            </button>
          </section>
        </div>
      </div>

      <EditorFotoModal
        aberto={!!editorUrl}
        src={editorUrl}
        salvando={salvandoFoto}
        onCancelar={fecharEditor}
        onConfirmar={confirmarFoto}
      />

      <ModalBase
        show={modalDesativar}
        onHide={desativando ? undefined : () => setModalDesativar(false)}
        title="Desativar conta"
        kicker="Atenção"
        iconType="danger"
        icon={<LuTriangleAlert />}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalDesativar(false)}
              disabled={desativando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={desativarConta}
              disabled={desativando}
            >
              {desativando ? (
                <span className={style.spinner} />
              ) : (
                "Desativar conta"
              )}
            </Button>
          </>
        }
      >
        Tem certeza que deseja desativar sua conta? Você será desconectado
        imediatamente.
        <br />
        <span className="modal-badge modal-badge-danger">
          Você perderá o acesso até reativá-la.
        </span>
      </ModalBase>
    </div>
  );
}
