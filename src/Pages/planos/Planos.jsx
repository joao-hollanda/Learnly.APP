import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useEffect, useState } from "react";
import { FaPlay, FaPlus, FaTrash } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import Card from "../../components/Card/Card";
import { toast } from "react-toastify";
import PlanoAPI from "../../services/PlanoService";
import { Modal } from "react-bootstrap";
import { ImHappy } from "react-icons/im";
import { BsTrash } from "react-icons/bs";

const mapPlanoBackend = (plano) => ({
  planoId: plano.planoId,
  titulo: plano.titulo,
  objetivo: plano.objetivo,
  ativo: plano.ativo,
  dataInicio: plano.dataInicio?.split("T")[0],
  dataFim: plano.dataFim?.split("T")[0],
  materias: (plano.planoMaterias ?? []).map((pm) => ({
    planoMateriaId: pm.planoMateriaId,
    nome: pm.materia.nome,
    cor: pm.materia.cor,
    horasTotais: pm.horasTotais,
    horasConcluidas: pm.horasConcluidas,
  })),
});

function Planos() {
  const usuarioId = sessionStorage.getItem("id");

  const hoje = new Date().toISOString().split("T")[0];

  const [planosList, setPlanosList] = useState([]);
  const [planoAtivoIndex, setPlanoAtivoIndex] = useState(0);

  const [mostrarPlano, setMostrarPlano] = useState(false);
  const [mostrarCriarPlano, setMostrarCriarPlano] = useState(false);
  const [mostrarConfigurar, setMostrarConfigurar] = useState(false);

  const [viewingIndex, setViewingIndex] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");

  const [planoConfigId, setPlanoConfigId] = useState(null);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);
  const [materiaId, setMateriaId] = useState("");
  const [horasTotais, setHorasTotais] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [materiasDoPlano, setMateriasDoPlano] = useState([]);

  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);
  const [horasLancadas, setHorasLancadas] = useState("");

  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);

  const [loading, setLoading] = useState(false);

  const carregarPlanos = async () => {
    try {
      const resposta = await PlanoAPI.Listar5(usuarioId);
      const planosAdaptados = resposta.map(mapPlanoBackend);
      setPlanosList(planosAdaptados);

      const ativoIndex = planosAdaptados.findIndex((p) => p.ativo);
      setPlanoAtivoIndex(ativoIndex >= 0 ? ativoIndex : 0);
    } catch {
      toast.error("Erro ao carregar planos");
    }
  };

  const abrirLancamentoHoras = (materia) => {
    setMateriaSelecionada(materia);
    setHorasLancadas("");
    setMostrarHoras(true);
  };

  const lancarHoras = async () => {
    if (!horasLancadas || horasLancadas <= 0)
      return toast.warn("Informe um valor válido");

    const comparacao = await PlanoAPI.CompararHoras(usuarioId);
    const horasHoje = comparacao.horasHoje;
    const totalComNovoLancamento = horasHoje + Number(horasLancadas);

    if (totalComNovoLancamento > LIMITE_DIARIO) {
      return toast.warn(
        `Limite diário de ${LIMITE_DIARIO}h atingido. Você já lançou ${horasHoje}h hoje.`,
      );
    }

    try {
      setLoading(true);
      await PlanoAPI.LancarHoras(
        materiaSelecionada.planoMateriaId,
        Number(horasLancadas),
      );

      toast.success("Horas lançadas");
      setMostrarHoras(false);
      carregarPlanos();
    } catch (erro) {
      toast.error("Erro ao lançar horas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPlanos();
  }, []);

  useEffect(() => {
    if (!mostrarConfigurar) return;

    PlanoAPI.ListarMaterias()
      .then(setMateriasDisponiveis)
      .catch(() => toast.error("Erro ao carregar matérias"));
  }, [mostrarConfigurar]);

  const abrirCriarPlano = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }

    setTitulo("");
    setObjetivo("");
    setMostrarCriarPlano(true);
  };

  const diferencaEmDias = (inicio, fim) => {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    const diffTime = dataFim.getTime() - dataInicio.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const criarPlano = async () => {
    if (!titulo || !objetivo || !dataInicio || !dataFim) {
      return toast.warn("Preencha todos os campos!");
    }

    if (dataFim < dataInicio) {
      return toast.warn("Data final não pode ser anterior à data de início");
    }

    const duracaoDias = diferencaEmDias(dataInicio, dataFim);

    if (duracaoDias < 14) {
      return toast.warn("O plano deve ter duração mínima de 2 semanas.");
    }

    if (duracaoDias > 365 * 5) {
      return toast.warn("O plano não pode ter duração maior que 2 anos.");
    }

    try {
      setLoading(true);

      const planoCriado = await PlanoAPI.Criar({
        titulo,
        objetivo,
        usuarioId,
        dataInicio: new Date(dataInicio + "T00:00:00Z").toISOString(),
        dataFim: new Date(dataFim + "T00:00:00Z").toISOString(),
        ativo: true,
      });

      await PlanoAPI.AtivarPlano(planoCriado.planoId, usuarioId);

      setPlanoConfigId(planoCriado.planoId);
      setMostrarCriarPlano(false);
      setMostrarConfigurar(true);

      carregarPlanos();
      setMateriasDoPlano([]);

      toast.success("Plano criado e ativado!");
    } catch {
      toast.error("Erro ao criar plano");
    } finally {
      setLoading(false);
    }
  };

  const adicionarMateria = async () => {
    if (!materiaId || !horasTotais)
      return toast.warn("Preencha todos os campos");

    try {
      await PlanoAPI.AdicionarMateria(planoConfigId, {
        materiaId,
        horasTotais,
      });

      const materia = materiasDisponiveis.find((m) => m.materiaId == materiaId);

      setMateriasDoPlano((prev) => [
        ...prev,
        {
          nome: materia.nome,
          horasTotais,
          horasConcluidas: 0,
        },
      ]);

      setMateriaId("");
      setHorasTotais("");

      toast.success("Matéria adicionada");
    } catch {
      toast.error("Erro ao adicionar matéria");
    }
  };

  const handleClickPlano = (index) => {
    setViewingIndex(index);
    setMostrarPlano(true);
  };

  const handleAtivarPlano = async () => {
    try {
      const plano = planosList[viewingIndex];
      await PlanoAPI.AtivarPlano(plano.planoId, usuarioId);

      setMostrarPlano(false);
      carregarPlanos();
      toast.success("Plano ativado");
    } catch {
      toast.error("Erro ao ativar plano");
    }
  };

  const planoAtivo = planosList[planoAtivoIndex];
  const planoVisualizado =
    viewingIndex !== null ? planosList[viewingIndex] : null;

  const LIMITE_DIARIO = 20;

  return (
    <div className="page">
      <Header
        children={
          <button className={style.botao} onClick={abrirCriarPlano}>
            <FaPlus />
          </button>
        }
      />

      {planosList.length === 0 ? (
        <div className={style.container}>
          <div className={style.vazio}>
            Nenhum plano ainda, que tal criar um? <ImHappy />
          </div>
        </div>
      ) : (
        <>
          {planoAtivo && (
            <div className={style.container}>
              <h4 className={style.atividade}>Plano Atual</h4>
              <Plano
                titulo={planoAtivo.titulo}
                ativo
                materias={planoAtivo.materias}
                botao={
                  <button
                    className={style.botao_exibir}
                    onClick={() => handleClickPlano(planoAtivoIndex)}
                  >
                    <FaPlay /> Visualizar Plano
                  </button>
                }
              />
            </div>
          )}

          {planosList.filter((_, idx) => idx !== planoAtivoIndex).length >
            0 && (
            <>
              <h4 className={style.atividade}>Planos Inativos</h4>
              <div className={style.planos_container}>
                {planosList.map((plano, idx) =>
                  idx === planoAtivoIndex ? null : (
                    <Plano
                      key={plano.planoId}
                      titulo={plano.titulo}
                      ativo={false}
                      materias={plano.materias}
                      botao={
                        <button
                          className={style.botao_exibir}
                          onClick={() => handleClickPlano(idx)}
                        >
                          <FaPlay /> Visualizar Plano
                        </button>
                      }
                    />
                  ),
                )}
              </div>
            </>
          )}
        </>
      )}

      <Modal
        show={mostrarPlano}
        centered
        size="xl"
        dialogClassName={style.modal_xl}
        onHide={() => setMostrarPlano(false)}
      >
        <Modal.Header>
          <Modal.Title>{planoVisualizado?.titulo}</Modal.Title>
          <div className={style.excluir}>
            <button
              className={`${style.lixeira}`}
              onClick={() => {
                setMostrarPlano(false);
                setPlanoParaExcluir(planoVisualizado);
                setMostrarExcluir(true);
              }}
            >
              <BsTrash />
            </button>
          </div>
        </Modal.Header>

        {planoVisualizado && (
          <div className={style.info_container}>
            <div className={style.info_item}>
              <span className={style.info_label}>Início</span>
              <span className={style.info_value}>
                {new Date(planoVisualizado.dataInicio).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
            </div>

            <div className={style.info_item}>
              <span className={style.info_label}>Fim</span>
              <span className={style.info_value}>
                {new Date(planoVisualizado.dataFim).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        )}

        <Modal.Body className={style.modal_body}>
          <div className={style.cards}>
            {planoVisualizado?.materias.map((m, i) => {
              const progresso = (m.horasConcluidas / m.horasTotais) * 100 || 0;

              return (
                <Card key={i} titulo={m.nome} subtitulo={m.objetivo}>
                  <p>
                    {m.horasConcluidas}h / {m.horasTotais}h
                  </p>

                  <div className={style.progress}>
                    <div
                      className={style.progress_bar}
                      style={{ width: `${progresso}%` }}
                    />
                  </div>

                  <button
                    className={`${style.botao} ${style.full}`}
                    onClick={() => abrirLancamentoHoras(m)}
                  >
                    Lançar horas
                  </button>
                </Card>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarPlano(false)}
          >
            Fechar
          </button>
          {viewingIndex !== planoAtivoIndex && (
            <button className={style.botao} onClick={handleAtivarPlano}>
              Ativar
            </button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarCriarPlano} centered>
        <Modal.Header>
          <Modal.Title>Criar Plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input
            className="form-control mb-3"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            className="form-control mb-3"
            placeholder="Objetivo"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />

          <label className="form-label">Data de Início</label>
          <input
            type="date"
            className="form-control mb-3"
            value={dataInicio}
            min={hoje}
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <label className="form-label">Data Final</label>
          <input
            type="date"
            className="form-control"
            value={dataFim}
            min={dataInicio || hoje}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarCriarPlano(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={style.botao}
            onClick={criarPlano}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>Criar Plano</span>

            {loading && <span className={style.spinner} />}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfigurar} centered>
        <Modal.Header>
          <Modal.Title>Configurar Plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <select
            className="form-select mb-3"
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
          >
            <option value="">Selecione a matéria</option>
            {materiasDisponiveis
              .filter((m) => !materiasDoPlano.some((pm) => pm.nome === m.nome))
              .map((m) => (
                <option key={m.materiaId} value={m.materiaId}>
                  {m.nome}
                </option>
              ))}
          </select>

          <input
            type="number"
            min="5"
            max="200"
            className="form-control"
            placeholder="Horas totais"
            value={horasTotais}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setHorasTotais("");
              if (+v < 1 || +v > 200) return;
              setHorasTotais(+v);
            }}
          />
        </Modal.Body>

        <Modal.Footer>
          <button className={style.botao} onClick={adicionarMateria}>
            Adicionar
          </button>
          <button
            className={`${style.botao} ${style.concluir}`}
            onClick={() => {
              if (materiasDoPlano.length === 0) {
                return toast.warn("Adicione ao menos uma matéria ao plano");
              }

              setMostrarConfigurar(false);
              carregarPlanos();
            }}
          >
            Concluir
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarHoras} centered onHide={() => setMostrarHoras(false)}>
        <Modal.Header>
          <Modal.Title>Lançar horas — {materiaSelecionada?.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input
            type="number"
            min="1"
            max={
              (materiaSelecionada?.horasTotais ?? 0) -
              (materiaSelecionada?.horasConcluidas ?? 0)
            }
            className="form-control"
            placeholder="Horas estudadas"
            value={horasLancadas}
            onChange={(e) => {
              const v = e.target.value;
              const max =
                (materiaSelecionada?.horasTotais ?? 0) -
                (materiaSelecionada?.horasConcluidas ?? 0);

              if (v === "") return setHorasLancadas("");
              if (+v < 1 || +v > max) return;

              setHorasLancadas(+v);
            }}
          />
        </Modal.Body>

        <Modal.Footer>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarHoras(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={style.botao}
            onClick={lancarHoras}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>
              Lançar Horas
            </span>
            {loading && <span className={style.spinner} />}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarExcluir} centered>
        <Modal.Header>
          <Modal.Title>Excluir plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Tem certeza que deseja excluir o plano{" "}
          <strong>{planoParaExcluir?.titulo}</strong>?
          <br />
          Essa ação não poderá ser desfeita.
        </Modal.Body>

        <Modal.Footer>
          <button
            className={style.botao}
            onClick={() => setMostrarExcluir(false)}
          >
            Cancelar
          </button>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={async () => {
              try {
                await PlanoAPI.Excluir(planoParaExcluir.planoId);
                toast.success("Plano excluído");
                setMostrarExcluir(false);
                carregarPlanos();
              } catch {
                toast.error("Erro ao excluir plano");
              }
            }}
          >
            <BsTrash /> Excluir
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Planos;
