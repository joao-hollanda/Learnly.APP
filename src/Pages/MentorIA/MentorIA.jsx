import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import { FaPaperPlane } from "react-icons/fa";
import style from "./_mentorIA.module.css";
import MentorIAAPI from "../../services/MentorIAService";
import ReactMarkdown from "react-markdown";

function MentorIA() {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([
    {
      autor: "ia",
      texto:
        "Olá! \nSou o MentorIA, sua Inteligência Artificial preparada pra atender suas necessidades.\nPode mandar sua dúvida 😊",
    },
  ]);

  const [carregandoIA, setCarregandoIA] = useState(false);
  const [digitandoIA, setDigitandoIA] = useState(false);

  const chatRef = useRef(null);

  const inputRef = useRef(null);

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const escreverTextoAosPoucos = (texto, callback, velocidade = 1) => {
    let i = 0;
    setDigitandoIA(true);

    const interval = setInterval(() => {
      callback(texto.slice(0, i + 1));
      i++;

      if (i >= texto.length) {
        clearInterval(interval);
        setDigitandoIA(false);
      }
    }, velocidade);
  };

  const enviarMensagem = async () => {
    if (!mensagem.trim() || carregandoIA || digitandoIA) return;

    const pergunta = mensagem;

    setMensagem("");

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    setCarregandoIA(true);

    setConversa((prev) => [
      ...prev,
      { autor: "aluno", texto: pergunta },
      { autor: "ia", tipo: "loading" },
    ]);

    try {
      const mensagensParaIA = [
        ...conversa
          .filter((m) => m.texto)
          .map((m) => ({
            role: m.autor === "aluno" ? "user" : "assistant",
            content: m.texto,
          })),
        { role: "user", content: pergunta },
      ];

      const resposta = await MentorIAAPI.EnviarMensagem({
        Mensagens: mensagensParaIA,
      });

      const respostaIA = resposta.resposta;

      setConversa((prev) =>
        prev
          .filter((m) => m.tipo !== "loading")
          .concat({ autor: "ia", texto: "" }),
      );

      escreverTextoAosPoucos(respostaIA, (textoParcial) => {
        setConversa((prev) => {
          const nova = [...prev];
          nova[nova.length - 1] = {
            autor: "ia",
            texto: textoParcial,
          };
          return nova;
        });
      });
    } catch {
      setConversa((prev) =>
        prev
          .filter((m) => m.tipo !== "loading")
          .concat({
            autor: "ia",
            texto: "Ocorreu um erro ao falar com a IA. Tente novamente.",
          }),
      );
    } finally {
      setCarregandoIA(false);
    }
  };

  /* auto-scroll */
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversa]);

  return (
    <div className={style.page}>
      <Header />

      <div className={style.chat} ref={chatRef}>
        {conversa.map((msg, index) => {
          if (msg.tipo === "loading") {
            return (
              <div key={index} className={style.balaoIA}>
                <div className={style.loading}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={
                msg.autor === "aluno" ? style.balaoAluno : style.balaoIA
              }
            >
              <ReactMarkdown>{msg.texto}</ReactMarkdown>
            </div>
          );
        })}
      </div>

      <div className={style.inputWrapper}>
        <div className={style.inputArea}>
          <textarea
            ref={inputRef}
            className={style.input}
            placeholder="Digite sua dúvida..."
            value={mensagem}
            disabled={carregandoIA || digitandoIA}
            rows={1}
            onChange={(e) => {
              setMensagem(e.target.value);
              autoResize(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
              }
            }}
          />

          <button
            className={style.botao}
            onClick={enviarMensagem}
            disabled={carregandoIA || digitandoIA}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentorIA;
