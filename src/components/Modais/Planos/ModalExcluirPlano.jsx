import { Button, Modal } from "react-bootstrap";
import { BsExclamationTriangle, BsTrash } from "react-icons/bs";
import style from "../../../Pages/planos/_planos.module.css";

function ModalExcluirPlano({ show, onHide, planoParaExcluir, onExcluir, loading }) {
  return (
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-danger">
          <BsExclamationTriangle />
        </div>
        <Modal.Title>Excluir plano</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Tem certeza que deseja excluir o plano?
        <br />
        <span className="modal-badge modal-badge-danger">
          {planoParaExcluir?.titulo}
        </span>
        <br />
        <small>Essa ação não poderá ser desfeita.</small>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" disabled={loading} onClick={onExcluir}>
          {loading ? (
            <span className={style.spinner} />
          ) : (
            <>
              <BsTrash /> Excluir
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalExcluirPlano;