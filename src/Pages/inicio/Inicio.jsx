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
import EventoEstudoAPI from "../../services/EventoService";
import { MdOutlineRestartAlt } from "react-icons/md";
import Logout from "../../components/Logout/Logout";
import { getUserData } from "../../utils/cookieHelper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ModalCriarEvento from "../../components/Modais/Inicio/ModalCriarEvento";
import ModalResetEventos from "../../components/Modais/Inicio/ModalResetEventos";

function Inicio() {
  const [loading, setLoading] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [mostrarModalReset, setMostrarModalReset] = useState(false);
  const [novoEvento, setNovoEvento] = useState({
    titulo: "",
    inicio: "",
    fim: "",
    diasSemana: [],
  });

  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: planoAtivo } = useQuery({
    queryKey: ["planoAtivo"],
    queryFn: () => PlanoAPI.ObterPlanoAtivo(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: totalSimulados = 0 } = useQuery({
    queryKey: ["totalSimulados"],
    queryFn: () => SimuladoAPI.Contar(),
    staleTime: Infinity,
  });

  const { data: resumo } = useQuery({
    queryKey: ["resumo"],
    queryFn: () => PlanoAPI.ObterResumo(),
    onError: () => toast.error("Erro ao carregar resumo"),
  });

  const { data: comparacaoHoras = { horasHoje: 0, diferenca: 0 } } = useQuery({
    queryKey: ["comparacaoHoras"],
    queryFn: () => PlanoAPI.CompararHoras(),
    onError: () => toast.error("Erro ao carregar horas de estudo"),
  });

  const { data: eventosRaw = [] } = useQuery({
    queryKey: ["eventos"],
    queryFn: async () => {
      const eventosApi = await EventoEstudoAPI.Listar();
      return eventosApi.map((e) => ({
        id: e.eventoId,
        title: e.titulo,
        start: new Date(e.inicio),
        end: new Date(e.fim),
      }));
    },
    staleTime: Infinity,
    onError: () => toast.error("Erro ao carregar eventos"),
  });

  useEffect(() => {
    const interval = setInterval(() => setHoraAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const eventosComStatus = eventosRaw.map((evento) => {
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

  const percentualGeral =
    resumo && resumo.horasTotais > 0
      ? Math.round((resumo.horasConcluidas / resumo.horasTotais) * 100)
      : 0;

  const toUtcString = (date) => date.toISOString().slice(0, 19);

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

    const dataFimPlano = new Date(planoAtivo.dataFim);
    dataFimPlano.setHours(23, 59, 59, 999);

    const inicioBase = new Date();
    inicioBase.setHours(hIni, mIni, 0, 0);

    const fimBase = new Date();
    fimBase.setHours(hFim, mFim, 0, 0);

    if (fimBase < inicioBase) fimBase.setDate(fimBase.getDate() + 1);

    const duracaoMinutos = (fimBase.getTime() - inicioBase.getTime()) / 60000;

    if (duracaoMinutos < 60) {
      toast.error("Eventos devem ter no mínimo 1 hora de duração");
      return;
    }

    if (duracaoMinutos > 360) {
      toast.error("Eventos não podem ter mais de 6 horas de duração");
      return;
    }

    const dataAtualLoop = new Date();
    dataAtualLoop.setHours(0, 0, 0, 0);

    const listaEventosParaEnviar = [];

    while (dataAtualLoop <= dataFimPlano) {
      if (diasSemana.includes(dataAtualLoop.getDay())) {
        const dataInicioEvento = new Date(dataAtualLoop);
        dataInicioEvento.setHours(hIni, mIni, 0, 0);

        const dataFimEvento = new Date(dataAtualLoop);
        dataFimEvento.setHours(hFim, mFim, 0, 0);

        if (dataFimEvento < dataInicioEvento)
          dataFimEvento.setDate(dataFimEvento.getDate() + 1);

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
        await EventoEstudoAPI.CriarEmLote({ eventos: lote });
      }

      queryClient.invalidateQueries({ queryKey: ["eventos"] });

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
      setLoading(true);

      await EventoEstudoAPI.Remover();

      queryClient.invalidateQueries({ queryKey: ["eventos"] });

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
    //#region JSX
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
                    className={style.botao_criar}
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

      <ModalCriarEvento
        show={mostrarModalEvento}
        onHide={() => setMostrarModalEvento(false)}
        novoEvento={novoEvento}
        setNovoEvento={setNovoEvento}
        onConfirmar={handleCriarEventos}
        loading={loading}
      />

      <ModalResetEventos
        show={mostrarModalReset}
        onHide={() => setMostrarModalReset(false)}
        onConfirmar={handleResetEventos}
        loading={loading}
      />
    </div>
  );
}

export default Inicio;