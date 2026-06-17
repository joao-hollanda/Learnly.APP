import { Button } from "react-bootstrap";
import { BsPeople, BsTrophyFill } from "react-icons/bs";
import ModalBase from "../ModalBase";
import style from "./_compartilhamento.module.css";

function ModalGrupoProgresso({ show, onHide, grupo, loading }) {
  const membros = grupo?.membros ?? [];

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Progresso do grupo"
      subtitle="Acompanhe como cada participante está evoluindo no plano."
      kicker="Compartilhamento"
      iconType="info"
      icon={<BsPeople />}
      footer={
        <Button variant="primary" onClick={onHide}>
          Fechar
        </Button>
      }
    >
      {loading ? (
        <p className={style.vazioGrupo}>Carregando...</p>
      ) : membros.length === 0 ? (
        <p className={style.vazioGrupo}>Ninguém resgatou este plano ainda.</p>
      ) : (
        <ul className={style.membros}>
          {membros.map((m, i) => (
            <li
              key={m.usuarioId}
              className={`${style.membro} ${m.eu ? style.membroEu : ""}`}
            >
              <div className={style.membroTopo}>
                <span className={style.membroNome}>
                  {i === 0 && <BsTrophyFill className={style.trofeu} />}
                  {m.nome}
                  {m.eu ? " (você)" : ""}
                </span>
                <span className={style.membroPct}>{m.percentual}%</span>
              </div>
              <div className={style.barra}>
                <div
                  className={style.barraFill}
                  style={{ width: `${m.percentual}%` }}
                />
              </div>
              <span className={style.membroHoras}>
                {m.horasConcluidas}h / {m.horasTotais}h
              </span>
            </li>
          ))}
        </ul>
      )}
    </ModalBase>
  );
}

export default ModalGrupoProgresso;
