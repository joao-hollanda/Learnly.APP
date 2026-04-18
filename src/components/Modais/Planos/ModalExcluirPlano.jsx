import { Button } from "react-bootstrap";
import { BsExclamationTriangle, BsTrash } from "react-icons/bs";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

function ModalExcluirPlano({ show, onHide, planoParaExcluir, onExcluir, loading }) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Excluir plano"
      iconType="danger"
      icon={<BsExclamationTriangle />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onExcluir} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><BsTrash /> Excluir</>}
          </Button>
        </>
      }
    >
      Tem certeza que deseja excluir o plano?
      <br />
      <span className="modal-badge modal-badge-danger">{planoParaExcluir?.titulo}</span>
      <br />
      <small>Essa ação não poderá ser desfeita.</small>
    </ModalBase>
  );
}

export default ModalExcluirPlano;
