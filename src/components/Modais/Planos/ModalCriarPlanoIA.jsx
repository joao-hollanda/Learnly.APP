import { Button } from "react-bootstrap";
import { BsStars } from "react-icons/bs";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

function ModalCriarPlanoIA({
  show,
  onHide,
  titulo,
  setTitulo,
  objetivo,
  setObjetivo,
  horasSemana,
  setHorasSemana,
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
      title="Criar plano com IA"
      iconType="warning"
      icon={<BsStars />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onCriar} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><BsStars /> Criar</>}
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
      <label className="form-label fw-semibold" style={{ fontSize: "0.8125rem", color: "#475569" }}>
        Carga horária semanal
      </label>
      <input
        type="number"
        className="form-control mb-3"
        placeholder="Horas por semana (máx: 60)"
        value={horasSemana}
        min={1}
        max={60}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return setHorasSemana("");
          if (+v < 1 || +v > 60) return;
          setHorasSemana(+v);
        }}
      />
      <div className="row g-3">
        <div className="col-6">
          <label className="form-label fw-semibold" style={{ fontSize: "0.8125rem", color: "#475569" }}>
            Data de início
          </label>
          <input
            type="date"
            className="form-control"
            value={dataInicio}
            min={hoje}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="col-6">
          <label className="form-label fw-semibold" style={{ fontSize: "0.8125rem", color: "#475569" }}>
            Data final
          </label>
          <input
            type="date"
            className="form-control"
            value={dataFim}
            min={dataInicio || hoje}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>
    </ModalBase>
  );
}

export default ModalCriarPlanoIA;
