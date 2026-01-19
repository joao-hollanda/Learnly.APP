import { LuClock2 } from "react-icons/lu";
import style from "./_plano.module.css";
import { FaArrowTrendUp } from "react-icons/fa6";
import Bolinha from "../Bolinha/Bolinha";
import { useEffect, useState } from "react";

const SIZE = {
    grande: style.grande,
    medio: style.medio,
    pequeno: style.pequeno,
};

const Plano = ({ tamanho, titulo, icon, botao, materias, ativo = false }) => {
    const cardSizeClass = SIZE[tamanho] || style.medio;
    const [materiasPlano, setMaterias] = useState([]);

    useEffect(() => {
        setMaterias(Array.isArray(materias) ? materias : []);
    }, [materias]);

    const horasTotaisPlano = (materiasPlano || []).reduce(
        (acc, m) => acc + (m.horasTotais || 0),
        0
    );
    const horasConcluidasPlano = (materiasPlano || []).reduce(
        (acc, m) => acc + (m.horasConcluidas || 0),
        0
    );
    const progressoGeral =
        horasTotaisPlano > 0
            ? (horasConcluidasPlano / horasTotaisPlano) * 100
            : 0;

    return (
        <div className={`${style.plano_example} ${cardSizeClass}`}>
            <div className={style.titulo}>
                <div>
                    <h4>{titulo}</h4>
                    {icon && <div className={style.icon}>{icon}</div>}
                </div>
            </div>

            <span>Progresso Geral</span>
            <div className={style.progress}>
                <div
                    className={style.progress_bar}
                    style={{
                        width: `${progressoGeral}%`,
                        backgroundColor: "black",
                        transition: "width 0.6s ease-in-out",
                    }}
                ></div>
            </div>
            <p className={style.percentual}>
                {progressoGeral.toFixed(1)}%
            </p>

            {ativo && (
                <>
                    <div className={style.info_container}>
                        <div className={style.info}>
                            <div className={style.horas}>
                                <LuClock2 size="1.5rem" />
                            </div>
                            <div className={style.info_texto}>
                                <h4>{horasConcluidasPlano}h</h4>
                                <h5>de {horasTotaisPlano}h totais</h5>
                            </div>
                        </div>

                        {/* <div className={style.info}>
                            <div className={style.progresso}>
                                <FaArrowTrendUp
                                    size="1.5rem"
                                    color="rgb(9, 228, 9)"
                                />
                            </div>
                            <div className={style.info_texto}>
                                <h4>+12%</h4>
                                <h5>esta semana</h5>
                            </div>
                        </div> */}
                    </div>

                    <div className={style.materias_container}>
                        <p>{materiasPlano.length} matérias</p>
                        <div className={style.materias}>
                            {materiasPlano.map((materia, index) => (
                                <div key={index} className={style.materia}>
                                    <Bolinha
                                        cor={materia.cor}
                                        tamanho="pequena"
                                    />
                                    <span>{materia.nome}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {botao}
        </div>
    );
};

export default Plano;