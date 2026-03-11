import { Button, Modal } from "react-bootstrap";
import { BsClock } from "react-icons/bs";
import style from "../../../Pages/planos/_planos.module.css";


function ModalLancarHoras({
  show,
  onHide,
  materiaSelecionada,
  horasLancadas,
  setHorasLancadas,
  onLancar,
  loading,
}) {
  const max =
    (materiaSelecionada?.horasTotais ?? 0) -
    (materiaSelecionada?.horasConcluidas ?? 0);

  return (
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-info">
          <BsClock />
        </div>
        <Modal.Title>Lançar horas</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <span className="modal-badge modal-badge-info">
          {materiaSelecionada?.nome}
        </span>
        <input
          type="number"
          min="1"
          max={max}
          className="form-control mt-3"
          placeholder="Quantas horas você estudou?"
          value={horasLancadas}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setHorasLancadas("");
            if (+v < 1 || +v > max) return;
            setHorasLancadas(+v);
          }}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onLancar} disabled={loading}>
          {loading ? (
            <span className={style.spinner} />
          ) : (
            <>
              <BsClock /> Lançar horas
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalLancarHoras;