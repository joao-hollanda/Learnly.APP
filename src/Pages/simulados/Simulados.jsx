import { Form, Modal } from "react-bootstrap";
import Header from "../../components/Header/Header";
import style from "./_simulados.module.css";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import SimuladoAPI from "../../services/SimuladoService";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { ImHappy } from "react-icons/im";
import { Button } from "react-bootstrap";
import {
  BsClipboardPlus,
  BsClipboardCheck,
  BsTrophyFill,
  BsCheckLg,
} from "react-icons/bs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Simulados() {
  const usuarioId = Number(sessionStorage.getItem("id"));
  const queryClient = useQueryClient();

  const materias = [
    { label: "Linguagens", value: "linguagens" },
    { label: "Matemática", value: "matematica" },
    { label: "Ciências da Natureza", value: "ciencias-natureza" },
    { label: "Ciências Humanas", value: "ciencias-humanas" },
  ];

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
    queryKey: ["simulados", usuarioId],
    queryFn: async () => {
      const response = await SimuladoAPI.Listar(usuarioId);
      return Array.isArray(response) ? response : [];
    },
    staleTime: Infinity,
  });

  const getImagemAlternativa = (a) => a.arquivo || null;

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
        usuarioId,
        materiasSelecionadas,
        quantidade,
      );
      const data = await SimuladoAPI.Obter(id);
      salvarSimulado(data);
      salvarRespostas({});
      setMostrarCriar(false);
      toast.success("Simulado gerado com sucesso");
    } catch {
      toast.error("Erro ao gerar simulado");
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
    } catch {
      toast.error("Erro ao enviar respostas");
    } finally {
      setLoading(false);
    }
  };

  const finalizar = () => {
    setResultado(null);
    salvarSimulado(null);
    salvarRespostas({});

    // Invalida lista de simulados e o contador no Inicio
    queryClient.invalidateQueries({ queryKey: ["simulados", usuarioId] });
    queryClient.invalidateQueries({ queryKey: ["totalSimulados", usuarioId] });
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
              Nenhum simulado ainda, que tal criar um? <ImHappy />
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

      <Modal centered show={mostrarCriar} onHide={() => setMostrarCriar(false)}>
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-info">
            <BsClipboardPlus />
          </div>
          <Modal.Title>Novo simulado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label
            className="form-label fw-semibold"
            style={{ fontSize: "0.8125rem", color: "#475569" }}
          >
            Matérias
          </label>
          {materias.map((m) => (
            <Form.Check
              key={m.value}
              label={m.label}
              checked={materiasSelecionadas.includes(m.value)}
              onChange={() => toggleMateria(m.value)}
              style={{ textAlign: "left" }}
            />
          ))}
          <label
            className="form-label fw-semibold mt-3"
            style={{ fontSize: "0.8125rem", color: "#475569" }}
          >
            Quantidade de questões
          </label>
          <input
            type="number"
            className="form-control mt-1"
            value={quantidade}
            min={1}
            max={25}
            placeholder="Máx: 25"
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setQuantidade("");
              if (+v < 1 || +v > 25) return;
              setQuantidade(+v);
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMostrarCriar(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleGerarSimulado}
            disabled={loading}
          >
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsClipboardPlus /> Criar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal centered show={!!resultado} backdrop="static" keyboard={false}>
        <Modal.Header>
          <div className="modal-icon modal-icon-success">
            <BsTrophyFill />
          </div>
          <Modal.Title>Resultado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resultado && (
            <>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="modal-badge modal-badge-info">
                  Nota: {resultado.nota.toFixed(1)}
                </span>
                <span className="modal-badge modal-badge-success">
                  Acertos: {resultado.desempenho.quantidadeDeAcertos}
                </span>
              </div>
              <ReactMarkdown>{resultado.desempenho.feedback}</ReactMarkdown>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={finalizar}>
            <BsCheckLg /> Concluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!simuladoPreview}
        size="lg"
        scrollable
        onHide={() => setSimuladoPreview(null)}
      >
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-info">
            <BsClipboardCheck />
          </div>
          <Modal.Title>
            Simulado de{" "}
            {simuladoPreview &&
              new Date(simuladoPreview.data).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "left" }}>
          {simuladoPreview?.questoes.map((q, i) => (
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
                  const marcada =
                    previewRespostas[q.questaoId] === a.alternativaId;
                  let classe = style.alternativa;
                  if (a.correta) classe += ` ${style.correta}`;
                  if (marcada && !a.correta) classe += ` ${style.errada}`;
                  return (
                    <Form.Check
                      key={a.alternativaId}
                      type="radio"
                      disabled
                      checked={marcada}
                      className={classe}
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
        </Modal.Body>
      </Modal>
    </div>
  );
}
