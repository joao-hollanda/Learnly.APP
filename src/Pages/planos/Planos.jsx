import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useEffect, useState } from "react";
import { FaPlay, FaPlus } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import Card from "../../components/Card/Card";
import { toast } from "react-toastify";
import PlanoAPI from "../../services/PlanoService";
import { Modal } from "react-bootstrap";
import { ImHappy } from "react-icons/im";

const mapPlanoBackend = (plano) => ({
  planoId: plano.planoId,
  titulo: plano.titulo,
  objetivo: plano.objetivo,
  ativo: plano.ativo,
  dataInicio: plano.dataInicio?.split("T")[0],
  dataFim: plano.dataFim?.split("T")[0],
  materias: plano.planoMaterias.map((pm) => ({
    planoMateriaId: pm.planoMateriaId,
    nome: pm.materia.nome,
    cor: pm.materia.cor,
    horasTotais: pm.horasTotais,
    horasConcluidas: pm.horasConcluidas,
  })),
});

function Planos() {
  const usuarioId = sessionStorage.getItem("id");

  const REGISTROS_KEY = `registrosEstudo_usuario_${usuarioId}`;
  const PLANO_ATIVO_KEY = `planoAtivo_usuario_${usuarioId}`;

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

  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);
  const [horasLancadas, setHorasLancadas] = useState("");

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

    const horasHoje = horasLancadasHoje();
    const totalComNovoLancamento = horasHoje + Number(horasLancadas);

    if (totalComNovoLancamento > LIMITE_DIARIO) {
      return toast.warn(
        `Limite diário de ${LIMITE_DIARIO}h atingido. Você já lançou ${horasHoje}h hoje.`,
      );
    }

    try {
      await PlanoAPI.LancarHoras(
        materiaSelecionada.planoMateriaId,
        Number(horasLancadas),
      );

      registrarHorasDiarias(Number(horasLancadas));

      toast.success("Horas lançadas");
      setMostrarHoras(false);
      carregarPlanos();
    } catch (erro) {
      toast.error("Erro ao lançar horas");
      console.log(erro);
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

  const materiasJaAdicionadas =
    planosList.find((p) => p.planoId === planoConfigId)?.materias || [];

  const abrirCriarPlano = () => {
    setTitulo("");
    setObjetivo("");
    setMostrarCriarPlano(true);
  };

  const criarPlano = async () => {
    if (!titulo || !objetivo || !dataInicio || !dataFim)
      return toast.warn("Preencha todos os campos!");

    if (dataFim < dataInicio)
      return toast.warn("Data final não pode ser anterior à data de inicio");

    try {
      const planoCriado = await PlanoAPI.Criar({
        titulo,
        objetivo,
        usuarioId,
        dataInicio,
        dataFim,
      });

      await PlanoAPI.AtivarPlano(planoCriado.planoId, usuarioId);

      localStorage.setItem(PLANO_ATIVO_KEY, planoCriado.titulo);

      setPlanoConfigId(planoCriado.planoId);
      setMostrarCriarPlano(false);
      setMostrarConfigurar(true);

      carregarPlanos(); 
      toast.success("Plano criado e ativado!");
    } catch {
      toast.error("Erro ao criar plano");
    }
  };

  const registrarHorasDiarias = (horas) => {
    const hoje = new Date().toISOString().split("T")[0];

    const registros = JSON.parse(localStorage.getItem(REGISTROS_KEY)) || [];

    registros.push({
      data: hoje,
      horas,
    });

    localStorage.setItem(REGISTROS_KEY, JSON.stringify(registros));
  };

  const adicionarMateria = async () => {
    if (!materiaId || !horasTotais)
      return toast.warn("Preencha todos os campos");

    if (horasTotais < 5)
      return toast.warn("É necessário pelo menos 5 horas semanais!");

    const materiaSelecionada = materiasDisponiveis.find(
      (m) => m.materiaId == materiaId,
    );

    if (materiasJaAdicionadas.some((m) => m.nome === materiaSelecionada.nome)) {
      return toast.warn("Essa matéria já foi adicionada");
    }

    try {
      await PlanoAPI.AdicionarMateria(planoConfigId, {
        materiaId,
        horasTotais,
      });

      setMateriaId("");
      setHorasTotais("");
      toast.success("Matéria adicionada");
      carregarPlanos();
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

      localStorage.setItem(PLANO_ATIVO_KEY, plano.titulo);

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

  const horasLancadasHoje = () => {
    const hoje = new Date().toISOString().split("T")[0];
    const registros = JSON.parse(localStorage.getItem(REGISTROS_KEY)) || [];

    return registros
      .filter((r) => r.data === hoje)
      .reduce((soma, r) => soma + r.horas, 0);
  };

  return (
    <div>
      <Header
        children={
          <button className={style.criar} onClick={abrirCriarPlano}>
            <FaPlus />
          </button>
        }
      />

      {planosList.length === 0 ? (
        <div className={style.vazio}>
          Nenhum plano ainda, que tal criar um? <ImHappy />
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
          {viewingIndex !== planoAtivoIndex && (
            <button className={style.botao} onClick={handleAtivarPlano}>
              Ativar
            </button>
          )}
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarPlano(false)}
          >
            Fechar
          </button>
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
          <button className={style.botao} onClick={criarPlano}>
            Criar
          </button>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarCriarPlano(false)}
          >
            Cancelar
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
              .filter(
                (m) => !materiasJaAdicionadas.some((pm) => pm.nome === m.nome),
              )
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
              if (materiasJaAdicionadas.length === 0) {
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
          <button className={style.botao} onClick={lancarHoras}>
            Salvar
          </button>
          <button
            className={`${style.botao} ${style.danger}`}
            onClick={() => setMostrarHoras(false)}
          >
            Cancelar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Planos;
