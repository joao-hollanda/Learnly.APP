import { useState } from "react";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { FaBrain, FaPaperPlane } from "react-icons/fa";
import style from "./_mentorIA.module.css";

function MentorIA() {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([
    {
      autor: "ia",
      texto:
        "Oi! 👋 Eu sou a MentorIA, seu mentor feito pra ajudar nas suas dúvidas.\nMe pergunte qualquer coisa sobre seus estudos!",
    },
  ]);

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;

    setConversa((prev) => [
      ...prev,
      { autor: "aluno", texto: mensagem },
      {
        autor: "ia",
        texto:
          "Boa pergunta! 🤔\nEstou analisando e já te explico da melhor forma possível.",
      },
    ]);

    setMensagem("");
  };

  return (
    <div>
      <Header />

      <div className={style.container}>
        <h2>TiraDúvIA</h2>
        <h3>Sua inteligência artificial para tirar dúvidas</h3>

        <Card
          titulo="Chat de estudos"
          subtitulo="Pergunte sobre qualquer matéria"
          tamanho="grande"
          icon={<FaBrain />}
        >
          <div className={style.chat}>
            {conversa.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.autor === "aluno" ? style.mensagemAluno : style.mensagemIA
                }
              >
                {msg.texto}
              </div>
            ))}
          </div>

          <div className={style.inputArea}>
            <input
              type="text"
              className={style.input}
              placeholder="Digite sua dúvida..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
            />

            <button className={style.botao} onClick={enviarMensagem}>
              <FaPaperPlane />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MentorIA;
