import { Form } from "react-bootstrap";
import { BsClipboardCheck } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import ModalBase from "../ModalBase";
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
      iconType="info"
      icon={<BsClipboardCheck />}
      size="lg"
      scrollable
    >
      <div style={{ textAlign: "left" }}>
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
            <Form>
              {q.alternativas.map((a) => {
                const imagem = getImagemAlternativa(a);
                const marcada = previewRespostas[q.questaoId] === a.alternativaId;
                let classe = style.alternativa;
                if (a.correta) classe += ` ${style.correta}`;
                if (marcada && !a.correta) classe += ` ${style.errada}`;
                return (
                  <Form.Check
                    key={a.alternativaId}
                    type="radio"
                    disabled
                    checked={marcada}
                    className={classe}
                    label={
                      <div className={style.conteudoAlternativa}>
                        <span className={style.letra}>{a.letra})</span>
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
                    }
                  />
                );
              })}
            </Form>
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
