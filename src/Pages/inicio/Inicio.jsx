import { useState, useEffect } from "react";
import { LuClock3 } from "react-icons/lu";
import Card from "../../components/Card/Card";
import Header from "../../components/Header/Header";
import style from "./_inicio.module.css";
import { GiProgression } from "react-icons/gi";
import { RiFilePaper2Fill } from "react-icons/ri";
import { FaBrain } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import Bolinha from "../../components/Bolinha/Bolinha";
import CalendarView from "../../components/Calendario/Calendario";
import { IoSchool } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import PlanoAPI from "../../services/PlanoService";
import { toast } from "react-toastify";
import SimuladoAPI from "../../services/SimuladoService";

function Inicio() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [resumo, setResumo] = useState(null);
  const [totalSimulados, setTotalSimulados] = useState(0);

  const token = sessionStorage.getItem("token");

  const usuarioId = sessionStorage.getItem("id");

  const REGISTROS_KEY = usuarioId
    ? `registrosEstudo_usuario_${usuarioId}`
    : null;

  const PLANO_ATIVO_KEY = usuarioId ? `planoAtivo_usuario_${usuarioId}` : null;

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      sessionStorage.setItem("id", decoded.id);
      sessionStorage.setItem("nome", decoded.nome);
    }
  }, [token]);

  const [eventos] = useState([
    {
      title: "Teste",
      start: new Date("2026-01-07T10:00:00"),
      end: new Date("2026-01-07T10:00:00"),
    },
    {
      title: "Teste",
      start: new Date("2026-01-07T12:00:00"),
      end: new Date("2026-01-07T18:00:00"),
    },
    {
      title: "Teste",
      start: new Date("2026-01-07T17:00:00"),
      end: new Date("2026-01-07T18:00:00"),
    },
    {
      title: "Teste",
      start: new Date("2026-01-07T17:00:00"),
      end: new Date("2026-01-07T18:00:00"),
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => setHoraAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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

  const eventosHoje = eventosComStatus.filter(
    (evento) => evento.start.toDateString() === horaAtual.toDateString(),
  );

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
    obterResumo();
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
      console.log(erro);
    }
  };
  const getHorasPorDia = (dataISO) => {
    if (!REGISTROS_KEY) return 0;

    const registros = JSON.parse(localStorage.getItem(REGISTROS_KEY)) || [];

    return registros
      .filter((r) => r.data === dataISO)
      .reduce((soma, r) => soma + r.horas, 0);
  };

  const hojeISO = new Date().toISOString().split("T")[0];

  const ontemISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  const horasHoje = getHorasPorDia(hojeISO);
  const horasOntem = getHorasPorDia(ontemISO);
  const diferenca = horasHoje - horasOntem;

  const percentualGeral =
    resumo && resumo.horasTotais > 0
      ? Math.round((resumo.horasConcluidas / resumo.horasTotais) * 100)
      : 0;

  return (
    <div>
      <Header />
      <div className={style.container}>
        <div>
          <h2>Olá, {sessionStorage.getItem("nome")}!</h2>
          <h3>Aqui está seu resumo</h3>

          <div className={style.info_container}>
            <div className={style.info}>
              <Card
                titulo={"Horas de estudo hoje"}
                children={<span>{horasHoje}h</span>}
                adicional={
                  diferenca === 0
                    ? "Mesmo que ontem"
                    : diferenca > 0
                      ? `+${diferenca}h desde ontem`
                      : `${diferenca}h desde ontem`
                }
                icon={<LuClock3 />}
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
                titulo={"Plano Atual"}
                children={
                  <span>
                    {PLANO_ATIVO_KEY
                      ? localStorage.getItem(PLANO_ATIVO_KEY)
                      : "-"}
                  </span>
                }
                tamanho="medio"
                icon={<RiFilePaper2Fill />}
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
              children={<CalendarView eventos={eventosComStatus} />}
              tamanho="grande"
              icon={<FaRegCalendarAlt />}
              className={style.calendario_card}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
