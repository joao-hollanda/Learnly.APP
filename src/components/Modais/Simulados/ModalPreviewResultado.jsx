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
        {simuladoPreview?.materiaisRecomendados?.length > 0 && (
          <div className={style.materiaisBox}>
            <h5>Materiais recomendados</h5>
            <div className={style.materiaisGrid}>
              {simuladoPreview.materiaisRecomendados.map((m, idx) => {
                const termo = encodeURIComponent(m.termoBusca || m.titulo);
                const fallback =
                  m.plataforma === "youtube"
                    ? `https://www.youtube.com/results?search_query=${termo}`
                    : `https://www.google.com/search?q=${termo}`;
                const link = m.url || fallback;
                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={style.materialCard}
                  >
                    <div className={style.materialTopo}>
                      {m.tipo && <span className={style.materialTipo}>{m.tipo}</span>}
                      {m.area && <span className={style.materialArea}>{m.area}</span>}
                    </div>
                    <span className={style.materialTitulo}>{m.titulo}</span>
                    {m.motivo && (
                      <span className={style.materialMotivo}>{m.motivo}</span>
                    )}
                    <span className={style.materialLink}>
                      {m.plataforma === "youtube"
                        ? "Assistir no YouTube"
                        : "Abrir material"}{" "}
                      →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
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
