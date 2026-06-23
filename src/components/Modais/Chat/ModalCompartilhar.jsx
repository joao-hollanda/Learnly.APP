import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LuClipboardList, LuFileText, LuSparkles, LuShare2 } from "react-icons/lu";
import { toast } from "react-toastify";
import ModalBase from "../ModalBase";
import PlanoAPI from "../../../services/PlanoService";
import SimuladoAPI from "../../../services/SimuladoService";
import { getApiError } from "../../../services/client";
import style from "./_chatModais.module.css";

const SESSAO_KEY = "mentorSessao";

const lerSessaoIA = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSAO_KEY)) ?? [];
  } catch {
    return [];
  }
};

const montarSnapshotSimulado = (s) => ({
  simuladoId: s.simuladoId,
  data: s.data,
  notaFinal: s.notaFinal,
  desempenho: s.desempenho
    ? {
        quantidadeDeAcertos: s.desempenho.quantidadeDeAcertos,
        quantidadeDeQuestoes: s.desempenho.quantidadeDeQuestoes,
      }
    : null,
  questoes: (s.questoes ?? []).map((q) => ({
    questaoId: q.questaoId,
    titulo: q.titulo,
    contexto: q.contexto,
    introducaoAlternativa: q.introducaoAlternativa,
    alternativas: (q.alternativas ?? []).map((a) => ({
      alternativaId: a.alternativaId,
      letra: a.letra,
      texto: a.texto,
      arquivo: a.arquivo,
      correta: a.correta,
    })),
  })),
  respostas: (s.respostas ?? []).map((r) => ({
    questaoId: r.questaoId,
    alternativaId: r.alternativaId,
    explicacao: r.explicacao,
  })),
});

export default function ModalCompartilhar({ show, onHide, onCompartilhar }) {
  const [aba, setAba] = useState("plano");
  const [enviando, setEnviando] = useState(false);

  const { data: planos = [] } = useQuery({
    queryKey: ["compartilhar-planos"],
    queryFn: PlanoAPI.Listar5,
    enabled: show,
  });

  const { data: simulados = [] } = useQuery({
    queryKey: ["compartilhar-simulados"],
    queryFn: SimuladoAPI.Listar,
    enabled: show,
  });

  const sessaoIA = lerSessaoIA();

  const compartilharPlano = async (p) => {
    setEnviando(true);
    try {
      const r = await PlanoAPI.Compartilhar(p.planoId);
      await onCompartilhar(1, {
        titulo: p.titulo,
        objetivo: p.objetivo,
        chave: r.chave,
      });
      onHide();
    } catch (e) {
      toast.error(getApiError(e));
    } finally {
      setEnviando(false);
    }
  };

  const compartilharSimulado = async (s) => {
    setEnviando(true);
    try {
      const completo = await SimuladoAPI.Obter(s.simuladoId);
      await onCompartilhar(2, montarSnapshotSimulado(completo));
      onHide();
    } catch (e) {
      toast.error(getApiError(e));
    } finally {
      setEnviando(false);
    }
  };

  const compartilharSessao = async () => {
    const mensagens = sessaoIA
      .filter((m) => m.texto)
      .map((m) => ({ autor: m.autor, texto: m.texto }));

    if (!mensagens.length) {
      toast.info("Nenhuma conversa com a IA para compartilhar.");
      return;
    }

    setEnviando(true);
    try {
      await onCompartilhar(3, { titulo: "Sessão de estudo", mensagens });
      onHide();
    } catch {
      toast.error("Não foi possível compartilhar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      kicker="Chat"
      title="Compartilhar"
      subtitle="Envie um plano, simulado ou conversa com a IA"
      icon={<LuShare2 />}
      scrollable
    >
      <div className={style.abas}>
        <button
          className={`${style.aba} ${aba === "plano" ? style.abaAtiva : ""}`}
          onClick={() => setAba("plano")}
        >
          <LuClipboardList /> Planos
        </button>
        <button
          className={`${style.aba} ${aba === "simulado" ? style.abaAtiva : ""}`}
          onClick={() => setAba("simulado")}
        >
          <LuFileText /> Simulados
        </button>
        <button
          className={`${style.aba} ${aba === "ia" ? style.abaAtiva : ""}`}
          onClick={() => setAba("ia")}
        >
          <LuSparkles /> Sessão IA
        </button>
      </div>

      <div className={style.abaConteudo}>
        {aba === "plano" &&
          (planos.length === 0 ? (
            <p className={style.vazio}>Você não tem planos para compartilhar.</p>
          ) : (
            planos.map((p) => (
              <button
                key={p.planoId}
                className={style.item}
                disabled={enviando}
                onClick={() => compartilharPlano(p)}
              >
                <LuClipboardList className={style.itemIcone} />
                <span className={style.itemTexto}>
                  <strong>{p.titulo}</strong>
                  <small>{p.objetivo}</small>
                </span>
              </button>
            ))
          ))}

        {aba === "simulado" &&
          (simulados.length === 0 ? (
            <p className={style.vazio}>Você ainda não fez simulados.</p>
          ) : (
            simulados.map((s) => (
              <button
                key={s.simuladoId}
                className={style.item}
                disabled={enviando}
                onClick={() => compartilharSimulado(s)}
              >
                <LuFileText className={style.itemIcone} />
                <span className={style.itemTexto}>
                  <strong>Simulado · Nota {s.notaFinal?.toFixed(1)}</strong>
                  <small>
                    {s.quantidadeQuestoes} questões · suas respostas e a correção
                  </small>
                </span>
              </button>
            ))
          ))}

        {aba === "ia" &&
          (sessaoIA.filter((m) => m.texto).length === 0 ? (
            <p className={style.vazio}>
              Nenhuma conversa com a IA salva no momento.
            </p>
          ) : (
            <button
              className={style.item}
              disabled={enviando}
              onClick={compartilharSessao}
            >
              <LuSparkles className={style.itemIcone} />
              <span className={style.itemTexto}>
                <strong>Conversa atual com a IA</strong>
                <small>
                  {sessaoIA.filter((m) => m.texto).length} mensagens
                </small>
              </span>
            </button>
          ))}
      </div>
    </ModalBase>
  );
}
