import style from "./_plano.module.css";
import { useEffect, useState } from "react";

const SIZE = {
  grande: style.grande,
  medio: style.medio,
  pequeno: style.pequeno,
};

const Plano = ({ tamanho, titulo, objetivo, botao, materias, ativo = false }) => {
  const cardSizeClass = SIZE[tamanho] || style.medio;
  const [materiasPlano, setMaterias] = useState([]);

  useEffect(() => {
    setMaterias(Array.isArray(materias) ? materias : []);
  }, [materias]);

  const horasTotaisPlano = (materiasPlano || []).reduce(
    (acc, m) => acc + (m.horasTotais || 0),
    0,
  );
  const horasConcluidasPlano = (materiasPlano || []).reduce(
    (acc, m) => acc + (m.horasConcluidas || 0),
    0,
  );
  const progressoGeral =
    horasTotaisPlano > 0 ? (horasConcluidasPlano / horasTotaisPlano) * 100 : 0;

  return (
    <div
      className={`${style.plano} ${cardSizeClass} ${ativo ? style.ativoCard : ""}`}
    >
      <div className={style.topo}>
        <div className={style.tituloBloco}>
          <h4 className={style.titulo}>{titulo}</h4>
          {ativo && objetivo && <p className={style.objetivo}>{objetivo}</p>}
        </div>
        {ativo && <span className={style.badgeAtivo}>Ativo</span>}
      </div>

      {ativo ? (
        <>
          <div className={style.stats}>
            <div className={style.stat}>
              <span className={style.statNum}>{progressoGeral.toFixed(0)}%</span>
              <span className={style.statLabel}>Concluído</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNum}>{horasConcluidasPlano}h</span>
              <span className={style.statLabel}>Estudadas</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNum}>{horasTotaisPlano}h</span>
              <span className={style.statLabel}>Total</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNum}>{materiasPlano.length}</span>
              <span className={style.statLabel}>Matérias</span>
            </div>
          </div>

          <div className={style.progress}>
            <div
              className={style.progress_bar}
              style={{ width: `${progressoGeral}%` }}
            />
          </div>

          <div className={style.materias_container}>
            <p className={style.materiasLabel}>Matérias do plano</p>
            <div className={style.materiasGrid}>
              {materiasPlano.map((materia, index) => {
                const pct =
                  materia.horasTotais > 0
                    ? (materia.horasConcluidas / materia.horasTotais) * 100
                    : 0;
                return (
                  <div key={index} className={style.materiaRow}>
                    <span
                      className={style.materiaDot}
                      style={{ background: materia.cor || "var(--brand)" }}
                    />
                    <span className={style.materiaNome}>{materia.nome}</span>
                    <span className={style.materiaHoras}>
                      {materia.horasConcluidas}/{materia.horasTotais}h
                    </span>
                    <span className={style.materiaTrack}>
                      <span
                        className={style.materiaFill}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={style.progressoTopo}>
            <span className={style.progressoLabel}>Progresso</span>
            <span className={style.percentual}>
              {progressoGeral.toFixed(0)}%
            </span>
          </div>
          <div className={style.progress}>
            <div
              className={style.progress_bar}
              style={{ width: `${progressoGeral}%` }}
            />
          </div>
          <p className={style.metaInativo}>
            {horasConcluidasPlano}h de {horasTotaisPlano}h •{" "}
            {materiasPlano.length}{" "}
            {materiasPlano.length === 1 ? "matéria" : "matérias"}
          </p>
        </>
      )}

      {botao}
    </div>
  );
};

export default Plano;
