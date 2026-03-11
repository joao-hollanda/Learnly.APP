import { Button, Modal } from "react-bootstrap";
import { BsJournalPlus } from "react-icons/bs";
import style from "../../../Pages/planos/_planos.module.css";

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
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-success">
          <BsJournalPlus />
        </div>
        <Modal.Title>Criar plano</Modal.Title>
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
              <BsJournalPlus /> Criar plano
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCriarPlano;