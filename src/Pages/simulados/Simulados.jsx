import { Form, Modal } from "react-bootstrap";
import Header from "../../components/Header/Header";
import style from "./_simulados.module.css";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import SimuladoAPI from "../../services/SimuladoService";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { ImHappy } from "react-icons/im";

export default function Simulados() {
  const materias = [
    { label: "Linguagens", value: "linguagens" },
    { label: "Matemática", value: "matematica" },
    { label: "Ciências da Natureza", value: "ciencias-natureza" },
    { label: "Ciências Humanas", value: "ciencias-humanas" },
  ];

  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [quantidade, setQuantidade] = useState("");
  const [materiasSelecionadas, setMateriasSelecionadas] = useState([]);
  const [simulado, setSimulado] = useState(null);
  const [simulados, setSimulados] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState(0);
  const [simuladoPreview, setSimuladoPreview] = useState(null);
  const [previewRespostas, setPreviewRespostas] = useState({});

  const carregarSimulados = async () => {
    try {
      const id = sessionStorage.getItem("id");
      setUsuarioId(id);
      const response = await SimuladoAPI.Listar(id);
      setSimulados(Array.isArray(response) ? response : []);
    } catch {
      setSimulados([]);
    }
  };

  const getImagemAlternativa = (a) => {
    return a.arquivo || null;
  };

  useEffect(() => {
    const simuladoSalvo = sessionStorage.getItem("simulado");
    const respostasSalvas = sessionStorage.getItem("respostas");
    carregarSimulados();
    if (simuladoSalvo) setSimulado(JSON.parse(simuladoSalvo));
    if (respostasSalvas) setRespostas(JSON.parse(respostasSalvas));
  }, []);

  useEffect(() => {
    if (simulado) {
      sessionStorage.setItem("simulado", JSON.stringify(simulado));
    }
  }, [simulado]);

  useEffect(() => {
    if (Object.keys(respostas).length > 0) {
      sessionStorage.setItem("respostas", JSON.stringify(respostas));
    }
  }, [respostas]);

  const toggleMateria = (m) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleGerarSimulado = async () => {
    if (!materiasSelecionadas.length || !quantidade)
      return toast("Preencha todos os campos");

    try {
      setLoading(true);
      const id = await SimuladoAPI.GerarSimulado(
        usuarioId,
        materiasSelecionadas,
        quantidade
      );
      const data = await SimuladoAPI.Obter(id);
      setSimulado(data);
      setRespostas({});
      setMostrarCriar(false);
      toast("Simulado gerado com sucesso");
    } catch {
      toast("Erro ao gerar simulado");
    } finally {
      setLoading(false);
    }
  };

  const finalizar = async () => {
    setResultado(null);
    setSimulado(null);
    setRespostas({});
    sessionStorage.removeItem("simulado");
    sessionStorage.removeItem("respostas");
    await carregarSimulados();
  };

  const handleResponder = async () => {
    const todas = simulado.questoes.every(
      (q) => respostas[q.questaoId] !== undefined
    );
    if (!todas) return toast("Responda todas as questões");

    try {
      setLoading(true);
      const payload = Object.entries(respostas).map(([q, a]) => ({
        questaoId: Number(q),
        alternativaId: a,
      }));
      const r = await SimuladoAPI.Responder(simulado.simuladoId, payload);
      setResultado(r);
    } catch {
      toast("Erro ao enviar respostas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header>
        <button className={style.botao} onClick={() => setMostrarCriar(true)}>
          <FaPlus />
        </button>
      </Header>

      {!simulado && (
        <div className={style.listaSimulados}>
          <h3>Simulados recentes</h3>

          {simulados.length === 0 ? (
            <div className={style.vazio}>
              Nenhum simulado ainda, que tal criar um? <ImHappy />
            </div>
          ) : (
            simulados.map((s) => (
              <div key={s.simuladoId} className={style.cardSimulado}>
                <h4>Simulado</h4>
                <p>
                  Nota: {s.notaFinal.toFixed(1)} • {s.questoes.length} questões
                </p>
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
            ))
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
                        setRespostas((r) => ({
                          ...r,
                          [q.questaoId]: a.alternativaId,
                        }))
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
            className={`${style.botao} ${style.full}`}
            onClick={handleResponder}
          >
            {loading ? <span className={style.spinner} /> : "Enviar"}
          </button>
        </div>
      )}

      <Modal centered show={mostrarCriar} onHide={() => setMostrarCriar(false)}>
        <Modal.Body>
          <h3>Matérias</h3>
          {materias.map((m) => (
            <Form.Check
              key={m.value}
              label={m.label}
              checked={materiasSelecionadas.includes(m.value)}
              onChange={() => toggleMateria(m.value)}
            />
          ))}

          <h3 className="mt-3">Quantidade</h3>
          <input
            type="number"
            className="form-control mt-2"
            value={quantidade}
            min={1}
            max={25}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setQuantidade("");
              if (+v < 1 || +v > 25) return;
              setQuantidade(+v);
            }}
          />

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className={style.botao}
              onClick={handleGerarSimulado}
              disabled={loading}
            >
              {loading ? <span className={style.spinner} /> : "Criar"}
            </button>

            <button
              className={`${style.botao} ${style.danger}`}
              onClick={() => setMostrarCriar(false)}
              disabled={loading}
            >
              Fechar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal centered show={!!resultado} backdrop="static" keyboard={false}>
        <Modal.Body>
          {resultado && (
            <>
              <p>
                <strong>Nota:</strong> {resultado.nota.toFixed(1)}
              </p>
              <p>
                <strong>Acertos:</strong>{" "}
                {resultado.desempenho.quantidadeDeAcertos}
              </p>
              <p>{resultado.desempenho.feedback}</p>
            </>
          )}

          <button
            className={`${style.botao} ${style.danger}`}
            onClick={finalizar}
          >
            Fechar
          </button>
        </Modal.Body>
      </Modal>

      <Modal
        show={!!simuladoPreview}
        size="lg"
        scrollable
        onHide={() => setSimuladoPreview(null)}
      >
        <Modal.Body>
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
                      className={classe}
                    />
                  );
                })}
              </Form>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setSimuladoPreview(null)}
          >
            Fechar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
