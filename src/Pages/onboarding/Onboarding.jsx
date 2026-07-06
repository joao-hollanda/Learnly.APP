import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  LuTarget,
  LuClock3,
  LuSparkles,
  LuArrowRight,
  LuArrowLeft,
  LuCheck,
} from "react-icons/lu";
import estilo from "./_onboarding.module.css";
import logo from "../../img/LearnlyLogoBranca.svg";
import IAAPI from "../../services/IAService";
import { getApiError } from "../../services/client";
import { registrarEvento } from "../../utils/analytics";

const OBJETIVOS = [
  "Passar no ENEM",
  "Medicina",
  "Engenharia",
  "Direito",
];
const PRESETS_HORAS = [5, 10, 15, 20, 30];

const isoDate = (d) => d.toISOString().slice(0, 10);

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [passo, setPasso] = useState(1);
  const [objetivo, setObjetivo] = useState("");
  const [horas, setHoras] = useState("");
  const [dataProva, setDataProva] = useState(
    isoDate(new Date(Date.now() + 90 * 86400000)),
  );
  const [carregando, setCarregando] = useState(false);

  const hoje = isoDate(new Date());

  const podeAvancar =
    passo === 1
      ? objetivo.trim().length > 0
      : passo === 2
        ? Number(horas) > 0 && dataProva > hoje
        : true;

  const avancar = () => {
    if (!podeAvancar) return;
    setPasso((p) => Math.min(3, p + 1));
  };

  const voltar = () => setPasso((p) => Math.max(1, p - 1));

  const criarPlano = async () => {
    try {
      setCarregando(true);
      await IAAPI.CriarPlano({
        titulo: "Meu plano de estudos",
        objetivo: objetivo.trim(),
        horasPorSemana: Number(horas),
        dataInicio: new Date().toISOString(),
        dataFim: new Date(dataProva + "T00:00:00").toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ["planos"] });
      queryClient.invalidateQueries({ queryKey: ["planosOnboarding"] });
      queryClient.invalidateQueries({ queryKey: ["planoAtivo"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardDesempenho"] });

      sessionStorage.setItem("onboardingPulado", "1");
      registrarEvento("onboarding_concluido", {
        horasPorSemana: Number(horas),
      });
      toast.success("Seu plano está pronto! Bons estudos.");
      navigate("/home", { replace: true });
    } catch (erro) {
      toast.error(getApiError(erro, "Não foi possível criar seu plano."));
      setCarregando(false);
    }
  };

  return (
    <div className={estilo.tela}>
      <div className={estilo.cabecalho}>
        <img src={logo} alt="Learnly" className={estilo.logo} />
        <button
          type="button"
          className={estilo.pular}
          onClick={() => {
            sessionStorage.setItem("onboardingPulado", "1");
            navigate("/home", { replace: true });
          }}
        >
          Pular por enquanto
        </button>
      </div>

      <div className={estilo.card}>
        <div className={estilo.progresso}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`${estilo.passoDot} ${n <= passo ? estilo.passoDotAtivo : ""}`}
            />
          ))}
        </div>

        {passo === 1 && (
          <div className={estilo.conteudo}>
            <span className={estilo.icone}>
              <LuTarget />
            </span>
            <span className={estilo.kicker}>Passo 1 de 3</span>
            <h1 className={estilo.titulo}>Qual é o seu objetivo?</h1>
            <p className={estilo.subtitulo}>
              Conte pra gente o que você quer alcançar. A IA monta um plano de
              estudos sob medida.
            </p>
            <div className={estilo.chips}>
              {OBJETIVOS.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`${estilo.chip} ${objetivo === o ? estilo.chipAtivo : ""}`}
                  onClick={() => setObjetivo(o)}
                >
                  {o}
                </button>
              ))}
            </div>
            <textarea
              className={estilo.textarea}
              placeholder="Ex.: Quero passar em Medicina na federal, foco em biologia e química."
              value={objetivo}
              maxLength={500}
              rows={4}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>
        )}

        {passo === 2 && (
          <div className={estilo.conteudo}>
            <span className={estilo.icone}>
              <LuClock3 />
            </span>
            <span className={estilo.kicker}>Passo 2 de 3</span>
            <h1 className={estilo.titulo}>Quanto tempo por semana?</h1>
            <p className={estilo.subtitulo}>
              Escolha um ritmo realista — você pode ajustar depois.
            </p>
            <div className={estilo.chips}>
              {PRESETS_HORAS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`${estilo.chip} ${Number(horas) === h ? estilo.chipAtivo : ""}`}
                  onClick={() => setHoras(h)}
                >
                  {h}h
                </button>
              ))}
            </div>
            <input
              type="number"
              className={estilo.input}
              min={1}
              max={168}
              placeholder="Ou digite as horas por semana"
              value={horas}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return setHoras("");
                if (+v < 1 || +v > 168) return;
                setHoras(+v);
              }}
            />
            <label className={estilo.rotuloData}>Quando é sua prova?</label>
            <input
              type="date"
              className={estilo.input}
              min={hoje}
              value={dataProva}
              onChange={(e) => setDataProva(e.target.value)}
            />
          </div>
        )}

        {passo === 3 && (
          <div className={estilo.conteudo}>
            <span className={estilo.icone}>
              <LuSparkles />
            </span>
            <span className={estilo.kicker}>Passo 3 de 3</span>
            <h1 className={estilo.titulo}>Tudo pronto!</h1>
            <p className={estilo.subtitulo}>
              Revise e deixe a IA montar seu plano de estudos.
            </p>
            <ul className={estilo.resumo}>
              <li>
                <span>Objetivo</span>
                <strong>{objetivo.trim()}</strong>
              </li>
              <li>
                <span>Ritmo</span>
                <strong>{horas}h por semana</strong>
              </li>
              <li>
                <span>Prova em</span>
                <strong>
                  {new Date(dataProva + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                    { day: "2-digit", month: "long", year: "numeric" },
                  )}
                </strong>
              </li>
            </ul>
          </div>
        )}

        <div className={estilo.acoes}>
          {passo > 1 && (
            <button
              type="button"
              className={estilo.botaoVoltar}
              onClick={voltar}
              disabled={carregando}
            >
              <LuArrowLeft /> Voltar
            </button>
          )}
          {passo < 3 ? (
            <button
              type="button"
              className={estilo.botaoAvancar}
              onClick={avancar}
              disabled={!podeAvancar}
            >
              Continuar <LuArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className={estilo.botaoAvancar}
              onClick={criarPlano}
              disabled={carregando}
            >
              {carregando ? (
                <span className={estilo.spinner} />
              ) : (
                <>
                  <LuCheck /> Criar meu plano
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
