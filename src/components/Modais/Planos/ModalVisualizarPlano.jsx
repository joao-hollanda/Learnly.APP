import { Button, Modal } from "react-bootstrap";
import { BsClock, BsCheckLg, BsTrash } from "react-icons/bs";
import Card from "../../Card/Card";
import style from "../../../Pages/planos/_planos.module.css";

function ModalVisualizarPlano({
  show,
  onHide,
  planoVisualizado,
  viewingIndex,
  planoAtivoIndex,
  onAtivarPlano,
  onExcluir,
  onLancarHoras,
}) {
  return (
    <Modal show={show} centered size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <div className={style.header_content}>
          <button
            className={style.lixeira}
            onClick={() => {
              onHide();
              onExcluir(planoVisualizado);
            }}
          >
            <BsTrash />
          </button>

          <Modal.Title>{planoVisualizado?.titulo}</Modal.Title>

          {planoVisualizado && (
            <div className={style.info_container}>
              <div className={style.info_item}>
                <span className={style.info_label}>Início</span>
                <span className={style.info_value}>
                  {new Date(planoVisualizado.dataInicio).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className={style.info_item}>
                <span className={style.info_label}>Fim</span>
                <span className={style.info_value}>
                  {new Date(planoVisualizado.dataFim).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className={style.modal_body}>
        <div className={style.cards}>
          {planoVisualizado?.materias?.map((pm, i) => {
            const progresso = (pm.horasConcluidas / pm.horasTotais) * 100 || 0;
            return (
              <Card key={i} titulo={pm.nome} centralizado={true}>
                {pm.topicos?.length > 0 && (
                  <div className={style.topicos} style={{ textAlign: "center" }}>
                    <strong style={{ textAlign: "center" }}>Tópicos:</strong>
                    <ul style={{ textAlign: "left" }}>
                      {pm.topicos.map((topico, index) => (
                        <li key={index}>{topico}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className={style.horas}>
                  <BsClock size={12} /> {pm.horasConcluidas}h / {pm.horasTotais}h
                </p>
                <div className={style.progress}>
                  <div
                    className={style.progress_bar}
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <button
                  className={`${style.botao} ${style.full}`}
                  onClick={() => onLancarHoras(pm)}
                >
                  Lançar horas
                </button>
              </Card>
            );
          })}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {viewingIndex !== planoAtivoIndex && (
          <Button variant="primary" onClick={onAtivarPlano}>
            <BsCheckLg /> Ativar plano
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ModalVisualizarPlano;