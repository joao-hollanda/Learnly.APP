import { Button } from "react-bootstrap";
import { BsTrophyFill, BsCheckLg } from "react-icons/bs";
import { LuCalendarPlus, LuCalendarCheck } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import ModalBase from "../ModalBase";
import MateriaisRecomendados from "./MateriaisRecomendados";
import style from "../../../Pages/simulados/_simulados.module.css";

export default function ModalResultado({
  resultado,
  onFinalizar,
  disciplinasRevisao = [],
  onAgendarRevisoes,
  agendandoRevisoes,
  revisoesAgendadas,
}) {
  return (
    <ModalBase
      show={!!resultado}
      title="Resultado"
      kicker="Simulados"
      iconType="success"
      icon={<BsTrophyFill />}
      backdrop="static"
      keyboard={false}
      size="lg"
      scrollable
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

          {disciplinasRevisao.length > 0 && (
            <div className={style.revisaoBox}>
              {revisoesAgendadas ? (
                <p className={style.revisaoOk}>
                  <LuCalendarCheck /> Revisões agendadas no seu calendário —
                  amanhã, em 7 e em 16 dias.
                </p>
              ) : (
                <>
                  <p className={style.revisaoTexto}>
                    Fixe o que errou: agendamos revisões de{" "}
                    <strong>{disciplinasRevisao.join(", ")}</strong> no seu
                    calendário (amanhã, em 7 e em 16 dias).
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={onAgendarRevisoes}
                    disabled={agendandoRevisoes}
                  >
                    {agendandoRevisoes ? (
                      <span className={style.spinner} />
                    ) : (
                      <>
                        <LuCalendarPlus /> Agendar revisões
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          <MateriaisRecomendados materiais={resultado.materiaisRecomendados} />
        </>
      )}
    </ModalBase>
  );
}
