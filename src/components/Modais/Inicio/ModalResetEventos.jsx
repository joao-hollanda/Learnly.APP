import { Button } from "react-bootstrap";
import { MdOutlineRestartAlt } from "react-icons/md";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

function ModalResetEventos({ show, onHide, onConfirmar, loading }) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Resetar eventos"
      iconType="danger"
      icon={<MdOutlineRestartAlt />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirmar} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><MdOutlineRestartAlt /> Confirmar</>}
          </Button>
        </>
      }
    >
      Tem certeza que deseja apagar todos os eventos de estudo do seu calendário?
      <br />
      <span className="modal-badge modal-badge-danger">
        Essa ação não pode ser desfeita.
      </span>
    </ModalBase>
  );
}

export default ModalResetEventos;
