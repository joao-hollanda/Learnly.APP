import { useState, useEffect } from "react";
import { LuClock3 } from "react-icons/lu";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import Header from "../../components/Header/Header";
import style from "./_inicio.module.css";
import { GiProgression } from "react-icons/gi";
import { RiFilePaper2Fill } from "react-icons/ri";
import { FaBrain } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import CalendarView from "../../components/Calendario/Calendario";
import { IoSchool } from "react-icons/io5";
import PlanoAPI from "../../services/PlanoService";
import { getApiError } from "../../services/client";
import { toast } from "react-toastify";
import SimuladoAPI from "../../services/SimuladoService";
import EventoEstudoAPI from "../../services/EventoService";
import { MdOutlineRestartAlt } from "react-icons/md";
import { getUserData } from "../../utils/cookieHelper";
import { identificarUsuario } from "../../utils/analytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ModalCriarEvento from "../../components/Modais/Inicio/ModalCriarEvento";
import ModalResetEventos from "../../components/Modais/Inicio/ModalResetEventos";

const STATUS_EVENTO = {
  concluido: "Concluído",
  atual: "Agora",
  proximo: "Próximo",
};

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

  useEffect(() => {
    if (userData?.id)
      identificarUsuario(userData.id, {
        nome: userData.nome,
        email: userData.email,
      });
  }, [userData]);

  const { data: planoAtivo, isPending: loadPlano } = useQuery({
    queryKey: ["planoAtivo"],
    queryFn: () => PlanoAPI.ObterPlanoAtivo(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: totalSimulados = 0, isPending: loadTotal } = useQuery({
    queryKey: ["totalSimulados"],
    queryFn: () => SimuladoAPI.Contar(),
    staleTime: Infinity,
  });

  const { data: resumo, isPending: loadResumo } = useQuery({
    queryKey: ["resumo"],
    queryFn: () => PlanoAPI.ObterResumo(),
    onError: () => toast.error("Erro ao carregar resumo"),
  });

  const { data: comparacaoHoras = { horasHoje: 0, diferenca: 0 }, isPending: loadHoras } = useQuery({
    queryKey: ["comparacaoHoras"],
    queryFn: () => PlanoAPI.CompararHoras(),
    onError: () => toast.error("Erro ao carregar horas de estudo"),
  });

  const { data: eventosRaw = [], isPending: loadEventos } = useQuery({
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
      toast.error(getApiError(erro, "Erro ao salvar eventos no servidor."));
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
      toast.error(getApiError(erro, "Erro ao resetar eventos"));
    } finally {
      setLoading(false);
    }
  };

  const dataFormatada = horaAtual.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const fmtHora = (d) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const carregandoStats = loadPlano || loadTotal || loadResumo || loadHoras;
  const carregandoConteudo = loadEventos;

  return (
    //#region JSX
    <div className={`page ${style.pageInicio}`}>
      <Header />
      <div className={style.container}>
        {carregandoStats ? (
          <section className={style.statsGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} lines={1} />
            ))}
          </section>
        ) : (
          <section className={style.masthead}>
            <div className={style.mastTopo}>
              <div className={style.mastTexto}>
                <span className={style.mastKicker}>{dataFormatada}</span>
                <h2 className={style.saudacao}>
                  Olá, {userData?.nome || "Estudante"}
                </h2>
                <p className={style.sub}>
                  Aqui está o resumo do seu progresso. Vamos continuar de onde
                  você parou.
                </p>
              </div>
              <span className={style.mastIndice}>01 / Início</span>
            </div>

            <div className={style.mastStats}>
              <div className={style.mastCell}>
                <span className={style.mastLabel}>
                  <LuClock3 /> Horas hoje
                </span>
                <span className={style.mastValor}>
                  {comparacaoHoras.horasHoje}
                  <em>h</em>
                </span>
                <span className={style.mastExtra}>
                  {comparacaoHoras.diferenca === 0
                    ? "Mesmo que ontem"
                    : comparacaoHoras.diferenca > 0
                      ? `+${comparacaoHoras.diferenca}h desde ontem`
                      : `${comparacaoHoras.diferenca}h desde ontem`}
                </span>
              </div>

              <div className={style.mastCell}>
                <span className={style.mastLabel}>
                  <RiFilePaper2Fill /> Plano atual
                </span>
                <span className={`${style.mastValor} ${style.mastTexto2}`}>
                  {planoAtivo ? planoAtivo.titulo : "—"}
                </span>
                <span className={style.mastExtra}>
                  {planoAtivo ? "Em andamento" : "Nenhum plano ativo"}
                </span>
              </div>

              <div className={style.mastCell}>
                <span className={style.mastLabel}>
                  <GiProgression /> Progresso geral
                </span>
                <span className={style.mastValor}>
                  {percentualGeral}
                  <em>%</em>
                </span>
                <span className={style.mastBarra}>
                  <span
                    className={style.mastBarraFill}
                    style={{ width: `${percentualGeral}%` }}
                  />
                </span>
                <span className={style.mastExtra}>
                  {resumo
                    ? `${resumo.horasConcluidas}/${resumo.horasTotais} horas concluídas`
                    : "Carregando..."}
                </span>
              </div>

              <div className={style.mastCell}>
                <span className={style.mastLabel}>
                  <FaBrain /> Simulados
                </span>
                <span className={style.mastValor}>{totalSimulados}</span>
                <span className={style.mastExtra}>Concluídos até hoje</span>
              </div>
            </div>
          </section>
        )}

        {carregandoConteudo ? (
          <section className={style.contentGrid}>
            <SkeletonCard chart={220} grande />
            <SkeletonCard chart={260} grande />
          </section>
        ) : (
          <section className={style.contentGrid}>
            <div className={style.panel}>
              <div className={style.panelHead}>
                <div className={style.panelTitulo}>
                  <span className={style.panelIcone}>
                    <IoSchool />
                  </span>
                  <div>
                    <h3>Cronograma de hoje</h3>
                    <span>Suas sessões de estudo</span>
                  </div>
                </div>
                <span className={style.panelBadge}>
                  {eventosHoje.length}{" "}
                  {eventosHoje.length === 1 ? "sessão" : "sessões"}
                </span>
              </div>

              {eventosHoje.length === 0 ? (
                <div className={style.cronogramaVazio}>
                  <FaRegCalendarAlt />
                  <p>Nenhuma sessão de estudo programada para hoje.</p>
                </div>
              ) : (
                <div className={style.timeline}>
                  {eventosHoje.map((e, i) => (
                    <div
                      key={i}
                      className={`${style.tlItem} ${style[`tl_${e.status}`]}`}
                    >
                      <span className={style.tlHora}>{fmtHora(e.start)}</span>
                      <span className={style.tlRail}>
                        <span className={style.tlDot} />
                      </span>
                      <div className={style.tlBody}>
                        <div className={style.tlLinha1}>
                          <strong className={style.tlTitulo}>{e.title}</strong>
                          <span className={style.tlStatus}>
                            {STATUS_EVENTO[e.status]}
                          </span>
                        </div>
                        <span className={style.tlIntervalo}>
                          {fmtHora(e.start)} — {fmtHora(e.end)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={style.panel}>
              <div className={style.panelHead}>
                <div className={style.panelTitulo}>
                  <span className={style.panelIcone}>
                    <FaRegCalendarAlt />
                  </span>
                  <div>
                    <h3>Calendário</h3>
                    <span>Visão geral do mês</span>
                  </div>
                </div>
                <div className={style.panelAcoes}>
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
              </div>

              <div className={style.calendario_container}>
                <CalendarView eventos={eventosComStatus} />
              </div>
            </div>
          </section>
        )}
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
