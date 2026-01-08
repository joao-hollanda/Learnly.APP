import { Form, Modal, Button } from "react-bootstrap";
import Header from "../../components/Header/Header";
import style from "./_simulados.module.css";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import SimuladoAPI from "../../services/SimuladoService";
import ReactMarkdown from "react-markdown";

function Simulados() {
  const materias = [
    { label: "Linguagens", value: "linguagens" },
    { label: "Matemática", value: "matematica" },
    { label: "Ciências da Natureza", value: "ciencias-natureza" },
    { label: "Ciências Humanas", value: "ciencias-humanas" },
  ];

  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState();
  const [simulado, setSimulado] = useState(null);
  const [materiasSelecionadas, setMateriasSelecionadas] = useState([]);
  const [simuladoId, setSimuladoId] = useState();
  const [respostas, setRespostas] = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  const handleClickCriar = () => setMostrarCriar(true);
  const handleFecharCriar = () => setMostrarCriar(false);

  const handleSelecionarMateria = (value) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const handleGerarSimulado = async () => {
    localStorage.removeItem("simulado");
    localStorage.removeItem("simuladoId");
    localStorage.removeItem("respostas");

    try {
      const simuladoId = await SimuladoAPI.GerarSimulado(
        1,
        materiasSelecionadas,
        quantidadeQuestoes
      );
      setSimuladoId(simuladoId);

      const simulado = await SimuladoAPI.Obter(simuladoId);
      setSimulado(simulado);
      setMostrarCriar(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelecionarAlternativa = (questaoId, alternativaId) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: alternativaId,
    }));
  };

  const formatarRespostas = (respostas) => {
    return Object.entries(respostas).map(([questaoId, alternativaId]) => ({
      questaoId: Number(questaoId),
      alternativaId,
    }));
  };

  const handleEnviarSimulado = async () => {
    const todasRespondidas = simulado.questoes.every(
      (q) => respostas[q.questaoId] !== undefined
    );

    if (!todasRespondidas) {
      alert("Você precisa responder todas as questões antes de enviar!");
      return;
    }

    try {
      setLoadingEnvio(true);
      const respostasFormatadas = formatarRespostas(respostas);

      const response = await SimuladoAPI.Responder(
        simuladoId,
        respostasFormatadas
      );

      setResultado(response);
      setMostrarResultado(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEnvio(false);
    }
  };

  const handleFecharResultado = () => {
    setMostrarResultado(false);

    setSimulado(null);
    setSimuladoId(null);
    setRespostas({});
    setMateriasSelecionadas([]);
    setQuantidadeQuestoes(null);

    localStorage.removeItem("simulado");
    localStorage.removeItem("simuladoId");
    localStorage.removeItem("respostas");
  };

  useEffect(() => {
    if (simulado) {
      localStorage.setItem("simulado", JSON.stringify(simulado));
      localStorage.setItem("simuladoId", simuladoId);
    }
  }, [simulado, simuladoId]);

  useEffect(() => {
    localStorage.setItem("respostas", JSON.stringify(respostas));
  }, [respostas]);

  useEffect(() => {
    const simuladoSalvo = localStorage.getItem("simulado");
    const respostasSalvas = localStorage.getItem("respostas");
    const simuladoIdSalvo = localStorage.getItem("simuladoId");

    if (simuladoSalvo) {
      setSimulado(JSON.parse(simuladoSalvo));
      setSimuladoId(simuladoIdSalvo);
    }

    if (respostasSalvas) {
      setRespostas(JSON.parse(respostasSalvas));
    }
  }, []);

  return (
    <>
      <Header
        children={
          <button className={style.criar} onClick={handleClickCriar}>
            <FaPlus />
          </button>
        }
      />

      {simulado && (
        <div className={style.simulado}>
          {simulado.questoes.map((q, index) => (
            <div key={q.questaoId} className={style.questao}>
              <h4>
                {index + 1}. {q.titulo}
              </h4>

              {q.contexto && (
                <div className={style.contexto}>
                  <ReactMarkdown
                    components={{
                      img: ({ ...props }) => (
                        <img {...props} className={style.imagemMarkdown} />
                      ),
                      p: ({ ...props }) => (
                        <p className={style.paragrafoMarkdown} {...props} />
                      ),
                    }}
                  >
                    {q.contexto}
                  </ReactMarkdown>
                </div>
              )}

              {q.introducaoAlternativa && <div>{q.introducaoAlternativa}</div>}

              <Form>
                {q.alternativas.map((alt) => (
                  <Form.Check
                    key={alt.alternativaId}
                    type="radio"
                    name={`questao-${q.questaoId}`}
                    id={`q${q.questaoId}-alt${alt.alternativaId}`}
                    label={
                      <span>
                        <strong>{alt.letra})</strong> {alt.texto}
                        <p>{alt.file}</p>
                      </span>
                    }
                    checked={respostas[q.questaoId] === alt.alternativaId}
                    onChange={() =>
                      handleSelecionarAlternativa(
                        q.questaoId,
                        alt.alternativaId
                      )
                    }
                    className={style.alternativa}
                  />
                ))}
              </Form>
            </div>
          ))}

          <button
            className={style.botaoEnviar}
            onClick={handleEnviarSimulado}
            disabled={loadingEnvio}
          >
            {loadingEnvio ? <span className={style.spinner} /> : "Enviar"}
          </button>
        </div>
      )}

      <Modal size="lg" centered show={mostrarCriar} onHide={handleFecharCriar}>
        <Modal.Header>
          <Modal.Title className={style.modal_titulo}>
            <h4>Gerar Simulado</h4>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={style.modal_corpo}>
          <p>
            <strong>Selecione as matérias:</strong>
          </p>

          <Form>
            {materias.map((materia) => (
              <div key={materia.value} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id={materia.value}
                  label={materia.label}
                  checked={materiasSelecionadas.includes(materia.value)}
                  onChange={() => handleSelecionarMateria(materia.value)}
                />
              </div>
            ))}
          </Form>

          <p>
            <strong>Selecione a quantidade de questões:</strong>
          </p>

          <input
            type="number"
            className="form-control"
            min="1"
            max="25"
            placeholder="Ex: 2"
            value={quantidadeQuestoes}
            onChange={(e) => setQuantidadeQuestoes(Number(e.target.value))}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            style={{ backgroundColor: "black", border: 0 }}
            onClick={handleGerarSimulado}
          >
            Criar
          </Button>
          <Button
            onClick={handleFecharCriar}
            style={{
              backgroundColor: "#db3434ff",
              border: 0,
            }}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="lg"
        centered
        show={mostrarResultado}
        onHide={handleFecharCriar}
      >
        <Modal.Header>
          <Modal.Title className={style.modal_titulo}>
            <h4>Resultado</h4>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={style.modal_corpo}>
          {resultado && (
            <>
              <p>
                <strong>Nota:</strong> {resultado.nota.toFixed(1)}
              </p>

              <p>
                <strong>Quantidade de Questões:</strong>{" "}
                {resultado.desempenho.quantidadeDeQuestoes}
              </p>

              <p>
                <strong>Acertos:</strong>{" "}
                {resultado.desempenho.quantidadeDeAcertos}
              </p>

              <p>
                <strong>Feedback:</strong> {resultado.desempenho.feedback}
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleFecharResultado}
            style={{
              backgroundColor: "#db3434ff",
              border: 0,
            }}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Simulados;
