import { FaPlus } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Button, Modal } from "react-bootstrap";

function ModalCriarEvento({ show, onHide, novoEvento, setNovoEvento, onConfirmar, loading, style }) {
  const diasSemana = [
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
    { label: "Dom", value: 0 },
  ];

  return (
    <Modal show={show} centered size="lg" onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-info">
          <FaRegCalendarAlt />
        </div>
        <Modal.Title>Criar evento de estudo</Modal.Title>
      </Modal.Header>

      <Modal.Body className={style.modal_body}>
        <div className={style.form_group}>
          <label>Nome do evento</label>
          <input
            className={style.input}
            value={novoEvento.titulo}
            onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
            placeholder="Ex: Matemática"
          />
        </div>

        <div className={style.horas}>
          <div className={style.form_group}>
            <label>Hora início</label>
            <input
              type="time"
              className={style.input}
              value={novoEvento.inicio}
              onChange={(e) => setNovoEvento({ ...novoEvento, inicio: e.target.value })}
            />
          </div>
          <div className={style.form_group}>
            <label>Hora fim</label>
            <input
              type="time"
              className={style.input}
              value={novoEvento.fim}
              onChange={(e) => setNovoEvento({ ...novoEvento, fim: e.target.value })}
            />
          </div>
        </div>

        <div className={style.form_group}>
          <label>Dias da semana</label>
          <div className={style.dias}>
            {diasSemana.map((dia) => (
              <button
                key={dia.value}
                className={
                  novoEvento.diasSemana.includes(dia.value) ? style.dia_ativo : style.dia
                }
                onClick={() => {
                  const selecionados = novoEvento.diasSemana.includes(dia.value)
                    ? novoEvento.diasSemana.filter((d) => d !== dia.value)
                    : [...novoEvento.diasSemana, dia.value];
                  setNovoEvento({ ...novoEvento, diasSemana: selecionados });
                }}
              >
                {dia.label}
              </button>
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirmar} disabled={loading}>
          {loading ? <span className={style.spinner} /> : <><FaPlus /> Criar eventos</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCriarEvento;