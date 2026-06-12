import { Button } from "react-bootstrap";
import { BsJournalPlus } from "react-icons/bs";
import ModalBase from "../ModalBase";
import DatePicker from "../../DatePicker/DatePicker";
import style from "../_modal.module.css";

function ModalCriarPlano({
  show,
  onHide,
  titulo,
  setTitulo,
  objetivo,
  setObjetivo,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  hoje,
  onCriar,
  loading,
}) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Criar plano"
      subtitle="Defina o objetivo e o período de estudo"
      kicker="Planos"
      iconType="success"
      icon={<BsJournalPlus />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onCriar} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><BsJournalPlus /> Criar plano</>}
          </Button>
        </>
      }
    >
      <div className={style.campo}>
        <span className={style.label}>Título</span>
        <input
          className="form-control"
          placeholder="Ex: Rumo ao ENEM 2026"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className={style.campo}>
        <span className={style.label}>Objetivo</span>
        <input
          className="form-control"
          placeholder="Ex: Medicina na UFPE"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
        />
      </div>

      <div className={style.grid2}>
        <div className={style.campo}>
          <span className={style.label}>Data de início</span>
          <DatePicker value={dataInicio} onChange={setDataInicio} min={hoje} />
        </div>
        <div className={style.campo}>
          <span className={style.label}>Data final</span>
          <DatePicker
            value={dataFim}
            onChange={setDataFim}
            min={dataInicio || hoje}
          />
        </div>
      </div>
    </ModalBase>
  );
}

export default ModalCriarPlano;
