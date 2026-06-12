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

  if (ativo) {
    return (
      <div className={`${style.plano} ${style.ativoCard}`}>
        <div className={style.mastTopo}>
          <div className={style.mastInfo}>
            <span className={style.kicker}>Plano ativo — Em andamento</span>
            <h4 className={style.titulo}>{titulo}</h4>
            {objetivo && <p className={style.objetivo}>{objetivo}</p>}

            <div className={style.progressoBloco}>
              <div className={style.progressoLinha}>
                <span className={style.materiasLabel}>Progresso geral</span>
                <span className={style.progressoPct}>
                  {progressoGeral.toFixed(0)}%
                </span>
              </div>
              <div className={style.progress}>
                <div
                  className={style.progress_bar}
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>
            </div>

            <div className={style.ctaLinha}>{botao}</div>
          </div>

          <div className={style.mastMaterias}>
            <p className={style.materiasLabel}>Matérias do plano</p>
            <div className={style.materiasGrid}>
              {materiasPlano.length === 0 && (
                <p className={style.materiasVazio}>
                  Nenhuma matéria ainda — adicione pelo botão de configurar o
                  plano.
                </p>
              )}
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
        </div>

        <div className={style.mastStats}>
          <div className={style.statCell}>
            <span className={style.statLabel}>Concluído</span>
            <span className={style.statNum}>
              {progressoGeral.toFixed(0)}
              <em>%</em>
            </span>
          </div>
          <div className={style.statCell}>
            <span className={style.statLabel}>Estudadas</span>
            <span className={style.statNum}>
              {horasConcluidasPlano}
              <em>h</em>
            </span>
          </div>
          <div className={style.statCell}>
            <span className={style.statLabel}>Total</span>
            <span className={style.statNum}>
              {horasTotaisPlano}
              <em>h</em>
            </span>
          </div>
          <div className={style.statCell}>
            <span className={style.statLabel}>Matérias</span>
            <span className={style.statNum}>{materiasPlano.length}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.plano} ${cardSizeClass}`}>
      <div className={style.topo}>
        <div className={style.tituloBloco}>
          <h4 className={style.titulo}>{titulo}</h4>
        </div>
      </div>

      <div className={style.progressoTopo}>
        <span className={style.progressoLabel}>Progresso</span>
        <span className={style.percentual}>{progressoGeral.toFixed(0)}%</span>
      </div>
      <div className={style.progress}>
        <div
          className={style.progress_bar}
          style={{ width: `${progressoGeral}%` }}
        />
      </div>
      <p className={style.metaInativo}>
        {horasConcluidasPlano}h de {horasTotaisPlano}h • {materiasPlano.length}{" "}
        {materiasPlano.length === 1 ? "matéria" : "matérias"}
      </p>
      {botao}
    </div>
  );
};

export default Plano;
