import { Modal, Button } from "react-bootstrap";
import { BsTrophyFill, BsCheckLg } from "react-icons/bs";
import ReactMarkdown from "react-markdown";

export default function ModalResultado({ resultado, onFinalizar }) {
  return (
    <Modal centered show={!!resultado} backdrop="static" keyboard={false}>
      <Modal.Header>
        <div className="modal-icon modal-icon-success">
          <BsTrophyFill />
        </div>
        <Modal.Title>Resultado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resultado && (
          <>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className="modal-badge modal-badge-info">
                Nota: {resultado.nota.toFixed(1)}
              </span>
              <span className="modal-badge modal-badge-success">
                Acertos: {resultado.desempenho.quantidadeDeAcertos}
              </span>
            </div>
            <ReactMarkdown>{resultado.desempenho.feedback}</ReactMarkdown>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onFinalizar}>
          <BsCheckLg /> Concluir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}