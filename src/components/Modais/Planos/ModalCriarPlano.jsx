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
      <input
        className="form-control mb-3"
        placeholder="Título do plano"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <input
        className="form-control mb-3"
        placeholder="Objetivo"
        value={objetivo}
        onChange={(e) => setObjetivo(e.target.value)}
      />
      <div className="row g-3">
        <div className="col-6">
          <label className="form-label fw-semibold" style={{ fontSize: "0.8125rem", color: "#475569" }}>
            Data de início
          </label>
          <DatePicker value={dataInicio} onChange={setDataInicio} min={hoje} />
        </div>
        <div className="col-6">
          <label className="form-label fw-semibold" style={{ fontSize: "0.8125rem", color: "#475569" }}>
            Data final
          </label>
          <DatePicker value={dataFim} onChange={setDataFim} min={dataInicio || hoje} />
        </div>
      </div>
    </ModalBase>
  );
}

export default ModalCriarPlano;
