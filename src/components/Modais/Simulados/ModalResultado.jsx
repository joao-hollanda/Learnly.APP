import { Button } from "react-bootstrap";
import { BsTrophyFill, BsCheckLg } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import ModalBase from "../ModalBase";

export default function ModalResultado({ resultado, onFinalizar }) {
  return (
    <ModalBase
      show={!!resultado}
      title="Resultado"
      iconType="success"
      icon={<BsTrophyFill />}
      backdrop="static"
      keyboard={false}
      footer={
        <Button variant="primary" onClick={onFinalizar}>
          <BsCheckLg /> Concluir
        </Button>
      }
    >
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
    </ModalBase>
  );
}
