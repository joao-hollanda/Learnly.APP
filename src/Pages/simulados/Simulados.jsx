import { Form } from "react-bootstrap";
import Header from "../../components/Header/Header";
import style from "./_simulados.module.css";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import SimuladoAPI from "../../services/SimuladoService";
import { getApiError } from "../../services/client";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { ImHappy } from "react-icons/im";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  const { data: simulados = [] } = useQuery({
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
  };

  return (
    <div className="page">
      <Header>
        <button className={style.botao} onClick={() => setMostrarCriar(true)}>
          <FaPlus />
        </button>
      </Header>

      {!simulado && (
        <div className={style.listaSimulados}>
          {simulados.length === 0 ? (
            <div className={style.vazio}>
              Nenhum simulado ainda, que tal criar um?
            </div>
          ) : (
            <>
              <h3>Simulados recentes</h3>
              {simulados.map((s) => (
                <div key={s.simuladoId} className={style.cardSimulado}>
                  <div className={style.cardSimuladoHeader}>
                    <span className={style.cardSimuladoData}>
                      {new Date(s.data).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <div className={style.cardSimuladoBadges}>
                      <span className="modal-badge modal-badge-info">
                        {s.questoes.length} questões
                      </span>
                      <span
                        className={`modal-badge ${s.notaFinal >= 6 ? "modal-badge-success" : "modal-badge-danger"}`}
                      >
                        Nota {s.notaFinal.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`${style.botao} ${style.full}`}
                    onClick={() => {
                      const respostasMap = {};
                      (s.respostas || []).forEach((r) => {
                        respostasMap[r.questaoId] = r.alternativaId;
                      });
                      setPreviewRespostas(respostasMap);
                      setSimuladoPreview(s);
                    }}
                  >
                    Visualizar
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {simulado && (
        <div className={style.container}>
          {simulado.questoes.map((q, i) => (
            <div key={q.questaoId} className={style.card}>
              <h4>
                {i + 1}. {q.titulo}
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
              <Form>
                {q.alternativas.map((a) => {
                  const imagem = getImagemAlternativa(a);
                  return (
                    <Form.Check
                      key={a.alternativaId}
                      type="radio"
                      checked={respostas[q.questaoId] === a.alternativaId}
                      onChange={() =>
                        salvarRespostas({
                          ...respostas,
                          [q.questaoId]: a.alternativaId,
                        })
                      }
                      className={style.alternativa}
                      label={
                        <div className={style.conteudoAlternativa}>
                          <span className={style.letra}>{a.letra})</span>
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
                      }
                    />
                  );
                })}
              </Form>
            </div>
          ))}
          <button
            type="button"
            className={`${style.botao} ${style.full}`}
            onClick={handleResponder}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>Enviar</span>
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