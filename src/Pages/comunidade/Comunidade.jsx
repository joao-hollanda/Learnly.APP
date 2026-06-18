import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  LuUserPlus,
  LuUsers,
  LuMessageSquare,
  LuCheck,
  LuX,
  LuTrash2,
  LuCopy,
  LuLogOut,
  LuPlus,
  LuDoorOpen,
} from "react-icons/lu";
import Header from "../../components/Header/Header";
import AmizadeAPI from "../../services/AmizadeService";
import GrupoAPI from "../../services/GrupoService";
import ChatAPI from "../../services/ChatService";
import { getApiError } from "../../services/client";
import style from "./_comunidade.module.css";

const iniciais = (nome = "?") =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

function Comunidade() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [emailAmigo, setEmailAmigo] = useState("");
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [descGrupo, setDescGrupo] = useState("");
  const [chaveGrupo, setChaveGrupo] = useState("");

  const { data: amigos = [], isLoading: carregandoAmigos } = useQuery({
    queryKey: ["amigos"],
    queryFn: AmizadeAPI.ListarAmigos,
  });

  const { data: pendentes = [] } = useQuery({
    queryKey: ["amizadesPendentes"],
    queryFn: AmizadeAPI.ListarPendentes,
  });

  const { data: grupos = [], isLoading: carregandoGrupos } = useQuery({
    queryKey: ["grupos"],
    queryFn: GrupoAPI.ListarMeus,
  });

  const invalidarAmizades = () => {
    queryClient.invalidateQueries({ queryKey: ["amigos"] });
    queryClient.invalidateQueries({ queryKey: ["amizadesPendentes"] });
  };

  const solicitar = useMutation({
    mutationFn: () => AmizadeAPI.Solicitar(emailAmigo.trim()),
    onSuccess: () => {
      toast.success("Solicitação enviada!");
      setEmailAmigo("");
      invalidarAmizades();
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const aceitar = useMutation({
    mutationFn: (id) => AmizadeAPI.Aceitar(id),
    onSuccess: () => {
      toast.success("Amizade aceita!");
      invalidarAmizades();
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const recusar = useMutation({
    mutationFn: (id) => AmizadeAPI.Recusar(id),
    onSuccess: invalidarAmizades,
    onError: (e) => toast.error(getApiError(e)),
  });

  const remover = useMutation({
    mutationFn: (id) => AmizadeAPI.Remover(id),
    onSuccess: () => {
      toast.success("Amizade removida.");
      invalidarAmizades();
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const criarGrupo = useMutation({
    mutationFn: () => GrupoAPI.Criar(nomeGrupo.trim(), descGrupo.trim()),
    onSuccess: () => {
      toast.success("Grupo criado!");
      setNomeGrupo("");
      setDescGrupo("");
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const entrarGrupo = useMutation({
    mutationFn: () => GrupoAPI.Entrar(chaveGrupo.trim()),
    onSuccess: () => {
      toast.success("Você entrou no grupo!");
      setChaveGrupo("");
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const sairGrupo = useMutation({
    mutationFn: (id) => GrupoAPI.Sair(id),
    onSuccess: () => {
      toast.success("Você saiu do grupo.");
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const conversar = async (amigoId) => {
    try {
      const { conversaId } = await ChatAPI.IniciarDireta(amigoId);
      navigate(`/chat?conversaId=${conversaId}`);
    } catch (e) {
      toast.error(getApiError(e));
    }
  };

  const copiarChave = (chave) => {
    navigator.clipboard?.writeText(chave);
    toast.success("Código copiado!");
  };

  return (
    <div className={`page ${style.pageComunidade}`}>
      <Header />

      <div className={style.container}>
        <header className={style.pageHead}>
          <div>
            <span className="eyebrow">Comunidade</span>
            <h1 className={style.pageTitle}>Amigos & grupos</h1>
            <p className={style.pageSub}>
              Estude junto: adicione amigos, crie grupos e converse em tempo real.
            </p>
          </div>
        </header>

        <div className={style.grid}>
          <section className={style.col}>
            <div className={style.panel}>
              <div className={style.panelHead}>
                <LuUserPlus />
                <h2>Adicionar amigo</h2>
              </div>
              <form
                className={style.inlineForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailAmigo.trim()) solicitar.mutate();
                }}
              >
                <input
                  className={style.input}
                  placeholder="E-mail ou nome do usuário"
                  value={emailAmigo}
                  onChange={(e) => setEmailAmigo(e.target.value)}
                />
                <button
                  type="submit"
                  className={style.btnPrimario}
                  disabled={solicitar.isPending || !emailAmigo.trim()}
                >
                  Enviar
                </button>
              </form>
            </div>

            {pendentes.length > 0 && (
              <div className={style.panel}>
                <div className={style.panelHead}>
                  <LuMessageSquare />
                  <h2>Solicitações recebidas</h2>
                  <span className={style.contador}>{pendentes.length}</span>
                </div>
                <ul className={style.lista}>
                  {pendentes.map((p) => (
                    <li key={p.amizadeId} className={style.linha}>
                      <span className={style.avatar}>{iniciais(p.nome)}</span>
                      <div className={style.linhaInfo}>
                        <strong>{p.nome}</strong>
                        <span>{p.email}</span>
                      </div>
                      <div className={style.linhaAcoes}>
                        <button
                          className={style.btnIconeOk}
                          title="Aceitar"
                          onClick={() => aceitar.mutate(p.amizadeId)}
                        >
                          <LuCheck />
                        </button>
                        <button
                          className={style.btnIconeNo}
                          title="Recusar"
                          onClick={() => recusar.mutate(p.amizadeId)}
                        >
                          <LuX />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={style.panel}>
              <div className={style.panelHead}>
                <LuUsers />
                <h2>Meus amigos</h2>
                <span className={style.contador}>{amigos.length}</span>
              </div>
              {carregandoAmigos ? (
                <p className={style.vazio}>Carregando…</p>
              ) : amigos.length === 0 ? (
                <p className={style.vazio}>
                  Você ainda não tem amigos. Adicione pelo e-mail acima.
                </p>
              ) : (
                <ul className={style.lista}>
                  {amigos.map((a) => (
                    <li key={a.usuarioId} className={style.linha}>
                      <span className={style.avatar}>{iniciais(a.nome)}</span>
                      <div className={style.linhaInfo}>
                        <strong>{a.nome}</strong>
                        <span>{a.email}</span>
                      </div>
                      <div className={style.linhaAcoes}>
                        <button
                          className={style.btnSecundario}
                          onClick={() => conversar(a.usuarioId)}
                        >
                          <LuMessageSquare /> Conversar
                        </button>
                        <button
                          className={style.btnIconeNo}
                          title="Remover amizade"
                          onClick={() => remover.mutate(a.amizadeId)}
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className={style.col}>
            <div className={style.panel}>
              <div className={style.panelHead}>
                <LuPlus />
                <h2>Criar grupo</h2>
              </div>
              <form
                className={style.formColuna}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nomeGrupo.trim()) criarGrupo.mutate();
                }}
              >
                <input
                  className={style.input}
                  placeholder="Nome do grupo"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                />
                <input
                  className={style.input}
                  placeholder="Descrição (opcional)"
                  value={descGrupo}
                  onChange={(e) => setDescGrupo(e.target.value)}
                />
                <button
                  type="submit"
                  className={style.btnPrimario}
                  disabled={criarGrupo.isPending || !nomeGrupo.trim()}
                >
                  Criar grupo
                </button>
              </form>
            </div>

            <div className={style.panel}>
              <div className={style.panelHead}>
                <LuDoorOpen />
                <h2>Entrar em um grupo</h2>
              </div>
              <form
                className={style.inlineForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chaveGrupo.trim()) entrarGrupo.mutate();
                }}
              >
                <input
                  className={`${style.input} ${style.inputMono}`}
                  placeholder="Código do grupo"
                  value={chaveGrupo}
                  onChange={(e) => setChaveGrupo(e.target.value.toUpperCase())}
                />
                <button
                  type="submit"
                  className={style.btnPrimario}
                  disabled={entrarGrupo.isPending || !chaveGrupo.trim()}
                >
                  Entrar
                </button>
              </form>
            </div>

            <div className={style.panel}>
              <div className={style.panelHead}>
                <LuUsers />
                <h2>Meus grupos</h2>
                <span className={style.contador}>{grupos.length}</span>
              </div>
              {carregandoGrupos ? (
                <p className={style.vazio}>Carregando…</p>
              ) : grupos.length === 0 ? (
                <p className={style.vazio}>
                  Você ainda não participa de nenhum grupo.
                </p>
              ) : (
                <ul className={style.lista}>
                  {grupos.map((g) => (
                    <li key={g.grupoId} className={style.grupoLinha}>
                      <div className={style.grupoTopo}>
                        <span className={`${style.avatar} ${style.avatarGrupo}`}>
                          {iniciais(g.nome)}
                        </span>
                        <div className={style.linhaInfo}>
                          <strong>{g.nome}</strong>
                          <span>
                            {g.totalMembros}{" "}
                            {g.totalMembros === 1 ? "membro" : "membros"}
                            {g.souAdmin ? " · Admin" : ""}
                          </span>
                        </div>
                      </div>
                      {g.descricao && (
                        <p className={style.grupoDesc}>{g.descricao}</p>
                      )}
                      <div className={style.grupoAcoes}>
                        <button
                          className={style.btnSecundario}
                          onClick={() => navigate(`/chat?conversaId=${g.conversaId}`)}
                        >
                          <LuMessageSquare /> Abrir chat
                        </button>
                        <button
                          className={style.chip}
                          onClick={() => copiarChave(g.chave)}
                          title="Copiar código de convite"
                        >
                          <LuCopy /> {g.chave}
                        </button>
                        <button
                          className={style.btnIconeNo}
                          title="Sair do grupo"
                          onClick={() => sairGrupo.mutate(g.grupoId)}
                        >
                          <LuLogOut />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Comunidade;
