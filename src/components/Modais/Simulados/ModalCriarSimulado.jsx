import { Form, Modal, Button } from "react-bootstrap";
import { BsClipboardPlus } from "react-icons/bs";
import style from "../../../Pages/simulados/_simulados.module.css";

const materias = [
  { label: "Linguagens", value: "linguagens" },
  { label: "Matemática", value: "matematica" },
  { label: "Ciências da Natureza", value: "ciencias-natureza" },
  { label: "Ciências Humanas", value: "ciencias-humanas" },
];

export default function ModalCriarSimulado({
  show,
  onHide,
  loading,
  quantidade,
  setQuantidade,
  materiasSelecionadas,
  toggleMateria,
  onGerar,
}) {
  return (
    <Modal centered show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-info">
          <BsClipboardPlus />
        </div>
        <Modal.Title>Novo simulado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label
          className="form-label fw-semibold"
          style={{ fontSize: "0.8125rem", color: "#475569" }}
        >
          Matérias
        </label>
        {materias.map((m) => (
          <Form.Check
            key={m.value}
            label={m.label}
            checked={materiasSelecionadas.includes(m.value)}
            onChange={() => toggleMateria(m.value)}
            style={{ textAlign: "left" }}
          />
        ))}
        <label
          className="form-label fw-semibold mt-3"
          style={{ fontSize: "0.8125rem", color: "#475569" }}
        >
          Quantidade de questões
        </label>
        <input
          type="number"
          className="form-control mt-1"
          value={quantidade}
          min={1}
          max={25}
          placeholder="Máx: 25"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setQuantidade("");
            if (+v < 1 || +v > 25) return;
            setQuantidade(+v);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onGerar} disabled={loading}>
          {loading ? (
            <span className={style.spinner} />
          ) : (
            <>
              <BsClipboardPlus /> Criar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
