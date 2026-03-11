import { Button, Modal } from "react-bootstrap";
import { BsStars } from "react-icons/bs";
import style from "../../../Pages/planos/_planos.module.css";

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
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-warning">
          <BsStars />
        </div>
        <Modal.Title>Criar plano com IA</Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
        <label
          className="form-label fw-semibold"
          style={{ fontSize: "0.8125rem", color: "#475569" }}
        >
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
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "0.8125rem", color: "#475569" }}
            >
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
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "0.8125rem", color: "#475569" }}
            >
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
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onCriar} disabled={loading}>
          {loading ? (
            <span className={style.spinner} />
          ) : (
            <>
              <BsStars /> Criar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCriarPlanoIA;