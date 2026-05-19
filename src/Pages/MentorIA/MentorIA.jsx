import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import { FaPaperPlane } from "react-icons/fa";
import {
  FaChartBar,
  FaCalendarAlt,
  FaCrosshairs,
  FaTrash,
  FaPlus,
  FaExchangeAlt,
  FaClock,
  FaBookOpen,
} from "react-icons/fa";
import style from "./_mentorIA.module.css";
import MentorIAAPI from "../../services/MentorIAService";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";

const DICAS = [
  { icone: <FaChartBar />, texto: "Como estou indo nos simulados?" },
  { icone: <FaCalendarAlt />, texto: "Qual é meu plano de estudo atual?" },
  { icone: <FaCrosshairs />, texto: "Quais são meus pontos fracos?" },
  { icone: <FaBookOpen />, texto: "Quero revisar questões que errei" },
  { icone: <FaPlus />, texto: "Adiciona Física no meu plano" },
  { icone: <FaTrash />, texto: "Remove Química do meu plano" },
  { icone: <FaExchangeAlt />, texto: "Substitui História por Geografia" },
  { icone: <FaClock />, texto: "Aumenta minha carga horária para 15h" },
];

function MentorIA() {
  const queryClient = useQueryClient();

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
  const [dicaAtual, setDicaAtual] = useState(0);
  const [dicaVisivel, setDicaVisivel] = useState(true);

  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Alterna dicas a cada 3s com fade
  useEffect(() => {
    const interval = setInterval(() => {
      setDicaVisivel(false);
      setTimeout(() => {
        setDicaAtual((prev) => (prev + 1) % DICAS.length);
        setDicaVisivel(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const escreverTextoAosPoucos = (texto, callback, velocidade = 16) => {
    let i = 0;
    setDigitandoIA(true);

    const interval = setInterval(() => {
      i = Math.min(i + 2, texto.length); // 8 caracteres por tick
      callback(texto.slice(0, i));

      if (i >= texto.length) {
        clearInterval(interval);
        setDigitandoIA(false);
      }
    }, velocidade);
  };

  const processarResposta = (resposta) => {
    const respostaIA = resposta.resposta;

    // Invalida planos se a IA criou/modificou algo
    const keywords = [
      "criado",
      "ativado",
      "removida",
      "adicionada",
      "substituída",
      "reajustada",
      "estendido",
    ];
    if (keywords.some((k) => respostaIA?.toLowerCase().includes(k))) {
      queryClient.invalidateQueries({
        queryKey: ["planos"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["planoAtivo"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["resumo"],
        refetchType: "active",
      });
    }

    setConversa((prev) =>
      prev
        .filter((m) => m.tipo !== "loading")
        .concat({ autor: "ia", texto: "" }),
    );
    escreverTextoAosPoucos(respostaIA, (textoParcial) => {
      setConversa((prev) => {
        const nova = [...prev];
        nova[nova.length - 1] = { autor: "ia", texto: textoParcial };
        return nova;
      });
    });
  };

  const enviarMensagem = async (textoPergunta) => {
    const pergunta = textoPergunta ?? mensagem;
    if (!pergunta.trim() || carregandoIA || digitandoIA) return;

    setMensagem("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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
      processarResposta(resposta);
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

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversa]);

  const dica = DICAS[dicaAtual];

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
        <div className={style.dicaWrapper}>
          <button
            className={`${style.dica} ${dicaVisivel ? style.dicaVisivel : style.dicaOculta}`}
            onClick={() => enviarMensagem(dica.texto)}
            disabled={carregandoIA || digitandoIA}
          >
            <span className={style.dicaIcone}>{dica.icone}</span>
            <span>{dica.texto}</span>
          </button>

          <div className={style.dicaDots}>
            {DICAS.map((_, i) => (
              <span
                key={i}
                className={`${style.dot} ${i === dicaAtual ? style.dotAtivo : ""}`}
                onClick={() => {
                  setDicaVisivel(false);
                  setTimeout(() => {
                    setDicaAtual(i);
                    setDicaVisivel(true);
                  }, 300);
                }}
              />
            ))}
          </div>
        </div>

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
            onClick={() => enviarMensagem()}
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
