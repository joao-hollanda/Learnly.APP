import { LuSparkles } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import ModalBase from "../ModalBase";
import { normalizarMatematica } from "../../../utils/markdown";
import style from "./_chatModais.module.css";

export default function ModalVerSessaoIA({ show, onHide, sessao }) {
  const mensagens = sessao?.mensagens ?? [];

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      kicker="Conversa com a IA"
      title={sessao?.titulo ?? "Sessão de estudo"}
      icon={<LuSparkles />}
      scrollable
    >
      <div className={style.sessao}>
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`${style.sessaoMsg} ${
              m.autor === "aluno" ? style.sessaoAluno : style.sessaoIa
            }`}
          >
            <span className={style.sessaoAutor}>
              {m.autor === "aluno" ? "Você" : "Mentor IA"}
            </span>
            {m.autor === "aluno" ? (
              <p>{m.texto}</p>
            ) : (
              <div className={style.sessaoMd}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[[rehypeKatex, { errorColor: "#64748b" }]]}
                >
                  {normalizarMatematica(m.texto)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
