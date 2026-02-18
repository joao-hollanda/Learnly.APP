import { useState, useEffect } from "react";
import { LuClock3 } from "react-icons/lu";
import Card from "../../components/Card/Card";
import Header from "../../components/Header/Header";
import style from "./_inicio.module.css";
import { GiProgression } from "react-icons/gi";
import { RiFilePaper2Fill } from "react-icons/ri";
import { FaBrain } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import Bolinha from "../../components/Bolinha/Bolinha";
import CalendarView from "../../components/Calendario/Calendario";
import { IoSchool } from "react-icons/io5";
import PlanoAPI from "../../services/PlanoService";
import { toast } from "react-toastify";
import SimuladoAPI from "../../services/SimuladoService";
import { Modal } from "react-bootstrap";
import EventoEstudoAPI from "../../services/EventoService";
import { MdOutlineRestartAlt } from "react-icons/md";
import Logout from "../../components/Logout/Logout";
import { getUserData } from "../../utils/cookieHelper";

function Inicio() {
  const [loading, setLoading] = useState(false);

  const [horaAtual, setHoraAtual] = useState(new Date());
  const [resumo, setResumo] = useState(null);
  const [totalSimulados, setTotalSimulados] = useState(0);

  const [planoAtivo, setPlanoAtivo] = useState(null);

  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);

  const [eventos, setEventos] = useState([]);

  const [mostrarModalReset, setMostrarModalReset] = useState(false);

  const [novoEvento, setNovoEvento] = useState({
    titulo: "",
    inicio: "",
    fim: "",
    diasSemana: [],
  });

  const diasSemana = [
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
    { label: "Dom", value: 0 },
  ];

  const [userData, setUserData] = useState(null);

  const [comparacaoHoras, setComparacaoHoras] = useState({
    horasHoje: 0,
    diferenca: 0,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
        sessionStorage.setItem("id", data.id.toString());
        sessionStorage.setItem("nome", data.nome);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    obterResumo();
    obterComparacaoHoras();
    obterPlanoAtivo();
    obterEventos();
  }, []);

  const obterPlanoAtivo = async () => {
    const usuarioId = sessionStorage.getItem("id");
    const resposta = await PlanoAPI.ObterPlanoAtivo(usuarioId);
    setPlanoAtivo(resposta);
  };

  const eventosComStatus = eventos.map((evento) => {
    const agora = horaAtual.getTime();
    const inicio = evento.start.getTime();
    const fim = evento.end.getTime();

    let status = "";
    if (agora < inicio) status = "proximo";
    else if (agora >= inicio && agora <= fim) status = "atual";
    else status = "concluido";

    return { ...evento, status };
  });

  const eventosHoje = eventosComStatus
    .filter(
      (evento) => evento.start.toDateString() === horaAtual.toDateString(),
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const getColor = (status) => {
    switch (status) {
      case "concluido":
        return "#22c55e";
      case "atual":
        return "#2263c5";
      case "proximo":
        return "#c52222";
      default:
        return "#999";
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date());
    }, 60000); // atualiza a cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  const obterResumo = async () => {
    try {
      const usuarioId = sessionStorage.getItem("id");

      const resposta = await PlanoAPI.ObterResumo(usuarioId);

      const totalSimulados = await SimuladoAPI.Contar(usuarioId);

      setTotalSimulados(totalSimulados);
      setResumo(resposta);
    } catch (erro) {
      toast.error("Erro ao carregar resumo");
    }
  };

  const obterEventos = async () => {
    try {
      const usuarioId = Number(sessionStorage.getItem("id"));

      const eventosApi = await EventoEstudoAPI.Listar(usuarioId);

      const eventosFormatados = eventosApi.map((e) => ({
        id: e.eventoId,
        title: e.titulo,
        start: new Date(e.inicio),
        end: new Date(e.fim),
      }));

      setEventos(eventosFormatados);
    } catch (erro) {
      toast.error("Erro ao carregar eventos");
      console.error(erro);
    }
  };

  const obterComparacaoHoras = async () => {
    try {
      const usuarioId = sessionStorage.getItem("id");
      const resposta = await PlanoAPI.CompararHoras(usuarioId);
      setComparacaoHoras(resposta);
    } catch (erro) {
      toast.error("Erro ao carregar horas de estudo");
    }
  };

  const percentualGeral =
    resumo && resumo.horasTotais > 0
      ? Math.round((resumo.horasConcluidas / resumo.horasTotais) * 100)
      : 0;

  const toUtcString = (date) => {
    return date.toISOString().slice(0, 19);
  };

  const handleCriarEventos = async () => {
    if (!planoAtivo) {
      toast.error("Plano ativo ainda não carregado");
      return;
    }

    const { titulo, inicio, fim, diasSemana } = novoEvento;

    if (!titulo || !inicio || !fim || diasSemana.length === 0) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (inicio === fim) {
      toast.error("Hora início e fim não podem ser iguais");
      return;
    }

    const [hIni, mIni] = inicio.split(":").map(Number);
    const [hFim, mFim] = fim.split(":").map(Number);

    const usuarioId = Number(sessionStorage.getItem("id"));

    const dataFimPlano = new Date(planoAtivo.dataFim);
    dataFimPlano.setHours(23, 59, 59, 999);

    const dataAtualLoop = new Date();
    dataAtualLoop.setHours(0, 0, 0, 0);

    const inicioBase = new Date();
    inicioBase.setHours(hIni, mIni, 0, 0);

    const fimBase = new Date();
    fimBase.setHours(hFim, mFim, 0, 0);

    if (fimBase < inicioBase) {
      fimBase.setDate(fimBase.getDate() + 1);
    }

    const duracaoMinutos = (fimBase.getTime() - inicioBase.getTime()) / 60000;

    if (duracaoMinutos < 60) {
      toast.error("Eventos devem ter no mínimo 1 hora de duração");
      return;
    }

    if (duracaoMinutos > 360) {
      toast.error("Eventos não podem ter mais de 6 horas de duração");
      return;
    }

    const listaEventosParaEnviar = [];

    while (dataAtualLoop <= dataFimPlano) {
      if (diasSemana.includes(dataAtualLoop.getDay())) {
        const dataInicioEvento = new Date(dataAtualLoop);
        dataInicioEvento.setHours(hIni, mIni, 0, 0);

        const dataFimEvento = new Date(dataAtualLoop);
        dataFimEvento.setHours(hFim, mFim, 0, 0);

        if (dataFimEvento < dataInicioEvento) {
          dataFimEvento.setDate(dataFimEvento.getDate() + 1);
        }

        listaEventosParaEnviar.push({
          titulo,
          inicio: toUtcString(dataInicioEvento),
          fim: toUtcString(dataFimEvento),
        });
      }

      dataAtualLoop.setDate(dataAtualLoop.getDate() + 1);
    }

    if (listaEventosParaEnviar.length === 0) {
      toast.warn("Nenhum evento gerado no período selecionado.");
      return;
    }

    try {
      setLoading(true);

      const TAMANHO_LOTE = 100;

      for (let i = 0; i < listaEventosParaEnviar.length; i += TAMANHO_LOTE) {
        const lote = listaEventosParaEnviar.slice(i, i + TAMANHO_LOTE);

        await EventoEstudoAPI.CriarEmLote({
          usuarioId,
          eventos: lote,
        });
      }

      await obterEventos();

      setMostrarModalEvento(false);
      setNovoEvento({ titulo: "", inicio: "", fim: "", diasSemana: [] });

      toast.success("Eventos criados com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar eventos:", erro);
      toast.error("Erro ao salvar eventos no servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetEventos = async () => {
    try {
      const usuarioId = Number(sessionStorage.getItem("id"));

      setLoading(true);

      await EventoEstudoAPI.Remover(usuarioId);

      await obterEventos();

      toast.success("Todos os eventos foram removidos com sucesso!");
      setMostrarModalReset(false);
    } catch (erro) {
      console.error(erro);
      toast.error("Erro ao resetar eventos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Header children={<Logout />} />
      <div className={style.container}>
        <div>
          <h2>Olá, {userData?.nome || "Usuário"}!</h2>
          <h3>Aqui está seu resumo</h3>

          <div className={style.info_container}>
            <div className={style.info}>
              <Card
                titulo={"Horas de estudo hoje"}
                children={<span>{comparacaoHoras.horasHoje}h</span>}
                adicional={
                  comparacaoHoras.diferenca === 0
                    ? "Mesmo que ontem"
                    : comparacaoHoras.diferenca > 0
                      ? `+${comparacaoHoras.diferenca}h desde ontem`
                      : `${comparacaoHoras.diferenca}h desde ontem`
                }
                icon={<LuClock3 />}
              />

              <Card
                titulo={"Plano Atual"}
                children={<span>{planoAtivo ? planoAtivo.titulo : "-"}</span>}
                tamanho="medio"
                icon={<RiFilePaper2Fill />}
              />

              <Card
                titulo={"Progresso geral"}
                children={<span>{percentualGeral}%</span>}
                tamanho="medio"
                adicional={
                  resumo
                    ? `${resumo.horasConcluidas}/${resumo.horasTotais} horas concluídas`
                    : "Carregando..."
                }
                icon={<GiProgression />}
              />

              <Card
                titulo={"Simulados concluidos"}
                children={<span>{totalSimulados}</span>}
                tamanho="medio"
                icon={<FaBrain />}
              />
            </div>
          </div>

          <div className={style.grid}>
            <Card
              titulo={"Cronograma de hoje"}
              tamanho="grande"
              icon={<IoSchool />}
              subtitulo="Suas sessões de estudo para hoje"
              children={
                <>
                  {eventosHoje.map((e, i) => {
                    const inicio = e.start.getHours();
                    const fim = e.end.getHours();

                    return (
                      <Card
                        key={i}
                        tamanho="pequeno"
                        titulo={e.title}
                        subtitulo={`${inicio}h - ${fim}h`}
                        detalhe={<Bolinha cor={getColor(e.status)} />}
                      />
                    );
                  })}
                </>
              }
            />

            <Card
              titulo={"Calendário Semanal"}
              children={
                <div className={style.calendario_container}>
                  <CalendarView eventos={eventosComStatus} />
                </div>
              }
              tamanho="grande"
              icon={<FaRegCalendarAlt />}
              className={style.calendario_card}
              detalhe={
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className={style.botao}
                    onClick={() => setMostrarModalEvento(true)}
                    title="Criar eventos"
                  >
                    <FaPlus />
                  </button>

                  <button
                    className={style.botao_reset}
                    onClick={() => setMostrarModalReset(true)}
                    title="Resetar eventos"
                  >
                    <MdOutlineRestartAlt />
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Modal
        show={mostrarModalEvento}
        centered
        size="lg"
        onHide={() => setMostrarModalEvento(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Criar evento de estudo</Modal.Title>
        </Modal.Header>

        <Modal.Body className={style.modal_body}>
          <div className={style.form_group}>
            <label>Nome do evento</label>
            <input
              className={style.input}
              value={novoEvento.titulo}
              onChange={(e) =>
                setNovoEvento({ ...novoEvento, titulo: e.target.value })
              }
              placeholder="Ex: Matemática"
            />
          </div>

          <div className={style.horas}>
            <div className={style.form_group}>
              <label>Hora início</label>
              <input
                type="time"
                className={style.input}
                value={novoEvento.inicio}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, inicio: e.target.value })
                }
              />
            </div>

            <div className={style.form_group}>
              <label>Hora fim</label>
              <input
                type="time"
                className={style.input}
                value={novoEvento.fim}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, fim: e.target.value })
                }
              />
            </div>
          </div>

          <div className={style.form_group}>
            <label>Dias da semana</label>
            <div className={style.dias}>
              {diasSemana.map((dia) => (
                <button
                  key={dia.value}
                  className={
                    novoEvento.diasSemana.includes(dia.value)
                      ? style.dia_ativo
                      : style.dia
                  }
                  onClick={() => {
                    const selecionados = novoEvento.diasSemana.includes(
                      dia.value,
                    )
                      ? novoEvento.diasSemana.filter((d) => d !== dia.value)
                      : [...novoEvento.diasSemana, dia.value];

                    setNovoEvento({
                      ...novoEvento,
                      diasSemana: selecionados,
                    });
                  }}
                >
                  {dia.label}
                </button>
              ))}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className={style.modal_footer}>
          <button
            type="button"
            className={style.botao_cancelar}
            onClick={() => setMostrarModalEvento(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={style.botao}
            onClick={handleCriarEventos}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>
              Criar Eventos
            </span>

            {loading && <span className={style.spinner} />}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={mostrarModalReset}
        centered
        onHide={() => setMostrarModalReset(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Resetar eventos</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Esta ação irá <strong>apagar todos os eventos de estudo</strong> do
            seu calendário.
          </p>
          <p>Essa ação não pode ser desfeita.</p>
        </Modal.Body>

        <Modal.Footer>
          <button
            className={style.botao_cancelar}
            onClick={() => setMostrarModalReset(false)}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={style.botao}
            onClick={handleResetEventos}
            disabled={loading}
          >
            <span className={loading ? style.hiddenText : ""}>Confirmar</span>

            {loading && <span className={style.spinner} />}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Inicio;
