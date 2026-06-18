import { LuSparkles } from "react-icons/lu";
import ModalBase from "../ModalBase";
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
            <p>{m.texto}</p>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
