import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useEffect, useState } from "react";
import { FaBrain, FaPlay, FaPlus, FaTrash } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import Card from "../../components/Card/Card";
import { toast } from "react-toastify";
import PlanoAPI from "../../services/PlanoService";
import { Button, Modal } from "react-bootstrap";
import { ImHappy } from "react-icons/im";
import {
  BsCheckLg,
  BsClock,
  BsExclamationTriangle,
  BsGear,
  BsJournalPlus,
  BsPlus,
  BsRobot,
  BsStar,
  BsStars,
  BsTrash,
} from "react-icons/bs";
import Select from "react-select";

const mapPlanoBackend = (plano) => ({
  planoId: plano.planoId,
  titulo: plano.titulo,
  objetivo: plano.objetivo,
  dataInicio: plano.dataInicio,
  dataFim: plano.dataFim,
  horasPorSemana: plano.horasPorSemana,
  ativo: plano.ativo,

  materias: (plano.planoMaterias ?? []).map((pm) => ({
    planoMateriaId: pm.planoMateriaId,
    materiaId: pm.materiaId,
    nome: pm.materia.nome,
    cor: pm.materia.cor,
    horasTotais: pm.horasTotais,
    horasConcluidas: pm.horasConcluidas,
    topicos: pm.topicos ?? [],
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
  const [horasSemana, setHorasSemana] = useState();

  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);
  const [horasLancadas, setHorasLancadas] = useState("");

  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);

  const [mostrarIa, setMostrarIa] = useState(false);

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

  const abrirPlanoIa = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }

    setTitulo("");
    setObjetivo("");
    setMostrarIa(true);
  };

  const diferencaEmDias = (inicio, fim) => {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    const diffTime = dataFim.getTime() - dataInicio.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const criarPlano = async (planoIA) => {
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
        dataInicio: new Date(dataInicio + "T00:00:00").toISOString(),
        dataFim: new Date(dataFim + "T00:00:00").toISOString(),
        horasPorSemana: horasSemana,
        ativo: true,
        planoIa: planoIA,
      });

      await PlanoAPI.AtivarPlano(planoCriado.planoId, usuarioId);

      setPlanoConfigId(planoCriado.planoId);
      setMostrarCriarPlano(false);

      if (!planoIA) {
        setMostrarConfigurar(true);
      } else {
        setMostrarConfigurar(false);
      }

      carregarPlanos();
      setMateriasDoPlano([]);

      toast.success("Plano criado e ativado!");
      setMostrarIa(false);
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
      setLoading(true);
      await PlanoAPI.AdicionarMateria(planoConfigId, {
        materiaId,
        horasTotais,
      });

      const materia = materiasDisponiveis.find((m) => m.materiaId == materiaId);

      setMateriasDoPlano((prev) => [
        ...prev,
        { nome: materia.nome, horasTotais, horasConcluidas: 0 },
      ]);

      setMateriaId("");
      setHorasTotais("");
      toast.success("Matéria adicionada");
    } catch {
      toast.error("Erro ao adicionar matéria");
    } finally {
      setLoading(false);
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
    //#region JSX
    <div className="page">
      <Header
        children={
          <button className={style.botao} onClick={abrirCriarPlano}>
            <FaPlus />
          </button>
        }
      />

      <div className={style.fab_container}>
        <button className={style.fab} onClick={abrirPlanoIa}>
          <BsRobot className={style.icon} />
        </button>
      </div>

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
      {/* //#endregion */}

      {/* //#region Mostrar Plano */}
      <Modal
        show={mostrarPlano}
        centered
        size="xl"
        onHide={() => setMostrarPlano(false)}
      >
        <Modal.Header closeButton>
          <div className={style.header_content}>
            <button
              className={style.lixeira}
              onClick={() => {
                setMostrarPlano(false);
                setPlanoParaExcluir(planoVisualizado);
                setMostrarExcluir(true);
              }}
            >
              <BsTrash />
            </button>

            <Modal.Title>{planoVisualizado?.titulo}</Modal.Title>

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
                    {new Date(planoVisualizado.dataFim).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className={style.modal_body}>
          <div className={style.cards}>
            {planoVisualizado?.materias?.map((pm, i) => {
              const progresso =
                (pm.horasConcluidas / pm.horasTotais) * 100 || 0;
              return (
                <Card key={i} titulo={pm.nome}>
                  {pm.topicos?.length > 0 && (
                    <div className={style.topicos}>
                      <strong style={{textAlign: "center"}}>Tópicos:</strong>
                      <ul style={{textAlign: "left"}}>
                        {pm.topicos.map((topico, index) => (
                          <li key={index}>{topico}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className={style.horas}>
                    <BsClock size={12} /> {pm.horasConcluidas}h /{" "}
                    {pm.horasTotais}h
                  </p>

                  <div className={style.progress}>
                    <div
                      className={style.progress_bar}
                      style={{ width: `${progresso}%` }}
                    />
                  </div>

                  <button
                    className={`${style.botao} ${style.full}`}
                    onClick={() => abrirLancamentoHoras(pm)}
                  >
                    Lançar horas
                  </button>
                </Card>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer>
          {viewingIndex !== planoAtivoIndex && (
            <Button variant="primary" onClick={handleAtivarPlano}>
              <BsCheckLg /> Ativar plano
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}

      {/* //#region Criar com IA */}
      <Modal show={mostrarIa} centered onHide={() => setMostrarIa(false)}>
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-warning">
            <BsStars />
          </div>
          <Modal.Title>Criar plano com IA</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input
            className="form-control mb-3"
            placeholder="Título do plano"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            className="form-control mb-3"
            placeholder="Objetivo"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />

          <label
            className="form-label fw-semibold"
            style={{ fontSize: "0.8125rem", color: "#475569" }}
          >
            Carga horária semanal
          </label>
          <input
            type="number"
            className="form-control mb-3"
            placeholder="Horas por semana (máx: 60)"
            value={horasSemana}
            min={1}
            max={60}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setHorasSemana("");
              if (+v < 1 || +v > 60) return;
              setHorasSemana(+v);
            }}
          />

          <div className="row g-3">
            <div className="col-6">
              <label
                className="form-label fw-semibold"
                style={{ fontSize: "0.8125rem", color: "#475569" }}
              >
                Data de início
              </label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                min={hoje}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label
                className="form-label fw-semibold"
                style={{ fontSize: "0.8125rem", color: "#475569" }}
              >
                Data final
              </label>
              <input
                type="date"
                className="form-control"
                value={dataFim}
                min={dataInicio || hoje}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarIa(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => criarPlano(true)}
            disabled={loading}
          >
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsStars /> Criar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}

      {/* //#region Criar Plano */}
      <Modal
        show={mostrarCriarPlano}
        centered
        onHide={() => setMostrarCriarPlano(false)}
      >
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-success">
            <BsJournalPlus />
          </div>
          <Modal.Title>Criar plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input
            className="form-control mb-3"
            placeholder="Título do plano"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            className="form-control mb-3"
            placeholder="Objetivo"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />

          <div className="row g-3">
            <div className="col-6">
              <label
                className="form-label fw-semibold"
                style={{ fontSize: "0.8125rem", color: "#475569" }}
              >
                Data de início
              </label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                min={hoje}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label
                className="form-label fw-semibold"
                style={{ fontSize: "0.8125rem", color: "#475569" }}
              >
                Data final
              </label>
              <input
                type="date"
                className="form-control"
                value={dataFim}
                min={dataInicio || hoje}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMostrarCriarPlano(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => criarPlano(false)}
            disabled={loading}
          >
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsJournalPlus /> Criar plano
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}

      {/* //#region Configurar */}
      <Modal
        show={mostrarConfigurar}
        centered
        onHide={() => setMostrarConfigurar(false)}
      >
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-info">
            <BsGear />
          </div>
          <Modal.Title>Configurar plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Select
            options={materiasDisponiveis.map((m) => ({
              value: m.materiaId,
              label: m.nome,
              isDisabled: materiasDoPlano.some((pm) => pm.nome === m.nome),
            }))}
            value={
              materiaId
                ? materiasDisponiveis
                    .map((m) => ({ value: m.materiaId, label: m.nome }))
                    .find((o) => o.value === materiaId) || null
                : null
            }
            onChange={(selected) => setMateriaId(selected?.value || "")}
            placeholder="Selecione a matéria"
            isClearable
          />

          {materiasDisponiveis.filter(
            (m) => !materiasDoPlano.some((pm) => pm.nome === m.nome),
          ).length === 0 && (
            <small className="text-muted mt-1 d-block">
              Todas as matérias já foram adicionadas
            </small>
          )}

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label
                className="fw-semibold"
                style={{ fontSize: "0.875rem", color: "#475569" }}
              >
                Horas totais
              </label>
              <span
                className="modal-badge modal-badge-info"
                style={{ marginTop: 0 }}
              >
                {horasTotais || 0}h
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={1}
              value={horasTotais || 5}
              onChange={(e) => setHorasTotais(+e.target.value)}
              className="form-range"
            />
            <input
              type="number"
              min={5}
              max={200}
              className="form-control mt-1"
              placeholder="Ou digite o valor (5–200)"
              value={horasTotais || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return setHorasTotais("");
                const num = +v;
                if (num < 5 || num > 200) return;
                setHorasTotais(num);
              }}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={adicionarMateria}>
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsPlus /> Adicionar
              </>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (materiasDoPlano.length === 0)
                return toast.warn("Adicione ao menos uma matéria ao plano");
              setMostrarConfigurar(false);
              carregarPlanos();
            }}
          >
            <BsCheckLg /> Concluir
          </Button>
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}

      {/* //#region Mostrar Horas */}
      <Modal show={mostrarHoras} centered onHide={() => setMostrarHoras(false)}>
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-info">
            <BsClock />
          </div>
          <Modal.Title>Lançar horas</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <span className="modal-badge modal-badge-info">
            {materiaSelecionada?.nome}
          </span>

          <input
            type="number"
            min="1"
            max={
              (materiaSelecionada?.horasTotais ?? 0) -
              (materiaSelecionada?.horasConcluidas ?? 0)
            }
            className="form-control mt-3"
            placeholder="Quantas horas você estudou?"
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
          <Button variant="secondary" onClick={() => setMostrarHoras(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={lancarHoras} disabled={loading}>
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsClock /> Lançar horas
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}

      {/* //#region Excluir */}
      <Modal
        show={mostrarExcluir}
        centered
        onHide={() => setMostrarExcluir(false)}
      >
        <Modal.Header closeButton>
          <div className="modal-icon modal-icon-danger">
            <BsExclamationTriangle />
          </div>
          <Modal.Title>Excluir plano</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Tem certeza que deseja excluir o plano?
          <br />
          <span className="modal-badge modal-badge-danger">
            {planoParaExcluir?.titulo}
          </span>
          <br />
          <small>Essa ação não poderá ser desfeita.</small>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarExcluir(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await PlanoAPI.Excluir(planoParaExcluir.planoId);
                toast.success("Plano excluído");
                setMostrarExcluir(false);
                carregarPlanos();
              } catch {
                toast.error("Erro ao excluir plano");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <span className={style.spinner} />
            ) : (
              <>
                <BsTrash /> Excluir
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* //#endregion */}
    </div>
  );
}

export default Planos;
