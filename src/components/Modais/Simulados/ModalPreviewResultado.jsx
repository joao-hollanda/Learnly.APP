import { BsClipboardCheck } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import ModalBase from "../ModalBase";
import MateriaisRecomendados from "./MateriaisRecomendados";
import style from "../../../Pages/simulados/_simulados.module.css";

const getImagemAlternativa = (a) => a.arquivo || null;

export default function ModalPreviewSimulado({
  simuladoPreview,
  previewRespostas,
  onHide,
}) {
  return (
    <ModalBase
      show={!!simuladoPreview}
      onHide={onHide}
      title={
        simuladoPreview
          ? `Simulado de ${new Date(simuladoPreview.data).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}`
          : ""
      }
      kicker="Simulados · Correção"
      iconType="info"
      icon={<BsClipboardCheck />}
      size="lg"
      scrollable
    >
      <div style={{ textAlign: "left" }}>
        {simuladoPreview?.desempenho?.feedback && (
          <div className={style.feedbackBox}>
            <div className={style.feedbackBadges}>
              <span className="modal-badge modal-badge-info">
                Nota: {Number(simuladoPreview.notaFinal ?? 0).toFixed(1)}
              </span>
              <span className="modal-badge modal-badge-success">
                Acertos: {simuladoPreview.desempenho.quantidadeDeAcertos}/
                {simuladoPreview.desempenho.quantidadeDeQuestoes}
              </span>
            </div>
            <h5>Feedback do desempenho</h5>
            <ReactMarkdown>{simuladoPreview.desempenho.feedback}</ReactMarkdown>
          </div>
        )}
        <MateriaisRecomendados materiais={simuladoPreview?.materiaisRecomendados} />
        {simuladoPreview?.questoes.map((q, i) => (
          <div key={q.questaoId} className={style.card}>
            <h4>
              {i + 1}. {q.titulo}
            </h4>
            {q.contexto && (
              <div className={style.markdown}>
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} className={style.imagem} loading="lazy" decoding="async" />
                    ),
                  }}
                >
                  {q.contexto}
                </ReactMarkdown>
              </div>
            )}
            {q.introducaoAlternativa}
            <div className={style.alternativas}>
              {q.alternativas.map((a) => {
                const imagem = getImagemAlternativa(a);
                const marcada = previewRespostas[q.questaoId] === a.alternativaId;
                let classe = style.alternativa;
                if (a.correta) classe += ` ${style.correta}`;
                if (marcada && !a.correta) classe += ` ${style.errada}`;
                return (
                  <div key={a.alternativaId} className={classe}>
                    <span className={style.letra}>{a.letra}</span>
                    <div className={style.conteudoAlternativa}>
                      {a.texto ? (
                        <span>{a.texto}</span>
                      ) : imagem ? (
                        <ReactMarkdown
                          components={{
                            img: ({ node, ...props }) => (
                              <img {...props} className={style.imagem} />
                            ),
                          }}
                        >
                          {`![](${imagem})`}
                        </ReactMarkdown>
                      ) : (
                        <span className={style.semConteudo}>
                          (alternativa sem conteúdo)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {simuladoPreview.respostas?.find((r) => r.questaoId === q.questaoId)?.explicacao && (
              <div className={style.explicacaoBox}>
                <h5>Explicação:</h5>
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} className={style.imagem} loading="lazy" decoding="async" />
                    ),
                  }}
                >
                  {simuladoPreview.respostas.find((r) => r.questaoId === q.questaoId).explicacao}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
