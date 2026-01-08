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

function Inicio() {
    const [horaAtual, setHoraAtual] = useState(new Date());

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

    const eventosComStatus = eventos.map(evento => {
        const agora = horaAtual.getTime();
        const inicio = evento.start.getTime();
        const fim = evento.end.getTime();

        let status = "";
        if (agora < inicio) status = "proximo";
        else if (agora >= inicio && agora <= fim) status = "atual";
        else status = "concluido";

        return { ...evento, status };
    });

    const eventosHoje = eventosComStatus.filter(evento =>
        evento.start.toDateString() === horaAtual.toDateString()
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

    const usuario = {
        nome: "Hollanda",
        quantidadeSimulados: 1,
        planoAtual: "Enem",
        horas: 4.5,
        progressoSemanal: 50,
    };

    return (
        <div>
            <Header />
            <div className={style.container}>
                <div>
                    <h2>Olá, {usuario.nome}!</h2>
                    <h3>Aqui está seu resumo para hoje</h3>

                    <div className={style.info_container}>
                        <div className={style.info}>
                            <Card
                                titulo={"Horas de estudo hoje"}
                                children={<span>{usuario.horas}</span>}
                                tamanho="medio"
                                adicional="+1.2 desde ontem"
                                icon={<LuClock3 />}
                            />
                            <Card
                                titulo={"Progresso semanal"}
                                children={<span>{usuario.progressoSemanal + "%"}</span>}
                                tamanho="medio"
                                adicional="25/50 horas completadas"
                                icon={<GiProgression />}
                            />
                            <Card
                                titulo={"Plano Atual"}
                                children={<span>{usuario.planoAtual}</span>}
                                tamanho="medio"
                                icon={<RiFilePaper2Fill />}
                            />
                            <Card
                                titulo={"Simulados concluidos"}
                                children={<span>{usuario.quantidadeSimulados}</span>}
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