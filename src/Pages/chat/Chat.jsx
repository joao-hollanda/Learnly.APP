import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  LuSend,
  LuPlus,
  LuUsers,
  LuMessageSquare,
  LuClipboardList,
  LuFileText,
  LuSparkles,
  LuArrowLeft,
} from "react-icons/lu";
import Header from "../../components/Header/Header";
import ChatAPI from "../../services/ChatService";
import PlanoAPI from "../../services/PlanoService";
import { getApiError } from "../../services/client";
import {
  iniciarChat,
  enviarMensagemHub,
  entrarConversaHub,
  marcarLidaHub,
  onReceberMensagem,
  offReceberMensagem,
} from "../../services/chatHub";
import ModalCompartilhar from "../../components/Modais/Chat/ModalCompartilhar";
import ModalVerSessaoIA from "../../components/Modais/Chat/ModalVerSessaoIA";
import ModalPreviewSimulado from "../../components/Modais/Simulados/ModalPreviewResultado";
import style from "./_chat.module.css";

const TIPO = { TEXTO: 0, PLANO: 1, SIMULADO: 2, SESSAO_IA: 3 };
const CONVERSA_GRUPO = 1;

const iniciais = (nome = "?") =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

const hora = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const parseAnexo = (payload) => {
  try {
    return payload ? JSON.parse(payload) : null;
  } catch {
    return null;
  }
};

const mapaRespostas = (s) => {
  const map = {};
  (s?.respostas ?? []).forEach((r) => {
    map[r.questaoId] = r.alternativaId;
  });
  return map;
};

function Chat() {
  const meuId = Number(sessionStorage.getItem("id"));
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const conversaIdUrl = searchParams.get("conversaId");
  const [activeId, setActiveId] = useState(
    conversaIdUrl ? Number(conversaIdUrl) : null,
  );
  const [detalhe, setDetalhe] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [modalShare, setModalShare] = useState(false);
  const [sessaoView, setSessaoView] = useState(null);
  const [simuladoView, setSimuladoView] = useState(null);

  const activeIdRef = useRef(activeId);
  const chatRef = useRef(null);

  const { data: conversas = [] } = useQuery({
    queryKey: ["conversas"],
    queryFn: ChatAPI.ListarConversas,
  });

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const handler = (msg) => {
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      if (Number(msg.conversaId) !== activeIdRef.current) return;
      setMensagens((prev) =>
        prev.some((m) => m.mensagemId === msg.mensagemId) ? prev : [...prev, msg],
      );
      marcarLidaHub(msg.conversaId).catch(() => {});
    };

    iniciarChat().catch(() =>
      toast.error("Não foi possível conectar ao chat em tempo real."),
    );
    onReceberMensagem(handler);

    return () => {
      offReceberMensagem(handler);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!activeId) {
      setDetalhe(null);
      setMensagens([]);
      return;
    }

    let ativo = true;
    (async () => {
      try {
        const [d, msgs] = await Promise.all([
          ChatAPI.ObterConversa(activeId),
          ChatAPI.ListarMensagens(activeId),
        ]);
        if (!ativo) return;
        setDetalhe(d);
        setMensagens(msgs);
        await entrarConversaHub(activeId);
        await marcarLidaHub(activeId);
        queryClient.invalidateQueries({ queryKey: ["conversas"] });
      } catch (e) {
        toast.error(getApiError(e));
      }
    })();

    return () => {
      ativo = false;
    };
  }, [activeId, queryClient]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mensagens]);

  const selecionar = (id) => {
    setActiveId(id);
    setSearchParams({ conversaId: id });
  };

  const voltar = () => {
    setActiveId(null);
    setSearchParams({});
  };

  const enviar = async () => {
    const t = texto.trim();
    if (!t || !activeId) return;
    setTexto("");
    try {
      await enviarMensagemHub(activeId, { texto: t, tipo: TIPO.TEXTO });
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    }
  };

  const compartilhar = async (tipo, payload) => {
    if (!activeId) return;
    await enviarMensagemHub(activeId, {
      texto: null,
      tipo,
      anexoRefId: payload.planoId ?? payload.simuladoId ?? null,
      anexoPayload: JSON.stringify(payload),
    });
  };

  const resgatarPlano = async (chave) => {
    try {
      await PlanoAPI.Resgatar(chave);
      toast.success("Plano adicionado aos seus planos!");
      queryClient.invalidateQueries({ queryKey: ["planos"] });
    } catch (e) {
      toast.error(getApiError(e));
    }
  };

  const renderAnexo = (m, minha) => {
    const anexo = parseAnexo(m.anexoPayload);
    if (!anexo) return null;

    if (m.tipo === TIPO.PLANO) {
      return (
        <div className={style.anexo}>
          <div className={style.anexoCab}>
            <LuClipboardList /> Plano de estudo
          </div>
          <strong className={style.anexoTitulo}>{anexo.titulo}</strong>
          {anexo.objetivo && <p className={style.anexoSub}>{anexo.objetivo}</p>}
          {!minha && anexo.chave && (
            <button
              className={style.anexoBtn}
              onClick={() => resgatarPlano(anexo.chave)}
            >
              Adicionar aos meus planos
            </button>
          )}
        </div>
      );
    }

    if (m.tipo === TIPO.SIMULADO) {
      const totalQ =
        anexo.questoes?.length ?? anexo.desempenho?.quantidadeDeQuestoes ?? 0;
      return (
        <div className={style.anexo}>
          <div className={style.anexoCab}>
            <LuFileText /> Simulado
          </div>
          <strong className={style.anexoTitulo}>
            Nota {anexo.notaFinal?.toFixed(1)} / 10
          </strong>
          {totalQ > 0 && (
            <p className={style.anexoSub}>
              {totalQ} {totalQ === 1 ? "questão" : "questões"}
            </p>
          )}
          {anexo.questoes?.length > 0 && (
            <button
              className={style.anexoBtn}
              onClick={() => setSimuladoView(anexo)}
            >
              Ver respostas
            </button>
          )}
        </div>
      );
    }

    if (m.tipo === TIPO.SESSAO_IA) {
      return (
        <div className={style.anexo}>
          <div className={style.anexoCab}>
            <LuSparkles /> Conversa com a IA
          </div>
          <strong className={style.anexoTitulo}>{anexo.titulo}</strong>
          <p className={style.anexoSub}>
            {anexo.mensagens?.length ?? 0} mensagens
          </p>
          <button className={style.anexoBtn} onClick={() => setSessaoView(anexo)}>
            Ver conversa
          </button>
        </div>
      );
    }

    return null;
  };

  const renderMensagem = (m) => {
    const minha = m.remetenteId === meuId;
    const ehGrupo = detalhe?.tipo === CONVERSA_GRUPO;

    return (
      <div
        key={m.mensagemId}
        className={`${style.linha} ${minha ? style.linhaMinha : ""}`}
      >
        <div className={`${style.bolha} ${minha ? style.bolhaMinha : ""}`}>
          {ehGrupo && !minha && (
            <span className={style.remetente}>{m.remetenteNome}</span>
          )}
          {m.tipo === TIPO.TEXTO ? (
            <p className={style.txt}>{m.texto}</p>
          ) : (
            renderAnexo(m, minha)
          )}
          <span className={style.horaMsg}>{hora(m.dataEnvio)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`page ${style.pageChat}`}>
      <Header />

      <div className={style.shell}>
        <aside
          className={`${style.lista} ${activeId ? style.ocultoMobile : ""}`}
        >
          <div className={style.listaHead}>
            <span className="eyebrow">Chat</span>
            <h1 className={style.listaTitulo}>Conversas</h1>
          </div>

          <div className={style.conversas}>
            {conversas.length === 0 ? (
              <p className={style.vazio}>
                Nenhuma conversa ainda. Vá em <strong>Amigos</strong> para começar.
              </p>
            ) : (
              conversas.map((c) => (
                <button
                  key={c.conversaId}
                  className={`${style.conversaItem} ${
                    activeId === c.conversaId ? style.conversaAtiva : ""
                  }`}
                  onClick={() => selecionar(c.conversaId)}
                >
                  <span
                    className={`${style.cAvatar} ${
                      c.tipo === CONVERSA_GRUPO ? style.cAvatarGrupo : ""
                    }`}
                  >
                    {c.tipo === CONVERSA_GRUPO ? <LuUsers /> : iniciais(c.titulo)}
                  </span>
                  <span className={style.cInfo}>
                    <strong>{c.titulo}</strong>
                    <small>{c.ultimaMensagem ?? "Sem mensagens"}</small>
                  </span>
                  {c.naoLidas > 0 && (
                    <span className={style.badge}>{c.naoLidas}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className={`${style.main} ${activeId ? "" : style.ocultoMobile}`}
        >
          {!activeId ? (
            <div className={style.placeholder}>
              <LuMessageSquare />
              <p>Selecione uma conversa para começar</p>
            </div>
          ) : (
            <>
              <header className={style.convHead}>
                <button className={style.voltar} onClick={voltar}>
                  <LuArrowLeft />
                </button>
                <span
                  className={`${style.cAvatar} ${
                    detalhe?.tipo === CONVERSA_GRUPO ? style.cAvatarGrupo : ""
                  }`}
                >
                  {detalhe?.tipo === CONVERSA_GRUPO ? (
                    <LuUsers />
                  ) : (
                    iniciais(detalhe?.titulo)
                  )}
                </span>
                <div className={style.convHeadInfo}>
                  <strong>{detalhe?.titulo ?? "…"}</strong>
                  {detalhe?.tipo === CONVERSA_GRUPO && (
                    <small>{detalhe?.membros?.length ?? 0} membros</small>
                  )}
                </div>
              </header>

              <div className={style.mensagens} ref={chatRef}>
                {mensagens.map(renderMensagem)}
              </div>

              <div className={style.composer}>
                <button
                  className={style.attach}
                  onClick={() => setModalShare(true)}
                  title="Compartilhar plano, simulado ou conversa com a IA"
                >
                  <LuPlus />
                </button>
                <input
                  className={style.composerInput}
                  placeholder="Escreva uma mensagem…"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviar();
                    }
                  }}
                />
                <button
                  className={style.send}
                  onClick={enviar}
                  disabled={!texto.trim()}
                >
                  <LuSend />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <ModalCompartilhar
        show={modalShare}
        onHide={() => setModalShare(false)}
        onCompartilhar={compartilhar}
      />
      <ModalVerSessaoIA
        show={!!sessaoView}
        onHide={() => setSessaoView(null)}
        sessao={sessaoView}
      />
      <ModalPreviewSimulado
        simuladoPreview={simuladoView}
        previewRespostas={simuladoView ? mapaRespostas(simuladoView) : {}}
        onHide={() => setSimuladoView(null)}
      />
    </div>
  );
}

export default Chat;
