import { MdOutlineRestartAlt } from "react-icons/md";
import { Button, Modal } from "react-bootstrap";

function ModalResetEventos({ show, onHide, onConfirmar, loading, style }) {
  return (
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-danger">
          <MdOutlineRestartAlt />
        </div>
        <Modal.Title>Resetar eventos</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Tem certeza que deseja apagar todos os eventos de estudo do seu calendário?
        <br />
        <span className="modal-badge modal-badge-danger">
          Essa ação não pode ser desfeita.
        </span>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={loading}>
          {loading ? <span className={style.spinner} /> : <><MdOutlineRestartAlt /> Confirmar</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalResetEventos;