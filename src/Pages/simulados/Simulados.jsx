import Header from "../../components/Header/Header";
import style from "./_simulados.module.css";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { useState } from "react";
import SimuladoAPI from "../../services/SimuladoService";
import { getApiError } from "../../services/client";
import { registrarEvento } from "../../utils/analytics";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { LuClipboardList, LuHistory } from "react-icons/lu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import ModalCriarSimulado from "../../components/Modais/Simulados/ModalCriarSimulado";
import ModalResultado from "../../components/Modais/Simulados/ModalResultado";
import ModalPreviewSimulado from "../../components/Modais/Simulados/ModalPreviewResultado";

const getImagemAlternativa = (a) => a.arquivo || null;

export default function Simulados() {
  const queryClient = useQueryClient();

  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [quantidade, setQuantidade] = useState("");
  const [materiasSelecionadas, setMateriasSelecionadas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simuladoPreview, setSimuladoPreview] = useState(null);
  const [previewRespostas, setPreviewRespostas] = useState({});
  const [abrindoId, setAbrindoId] = useState(null);

  const [simulado, setSimulado] = useState(() => {
    const salvo = sessionStorage.getItem("simulado");
    const respostasSalvas = sessionStorage.getItem("respostas");
    if (respostasSalvas) setRespostas(JSON.parse(respostasSalvas));
    return salvo ? JSON.parse(salvo) : null;
  });

  const salvarSimulado = (data) => {
    setSimulado(data);
    if (data) sessionStorage.setItem("simulado", JSON.stringify(data));
    else sessionStorage.removeItem("simulado");
  };

  const salvarRespostas = (r) => {
    setRespostas(r);
    if (Object.keys(r).length > 0)
      sessionStorage.setItem("respostas", JSON.stringify(r));
    else sessionStorage.removeItem("respostas");
  };

  const { data: simulados = [], isPending: carregandoLista } = useQuery({
    queryKey: ["simulados"],
    queryFn: async () => {
      const response = await SimuladoAPI.Listar();
      return Array.isArray(response) ? response : [];
    },
    staleTime: Infinity,
  });

  const toggleMateria = (m) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const handleGerarSimulado = async () => {
    if (!materiasSelecionadas.length || !quantidade)
      return toast.warning("Preencha todos os campos");

    try {
      setLoading(true);
      const id = await SimuladoAPI.GerarSimulado(
        materiasSelecionadas,
        quantidade,
      );
      const data = await SimuladoAPI.Obter(id);
      salvarSimulado(data);
      salvarRespostas({});
      setMostrarCriar(false);
      registrarEvento("simulado_criado", {
        questoes: Number(quantidade),
        materias: materiasSelecionadas,
      });
      toast.success("Simulado gerado com sucesso");
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao gerar simulado"));
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async () => {
    const todas = simulado.questoes.every(
      (q) => respostas[q.questaoId] !== undefined,
    );
    if (!todas) return toast.warning("Responda todas as questões");

    try {
      setLoading(true);
      const payload = Object.entries(respostas).map(([q, a]) => ({
        questaoId: Number(q),
        alternativaId: a,
      }));
      const r = await SimuladoAPI.Responder(simulado.simuladoId, payload);
      registrarEvento("simulado_finalizado", { nota: r?.notaFinal });
      setResultado(r);
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao enviar respostas"));
    } finally {
      setLoading(false);
    }
  };

  const finalizar = () => {
    setResultado(null);
    salvarSimulado(null);
    salvarRespostas({});
    queryClient.invalidateQueries({ queryKey: ["simulados"] });
    queryClient.invalidateQueries({ queryKey: ["totalSimulados"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardDesempenho"] });
  };

  const totalQuestoes = simulado?.questoes?.length ?? 0;
  const respondidas = simulado
    ? simulado.questoes.filter((q) => respostas[q.questaoId] !== undefined)
        .length
    : 0;

  const abrirSimulado = async (s) => {
    try {
      setAbrindoId(s.simuladoId);
      const completo = await SimuladoAPI.Obter(s.simuladoId);
      const respostasMap = {};
      (completo.respostas || []).forEach((r) => {
        respostasMap[r.questaoId] = r.alternativaId;
      });
      setPreviewRespostas(respostasMap);
      setSimuladoPreview(completo);
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao carregar o simulado."));
    } finally {
      setAbrindoId(null);
    }
  };

  const fmtData = (d) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ordenados = [...simulados].sort(
    (a, b) => new Date(b.data) - new Date(a.data),
  );
  const [destaque, ...anteriores] = ordenados;
  const historico = anteriores.slice(0, 4);

  return (
    <div className="page">
      <Header />

      {!simulado && (
        <div className={style.listaSimulados}>
          <header className={style.pageHead}>
            <div className={style.pageHeadText}>
              <span className="eyebrow">Pratique</span>
              <h1 className={style.pageTitle}>Simulados</h1>
              <p className={style.pageSub}>
                Teste seus conhecimentos com questões de vestibulares reais e
                acompanhe sua evolução.
              </p>
            </div>
            <div className={style.pageHeadAcoes}>
              <span className={style.heroIndice}>04 / Simulados</span>
              {simulados.length > 0 && (
                <button
                  className={style.botaoNovo}
                  onClick={() => setMostrarCriar(true)}
                >
                  <FaPlus />
                  <span className={style.botaoNovoTexto}>Novo simulado</span>
                </button>
              )}
            </div>
          </header>

          {carregandoLista ? (
            <div className={style.listaGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))}
            </div>
          ) : simulados.length === 0 ? (
            <div className={style.vazio}>
              <div className={style.vazioIcon}>
                <LuClipboardList />
              </div>
              <h3>Nenhum simulado ainda</h3>
              <p>Crie seu primeiro simulado para começar a praticar.</p>
              <button
                className={style.botaoCriarVazio}
                onClick={() => setMostrarCriar(true)}
              >
                <FaPlus /> Criar simulado
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={style.destaque}
                disabled={abrindoId === destaque.simuladoId}
                onClick={() => abrirSimulado(destaque)}
              >
                <div className={style.destaqueInfo}>
                  <span className={style.destaqueKicker}>
                    Mais recente — {fmtData(destaque.data)}
                  </span>
                  <span
                    className={`${style.cardStatus} ${destaque.notaFinal >= 6 ? style.aprovadoDark : style.revisarDark}`}
                  >
                    {destaque.notaFinal >= 6 ? "Aprovado" : "Revisar"}
                  </span>
                  <p className={style.destaqueMeta}>
                    {destaque.quantidadeQuestoes} questões respondidas
                  </p>
                  <span className={style.destaqueLink}>
                    {abrindoId === destaque.simuladoId
                      ? "Carregando..."
                      : "Ver correção →"}
                  </span>
                </div>
                <div className={style.destaqueNota}>
                  <span className={style.destaqueNotaNum}>
                    {destaque.notaFinal.toFixed(1)}
                  </span>
                  <span className={style.destaqueNotaMax}>/ 10</span>
                </div>
              </button>

              {historico.length > 0 && (
                <div className={style.ledger}>
                  <div className={style.panelHead}>
                    <div className={style.panelTitulo}>
                      <span className={style.panelIcone}>
                        <LuHistory />
                      </span>
                      <div>
                        <h3>Histórico</h3>
                        <span>Seus simulados mais recentes</span>
                      </div>
                    </div>
                    <span className={style.panelBadge}>
                      {historico.length}{" "}
                      {historico.length === 1 ? "simulado" : "simulados"}
                    </span>
                  </div>
                  <div className={style.ledgerHead}>
                    <span>Data</span>
                    <span>Questões</span>
                    <span>Status</span>
                    <span>Nota</span>
                    <span aria-hidden="true" />
                  </div>
                  {historico.map((s) => {
                    const aprovado = s.notaFinal >= 6;
                    return (
                      <button
                        type="button"
                        key={s.simuladoId}
                        className={style.ledgerRow}
                        disabled={abrindoId === s.simuladoId}
                        onClick={() => abrirSimulado(s)}
                      >
                        <span className={style.ledgerData}>
                          {fmtData(s.data)}
                        </span>
                        <span className={style.ledgerMeta}>
                          {s.quantidadeQuestoes}
                        </span>
                        <span
                          className={`${style.cardStatus} ${aprovado ? style.aprovado : style.revisar}`}
                        >
                          {aprovado ? "Aprovado" : "Revisar"}
                        </span>
                        <span className={style.ledgerNota}>
                          {s.notaFinal.toFixed(1)}
                          <em>/10</em>
                        </span>
                        <span className={style.ledgerLink}>
                          {abrindoId === s.simuladoId
                            ? "Carregando..."
                            : "Ver correção →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {simulado && (
        <div className={style.container}>
          <header className={style.quizHead}>
            <div>
              <span className="eyebrow">Em andamento</span>
              <h1 className={style.quizTitle}>Simulado</h1>
            </div>
            <div className={style.quizContador}>
              <span className={style.quizContadorTexto}>
                <strong>{respondidas}</strong> / {totalQuestoes} respondidas
              </span>
              <span className={style.quizContadorBarra}>
                <span
                  style={{
                    width: `${totalQuestoes > 0 ? (respondidas / totalQuestoes) * 100 : 0}%`,
                  }}
                />
              </span>
            </div>
          </header>

          {simulado.questoes.map((q, i) => (
            <div key={q.questaoId} className={style.card}>
              <h4>
                <span className={style.questaoNum}>{i + 1}</span>
                {q.titulo}
              </h4>
              {q.contexto && (
                <div className={style.markdown}>
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img
                          {...props}
                          className={style.imagem}
                          loading="lazy"
                          decoding="async"
                        />
                      ),
                    }}
                  >
                    {q.contexto}
                  </ReactMarkdown>
                </div>
              )}
              {q.introducaoAlternativa}
              <div className={style.alternativas}>
                {q.alternativas.map((a) => {
                  const imagem = getImagemAlternativa(a);
                  const marcada = respostas[q.questaoId] === a.alternativaId;
                  return (
                    <button
                      type="button"
                      key={a.alternativaId}
                      className={`${style.alternativa} ${marcada ? style.selecionada : ""}`}
                      onClick={() =>
                        salvarRespostas({
                          ...respostas,
                          [q.questaoId]: a.alternativaId,
                        })
                      }
                    >
                      <span className={style.letra}>{a.letra}</span>
                      <div className={style.conteudoAlternativa}>
                        {a.texto ? (
                          <span>{a.texto}</span>
                        ) : imagem ? (
                          <ReactMarkdown
                            components={{
                              img: ({ node, ...props }) => (
                                <img {...props} className={style.imagem} />
                              ),
                            }}
                          >
                            {`![](${imagem})`}
                          </ReactMarkdown>
                        ) : (
                          <span className={style.semConteudo}>
                            (alternativa sem conteúdo)
                          </span>
                        )}
                      </div>
                      {marcada && (
                        <span className={style.check}>
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            type="button"
            className={`${style.enviar} ${style.full}`}
            onClick={handleResponder}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>
              Enviar respostas
            </span>
            {loading && <span className={style.spinner} />}
          </button>
        </div>
      )}

      <ModalCriarSimulado
        show={mostrarCriar}
        onHide={() => setMostrarCriar(false)}
        loading={loading}
        quantidade={quantidade}
        setQuantidade={setQuantidade}
        materiasSelecionadas={materiasSelecionadas}
        toggleMateria={toggleMateria}
        onGerar={handleGerarSimulado}
      />

      <ModalResultado resultado={resultado} onFinalizar={finalizar} />

      <ModalPreviewSimulado
        simuladoPreview={simuladoPreview}
        previewRespostas={previewRespostas}
        onHide={() => setSimuladoPreview(null)}
      />
    </div>
  );
}