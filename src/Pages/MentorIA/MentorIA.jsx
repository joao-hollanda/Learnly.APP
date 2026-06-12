import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import { FaPaperPlane } from "react-icons/fa";
import {
  FaChartBar,
  FaCalendarAlt,
  FaCrosshairs,
  FaTrash,
  FaPlus,
  FaExchangeAlt,
  FaClock,
  FaBookOpen,
} from "react-icons/fa";
import { LuSparkles, LuRotateCcw } from "react-icons/lu";
import style from "./_mentorIA.module.css";
import IAAPI from "../../services/IAService";
import ModalAcaoMentor from "../../components/Modais/MentorIA/ModalAcaoMentor";
import { registrarEvento } from "../../utils/analytics";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useQueryClient } from "@tanstack/react-query";

const PROTOCOLOS = [
  { icone: <FaChartBar />, texto: "Como estou indo nos simulados?" },
  { icone: <FaCalendarAlt />, texto: "Qual é meu plano de estudo atual?" },
  { icone: <FaCrosshairs />, texto: "Quais são meus pontos fracos?" },
  { icone: <FaBookOpen />, texto: "Quero revisar questões que errei" },
  { icone: <FaPlus />, texto: "Adicionar matéria ao plano", acao: "adicionar" },
  { icone: <FaTrash />, texto: "Remover matéria do plano", acao: "remover" },
  { icone: <FaExchangeAlt />, texto: "Substituir uma matéria", acao: "substituir" },
  { icone: <FaClock />, texto: "Ajustar carga horária", acao: "carga" },
];

const SESSAO_KEY = "mentorSessao";

const horaAgora = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Groq costuma emitir LaTeX com \( \) e \[ \] — remark-math só entende $ e $$
const normalizarMatematica = (texto = "") =>
  texto
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`);

function MentorIA() {
  const queryClient = useQueryClient();

  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSAO_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [digitandoIA, setDigitandoIA] = useState(false);
  const [acaoModal, setAcaoModal] = useState(null);

  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const ocupado = carregandoIA || digitandoIA;
  const totalPerguntas = conversa.filter((m) => m.autor === "aluno").length;

  const dataLonga = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const dataCurta = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const escreverTextoAosPoucos = (texto, callback, velocidade = 16) => {
    let i = 0;
    setDigitandoIA(true);

    const interval = setInterval(() => {
      i = Math.min(i + 2, texto.length);
      callback(texto.slice(0, i));

      if (i >= texto.length) {
        clearInterval(interval);
        setDigitandoIA(false);
      }
    }, velocidade);
  };

  const processarResposta = (resposta) => {
    const respostaIA = resposta.resposta;

    // Invalida planos se a IA criou/modificou algo
    const keywords = [
      "criado",
      "ativado",
      "removida",
      "adicionada",
      "substituída",
      "reajustada",
      "estendido",
    ];
    if (keywords.some((k) => respostaIA?.toLowerCase().includes(k))) {
      queryClient.invalidateQueries({
        queryKey: ["planos"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["planoAtivo"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["resumo"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardDesempenho"],
        refetchType: "active",
      });
    }

    setConversa((prev) =>
      prev
        .filter((m) => m.tipo !== "loading")
        .concat({ autor: "ia", texto: "", hora: horaAgora() }),
    );
    escreverTextoAosPoucos(respostaIA, (textoParcial) => {
      setConversa((prev) => {
        const nova = [...prev];
        nova[nova.length - 1] = { ...nova[nova.length - 1], texto: textoParcial };
        return nova;
      });
    });
  };

  const enviarMensagem = async (textoPergunta) => {
    const pergunta = textoPergunta ?? mensagem;
    if (!pergunta.trim() || ocupado) return;

    setMensagem("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setCarregandoIA(true);
    registrarEvento("mentor_mensagem", { viaAtalho: textoPergunta != null });

    setConversa((prev) => [
      ...prev,
      { autor: "aluno", texto: pergunta, hora: horaAgora() },
      { autor: "ia", tipo: "loading", hora: horaAgora() },
    ]);

    try {
      const mensagensParaIA = [
        ...conversa
          .filter((m) => m.texto)
          .map((m) => ({
            role: m.autor === "aluno" ? "user" : "assistant",
            content: m.texto,
          })),
        { role: "user", content: pergunta },
      ];

      const resposta = await IAAPI.EnviarMensagem({
        Mensagens: mensagensParaIA,
      });
      processarResposta(resposta);
    } catch {
      setConversa((prev) =>
        prev
          .filter((m) => m.tipo !== "loading")
          .concat({
            autor: "ia",
            texto: "Ocorreu um erro ao falar com a IA. Tente novamente.",
            hora: horaAgora(),
          }),
      );
    } finally {
      setCarregandoIA(false);
    }
  };

  const usarProtocolo = (p) => {
    if (ocupado) return;
    if (p.acao) setAcaoModal(p.acao);
    else enviarMensagem(p.texto);
  };

  const novaSessao = () => {
    if (ocupado) return;
    setConversa([]);
    setMensagem("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversa]);

  useEffect(() => {
    const finalizadas = conversa.filter((m) => m.tipo !== "loading");
    if (finalizadas.length > 0)
      localStorage.setItem(SESSAO_KEY, JSON.stringify(finalizadas));
    else localStorage.removeItem(SESSAO_KEY);
  }, [conversa]);

  return (
    <div className={style.page}>
      <Header />

      <div className={style.layout}>
        <aside className={style.rail}>
          <div className={style.railMast}>
            <span className={style.railKicker}>Mentoria · IA</span>
            <h1 className={style.railTitulo}>Sessão de estudo</h1>
            <p className={style.railData}>{dataLonga}</p>
          </div>

          <div className={style.railStats}>
            <div className={style.railStat}>
              <span className={style.railStatLabel}>Perguntas</span>
              <span className={style.railStatValor}>
                {String(totalPerguntas).padStart(2, "0")}
              </span>
            </div>
            <div className={style.railStat}>
              <span className={style.railStatLabel}>Mentor</span>
              <span className={style.railStatValor}>
                <span
                  className={`${style.statusDot} ${ocupado ? style.statusDotOcupado : ""}`}
                />
                {carregandoIA
                  ? "Consultando"
                  : digitandoIA
                    ? "Escrevendo"
                    : "Em linha"}
              </span>
            </div>
          </div>

          <div className={style.protocolos}>
            <span className={style.protLabel}>Atalhos da sessão</span>
            {PROTOCOLOS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={style.protocolo}
                onClick={() => usarProtocolo(p)}
                disabled={ocupado}
              >
                <span className={style.protNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={style.protTexto}>{p.texto}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={style.novaSessao}
            onClick={novaSessao}
            disabled={ocupado || conversa.length === 0}
          >
            <LuRotateCcw /> Nova sessão
          </button>
        </aside>

        <main className={style.transcript}>
          <div className={style.transcriptHead}>
            <span className="eyebrow">Transcrição da sessão</span>
            <span className={style.transcriptIndice}>
              {dataCurta} · {String(conversa.length).padStart(2, "0")} registros
            </span>
          </div>

          <div className={style.corpoChat} ref={chatRef}>
            {conversa.length === 0 && (
              <div className={style.vazio}>
                <span className={style.vazioIcone}>
                  <LuSparkles />
                </span>
                <h2 className={style.vazioTitulo}>
                  O que vamos estudar hoje?
                </h2>
                <p className={style.vazioTexto}>
                  O Mentor conhece seus planos, simulados e desempenho. Faça
                  uma pergunta abaixo ou use um atalho da sessão — cada
                  resposta entra na transcrição.
                </p>
              </div>
            )}

            {conversa.map((msg, index) => {
              const mentor = msg.autor === "ia";
              const ultima = index === conversa.length - 1;
              return (
                <article key={index} className={style.turno}>
                  <div className={style.turnoMeta}>
                    <span className={style.turnoNum}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`${style.turnoAutor} ${mentor ? style.turnoAutorMentor : ""}`}
                    >
                      {mentor ? (
                        <>
                          <LuSparkles /> Mentor
                        </>
                      ) : (
                        "Você"
                      )}
                    </span>
                    <span className={style.turnoLinha} />
                    <span className={style.turnoHora}>{msg.hora}</span>
                  </div>

                  {msg.tipo === "loading" ? (
                    <div className={style.consultando}>
                      Consultando seus dados
                      <span className={style.pontos}>
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${style.corpo} ${!mentor ? style.corpoPergunta : ""} ${
                        mentor && ultima && digitandoIA ? style.digitando : ""
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[[rehypeKatex, { errorColor: "#64748b" }]]}
                      >
                        {normalizarMatematica(msg.texto)}
                      </ReactMarkdown>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className={style.chipsMobile}>
            {PROTOCOLOS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={style.chipMobile}
                onClick={() => usarProtocolo(p)}
                disabled={ocupado}
              >
                {p.icone} {p.texto}
              </button>
            ))}
          </div>

          <div className={style.prompt}>
            <div className={style.promptMeta}>
              <span className={style.promptLabel}>Pergunta ao mentor</span>
              <span className={style.promptHint}>
                Enter envia · Shift+Enter quebra linha
              </span>
            </div>
            <div className={style.promptLinha}>
              <span className={style.caret}>›</span>
              <textarea
                ref={inputRef}
                className={style.input}
                placeholder="Escreva sua pergunta..."
                value={mensagem}
                disabled={ocupado}
                rows={1}
                onChange={(e) => {
                  setMensagem(e.target.value);
                  autoResize(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem();
                  }
                }}
              />
              <button
                type="button"
                className={style.enviar}
                onClick={() => enviarMensagem()}
                disabled={ocupado}
                aria-label="Enviar pergunta"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </main>
      </div>

      <ModalAcaoMentor
        show={!!acaoModal}
        acao={acaoModal}
        onHide={() => setAcaoModal(null)}
        onEnviar={(texto) => {
          setAcaoModal(null);
          enviarMensagem(texto);
        }}
      />
    </div>
  );
}

export default MentorIA;
