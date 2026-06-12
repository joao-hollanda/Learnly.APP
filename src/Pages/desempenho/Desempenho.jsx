import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import DesempenhoAPI from "../../services/DesempenhoService";
import style from "./_desempenho.module.css";
import {
  ComposedChart,
  Area,
  Line,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  LuClock3,
  LuListChecks,
  LuTarget,
  LuFlame,
  LuTrendingUp,
  LuTrendingDown,
  LuChartColumn,
  LuActivity,
  LuAward,
  LuCrosshair,
  LuCalendarClock,
  LuArrowRight,
} from "react-icons/lu";

const BRAND = "#2563eb";
const ACCENT = "#1d4ed8";
const SUCCESS = "#16a34a";
const WARNING = "#f59e0b";
const DANGER = "#dc2626";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 16px rgba(15, 31, 92, 0.12)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  padding: "0.5rem 0.75rem",
};

const eixoStyle = { fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-mono)" };

const Vazio = ({ texto }) => <div className={style.vazio}>{texto}</div>;

// Tilt 3D: perspectiva segue o mouse via CSS vars
const tilt = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
  el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
};

const tiltReset = (e) => {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
};

const useCountUp = (alvo, duracao = 900) => {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duracao);
      setValor(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alvo, duracao]);
  return valor;
};

const Contador = ({ valor }) => useCountUp(valor ?? 0);

const CIRCUNFERENCIA = 2 * Math.PI * 52;

function ScoreRing({ score, rotulo }) {
  const animado = useCountUp(score, 1100);
  return (
    <div className={style.scoreWrap}>
      <svg viewBox="0 0 120 120" className={style.scoreRing}>
        <defs>
          <linearGradient id="gradScore" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" className={style.scoreTrilha} />
        <circle
          cx="60"
          cy="60"
          r="52"
          className={style.scoreArco}
          strokeDasharray={`${(animado / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
        />
      </svg>
      <div className={style.scoreCentro}>
        <strong>{animado}</strong>
        <span>preparo</span>
      </div>
      <span className={style.scoreSelo}>{rotulo}</span>
    </div>
  );
}

function Desempenho() {
  const navigate = useNavigate();
  const { data, isPending } = useQuery({
    queryKey: ["dashboardDesempenho"],
    queryFn: () => DesempenhoAPI.ObterDashboard(),
    staleTime: 60_000,
    onError: () => toast.error("Erro ao carregar o desempenho"),
  });

  const dash = data ?? {};

  const horasPorDia = (dash.horasPorDia ?? []).map((h) => ({
    dia: h.dia,
    horas: h.horas,
  }));

  const disciplinas = dash.desempenhoPorDisciplina ?? [];
  const materias = dash.progressoPorMateria ?? [];
  const evolucao = (dash.evolucaoSimulados ?? []).map((e, i) => ({
    idx: i,
    rotulo: e.rotulo,
    nota: Number(e.nota),
  }));
  const progresso = dash.progressoPlano ?? {};
  const percentualPlano = progresso.percentual ?? 0;

  const diffHoras = (dash.horasEstudadasSemana ?? 0) - (dash.horasSemanaPassada ?? 0);

  const comDados = disciplinas.filter((d) => d.respondidas > 0);
  const porAcerto = [...comDados].sort(
    (a, b) => a.percentualAcerto - b.percentualAcerto,
  );
  const foco = porAcerto[0] ?? null;
  const forte = porAcerto.length > 1 ? porAcerto[porAcerto.length - 1] : null;

  const notas = evolucao.map((e) => e.nota);
  let tendencia = null;
  if (notas.length >= 2) {
    const n = Math.min(3, Math.floor(notas.length / 2));
    const rec = notas.slice(-n);
    const ant = notas.slice(-(n * 2), -n);
    const mRec = rec.reduce((a, b) => a + b, 0) / rec.length;
    const mAnt = ant.reduce((a, b) => a + b, 0) / ant.length;
    tendencia = { delta: mRec - mAnt, media: mRec, n };
  }
  const mediaNotas =
    notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

  const restantePlano =
    (progresso.horasTotais ?? 0) - (progresso.horasConcluidas ?? 0);
  const ritmoSemanal =
    dash.horasEstudadasSemana || dash.horasSemanaPassada || 0;
  let projecao = null;
  if (restantePlano > 0 && ritmoSemanal > 0) {
    const semanas = Math.ceil(restantePlano / ritmoSemanal);
    const dataFim = new Date(Date.now() + semanas * 7 * 86400000);
    projecao = {
      semanas,
      data: dataFim.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
    };
  }

  const metaSemana = dash.metaHorasSemana ?? 0;
  const pctMeta =
    metaSemana > 0
      ? Math.min(100, Math.round(((dash.horasEstudadasSemana ?? 0) / metaSemana) * 100))
      : 0;
  const diasAtivos = horasPorDia.filter((h) => h.horas > 0).length;
  const maxHorasDia = Math.max(1, ...horasPorDia.map((h) => h.horas));
  const melhorDia = horasPorDia.reduce(
    (m, h) => (h.horas > (m?.horas ?? 0) ? h : m),
    null,
  );

  const tendenciaSubindo = (tendencia?.delta ?? 0) >= 0.3;
  const tendenciaCaindo = (tendencia?.delta ?? 0) <= -0.3;

  const score = Math.round(
    (dash.taxaAcertoGeral ?? 0) * 0.45 +
      (diasAtivos / 7) * 100 * 0.2 +
      percentualPlano * 0.2 +
      (tendencia ? tendencia.media : mediaNotas) * 10 * 0.15,
  );
  const scoreRotulo =
    score >= 70 ? "Afiado" : score >= 40 ? "Em progresso" : "Começando";

  const mapaCalor = dash.mapaCalor ?? [];
  const maxCalor = Math.max(1, ...mapaCalor.map((d) => d.horas));
  const totalCalor = mapaCalor.reduce((a, d) => a + d.horas, 0);
  const semanasCalor = [];
  for (let i = 0; i < mapaCalor.length; i += 7)
    semanasCalor.push(mapaCalor.slice(i, i + 7));
  const nivelCalor = (h) =>
    h === 0 ? 0 : h <= maxCalor / 3 ? 1 : h <= (2 * maxCalor) / 3 ? 2 : 3;
  const fmtDataCurta = (d) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const maxRespondidas = Math.max(1, ...disciplinas.map((d) => d.respondidas));
  const corAcerto = (pct) =>
    pct >= 80 ? SUCCESS : pct >= 60 ? BRAND : WARNING;

  const evolucaoPlus = evolucao.map((e, i) => {
    const janela = evolucao.slice(Math.max(0, i - 2), i + 1);
    return {
      ...e,
      mediaMovel: janela.reduce((a, b) => a + b.nota, 0) / janela.length,
    };
  });

  const spark = notas.slice(-8);
  const sparkPath =
    spark.length >= 2
      ? spark
          .map(
            (n, i) =>
              `${(i / (spark.length - 1)) * 100},${34 - (n / 10) * 30}`,
          )
          .join(" ")
      : null;

  return (
    <div className="page">
      <Header />
      <div className={style.container}>
        <section className={style.masthead}>
          <div className={style.mastTopo}>
            <div className={style.heroTexto}>
              <span className={style.mastKicker}>Seu desempenho</span>
              <h2 className={style.titulo}>Relatório de estudo</h2>
              <p className={style.sub}>
                Acompanhe sua evolução, identifique pontos fortes e saiba onde
                focar os estudos.
              </p>
            </div>
            <div className={style.mastDireita}>
              <span className={style.heroIndice}>02 / Desempenho</span>
              {!isPending && <ScoreRing score={score} rotulo={scoreRotulo} />}
            </div>
          </div>

          {!isPending && (
            <div className={style.statStrip}>
              <div className={style.statCell}>
                <span className={style.statLabel}>
                  <LuClock3 /> Horas na semana
                </span>
                <span className={style.statValor}>
                  <Contador valor={dash.horasEstudadasSemana} />
                  <em>h</em>
                </span>
                {diffHoras === 0 ? (
                  <span className={style.statExtra}>
                    Mesmo ritmo da semana passada
                  </span>
                ) : (
                  <span
                    className={`${style.delta} ${diffHoras > 0 ? style.deltaUp : style.deltaDown}`}
                  >
                    <LuTrendingUp />
                    {diffHoras > 0 ? `+${diffHoras}h` : `${diffHoras}h`} vs.
                    semana passada
                  </span>
                )}
              </div>

              <div className={style.statCell}>
                <span className={style.statLabel}>
                  <LuListChecks /> Questões
                </span>
                <span className={style.statValor}>
                  <Contador valor={dash.totalQuestoesRespondidas} />
                </span>
                <span className={style.statExtra}>
                  {dash.totalSimulados ?? 0} simulados realizados
                </span>
              </div>

              <div className={style.statCell}>
                <span className={style.statLabel}>
                  <LuTarget /> Taxa de acerto
                </span>
                <span className={style.statValor}>
                  <Contador valor={dash.taxaAcertoGeral} />
                  <em>%</em>
                </span>
                <span className={style.statExtra}>Média geral de acertos</span>
              </div>

              <div className={style.statCell}>
                <span className={style.statLabel}>
                  <LuFlame /> Sequência
                </span>
                <span className={style.statValor}>
                  <Contador valor={dash.sequenciaDias} />
                  <em>dias</em>
                </span>
                <span className={style.statExtra}>
                  Seu recorde: {dash.melhorSequencia ?? 0} dias
                </span>
              </div>
            </div>
          )}
        </section>

        {isPending ? (
          <>
            <section className={style.kpiGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))}
            </section>
            <section className={`${style.chartsRow} ${style.cols21}`}>
              <SkeletonCard chart={260} />
              <SkeletonCard chart={260} />
            </section>
            <section className={`${style.chartsRow} ${style.cols11}`}>
              <SkeletonCard chart={260} />
              <SkeletonCard chart={260} />
            </section>
            <section className={`${style.chartsRow} ${style.cols1}`}>
              <SkeletonCard chart={320} />
            </section>
          </>
        ) : (
        <>
        <div className={style.secaoDivisor}>
          <span className={style.secaoNum}>01</span>
          <h3 className={style.secaoNome}>Leitura do mentor</h3>
          <span className={style.secaoLinha} />
        </div>

        <section className={style.insightGrid}>
          <article
            className={`${style.insight} ${style.insightWarning}`}
            onMouseMove={tilt}
            onMouseLeave={tiltReset}
          >
            <span className={style.insightKicker}>
              <LuCrosshair /> Onde focar
            </span>
            {foco ? (
              <>
                <strong className={style.insightTitulo}>
                  {foco.disciplina}
                </strong>
                <span className={style.insightNum}>
                  {foco.percentualAcerto}
                  <em>%</em>
                </span>
                <span className={style.insightBarra}>
                  <span style={{ width: `${foco.percentualAcerto}%` }} />
                </span>
                <p className={style.insightTexto}>
                  {foco.acertos} de {foco.respondidas} questões certas nessa
                  área.
                </p>
                <button
                  type="button"
                  className={style.insightCta}
                  onClick={() => navigate("/simulados")}
                >
                  Criar simulado dirigido <LuArrowRight />
                </button>
              </>
            ) : (
              <p className={style.insightVazio}>
                Responda simulados para descobrir onde focar.
              </p>
            )}
          </article>

          <article
            className={`${style.insight} ${style.insightSuccess}`}
            onMouseMove={tilt}
            onMouseLeave={tiltReset}
          >
            <span className={style.insightKicker}>
              <LuAward /> Ponto forte
            </span>
            {forte ? (
              <>
                <strong className={style.insightTitulo}>
                  {forte.disciplina}
                </strong>
                <span className={style.insightNum}>
                  {forte.percentualAcerto}
                  <em>%</em>
                </span>
                <span className={style.insightBarra}>
                  <span style={{ width: `${forte.percentualAcerto}%` }} />
                </span>
                <p className={style.insightTexto}>
                  {forte.acertos} de {forte.respondidas} certas. Revise de vez
                  em quando para manter o nível.
                </p>
              </>
            ) : (
              <p className={style.insightVazio}>
                Pratique mais de uma área para comparar seus pontos fortes.
              </p>
            )}
          </article>

          <article
            className={`${style.insight} ${style.insightBrand}`}
            onMouseMove={tilt}
            onMouseLeave={tiltReset}
          >
            <span className={style.insightKicker}>
              {tendenciaCaindo ? <LuTrendingDown /> : <LuTrendingUp />} Tendência
            </span>
            {tendencia ? (
              <>
                <strong className={style.insightTitulo}>
                  {tendenciaSubindo
                    ? "Notas em alta"
                    : tendenciaCaindo
                      ? "Notas em queda"
                      : "Notas estáveis"}
                </strong>
                <span className={style.insightNum}>
                  {tendencia.delta > 0 ? "+" : ""}
                  {tendencia.delta.toFixed(1)}
                  <em>pts</em>
                </span>
                {sparkPath && (
                  <svg viewBox="0 0 100 36" className={style.sparkline}>
                    <polyline points={sparkPath} />
                  </svg>
                )}
                <p className={style.insightTexto}>
                  Média dos últimos {tendencia.n === 1 ? "simulado" : `${tendencia.n} simulados`}:{" "}
                  {tendencia.media.toFixed(1)} — comparado aos anteriores.
                </p>
              </>
            ) : (
              <p className={style.insightVazio}>
                Faça ao menos 2 simulados para ver sua tendência.
              </p>
            )}
          </article>

          <article
            className={`${style.insight} ${style.insightNavy}`}
            onMouseMove={tilt}
            onMouseLeave={tiltReset}
          >
            <span className={style.insightKicker}>
              <LuCalendarClock /> Projeção
            </span>
            {projecao ? (
              <>
                <strong className={style.insightTitulo}>
                  Conclusão do plano
                </strong>
                <span className={style.insightNum}>
                  {projecao.semanas}
                  <em>{projecao.semanas === 1 ? "semana" : "semanas"}</em>
                </span>
                <span className={style.insightBarra}>
                  <span style={{ width: `${percentualPlano}%` }} />
                </span>
                <p className={style.insightTexto}>
                  No ritmo de {ritmoSemanal}h/semana, você termina por volta de{" "}
                  {projecao.data}. Faltam {restantePlano}h.
                </p>
                <button
                  type="button"
                  className={style.insightCta}
                  onClick={() => navigate("/planos")}
                >
                  Lançar horas de hoje <LuArrowRight />
                </button>
              </>
            ) : (
              <p className={style.insightVazio}>
                Lance horas no plano para estimar a data de conclusão.
              </p>
            )}
          </article>
        </section>

        <div className={style.secaoDivisor}>
          <span className={style.secaoNum}>02</span>
          <h3 className={style.secaoNome}>Ritmo de estudo</h3>
          <span className={style.secaoLinha} />
        </div>

        <section className={`${style.chartsRow} ${style.cols21}`}>
          <Card
            titulo="Constância de estudo"
            subtitulo={`Últimos 28 dias — ${totalCalor}h registradas`}
            icon={<LuActivity />}
          >
            {mapaCalor.length === 0 ? (
              <Vazio texto="Lance horas no seu plano para ver seu mapa de constância." />
            ) : (
              <div className={style.calor}>
                <div className={style.calorCabecalho}>
                  {mapaCalor.slice(0, 7).map((d, i) => (
                    <span key={i}>{d.dia}</span>
                  ))}
                </div>
                {semanasCalor.map((semana, w) => (
                  <div key={w} className={style.calorSemana}>
                    {semana.map((d, i) => {
                      const ehHoje =
                        w === semanasCalor.length - 1 && i === semana.length - 1;
                      return (
                        <span
                          key={d.data}
                          title={`${fmtDataCurta(d.data)} — ${d.horas}h`}
                          className={`${style.calorCelula} ${style[`calorN${nivelCalor(d.horas)}`]} ${ehHoje ? style.calorHoje : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
                <div className={style.calorLegenda}>
                  <span>menos</span>
                  <span className={`${style.calorCelula} ${style.calorN0}`} />
                  <span className={`${style.calorCelula} ${style.calorN1}`} />
                  <span className={`${style.calorCelula} ${style.calorN2}`} />
                  <span className={`${style.calorCelula} ${style.calorN3}`} />
                  <span>mais</span>
                </div>
              </div>
            )}
          </Card>

          <Card
            titulo="Meta da semana"
            subtitulo={
              metaSemana > 0 ? `${metaSemana}h planejadas` : "Sem meta definida"
            }
            icon={<LuTarget />}
          >
            {metaSemana > 0 ? (
              <>
                <div className={style.metaGauge}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[{ valor: pctMeta }]}
                      innerRadius="76%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={90 - (360 * pctMeta) / 100}
                    >
                      <RadialBar
                        background={{ fill: "#eef2f7" }}
                        dataKey="valor"
                        cornerRadius={20}
                        fill={pctMeta >= 100 ? SUCCESS : BRAND}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className={style.gaugeCentro}>
                    <strong>
                      {dash.horasEstudadasSemana ?? 0}
                      <em>/{metaSemana}h</em>
                    </strong>
                    <span>{pctMeta}% da meta</span>
                  </div>
                </div>

                <div className={style.diasStrip}>
                  {horasPorDia.map((h) => (
                    <div key={h.dia} className={style.diaCol}>
                      <span
                        className={`${style.diaBarra} ${h.horas > 0 ? style.diaBarraAtiva : ""}`}
                        style={{
                          height: `${Math.max(8, (h.horas / maxHorasDia) * 100)}%`,
                        }}
                        title={`${h.horas}h`}
                      />
                      <span className={style.diaRotulo}>{h.dia}</span>
                    </div>
                  ))}
                </div>
                <p className={style.diasResumo}>
                  {diasAtivos}/7 dias ativos
                  {melhorDia?.horas > 0 &&
                    ` · melhor dia: ${melhorDia.dia} (${melhorDia.horas}h)`}
                </p>
              </>
            ) : (
              <Vazio texto="Defina horas por semana no seu plano para acompanhar a meta." />
            )}
          </Card>
        </section>

        <div className={style.secaoDivisor}>
          <span className={style.secaoNum}>03</span>
          <h3 className={style.secaoNome}>Precisão por disciplina</h3>
          <span className={style.secaoLinha} />
        </div>

        <section className={`${style.chartsRow} ${style.cols1}`}>
          <Card
            titulo="Pontaria por disciplina"
            subtitulo="Barra grossa = taxa de acerto · traço vertical = meta de 70% · barra fina = volume de questões"
            icon={<LuChartColumn />}
          >
            {disciplinas.length === 0 ? (
              <Vazio texto="Responda simulados para ver sua pontaria por disciplina." />
            ) : (
              <div className={style.miraList}>
                {disciplinas.map((d) => {
                  const cor = corAcerto(d.percentualAcerto);
                  return (
                    <div key={d.disciplina} className={style.miraItem}>
                      <div className={style.miraTopo}>
                        <span className={style.miraNome}>{d.disciplina}</span>
                        <span className={style.miraInfo}>
                          <em style={{ color: cor }}>{d.percentualAcerto}%</em>
                          {d.acertos}/{d.respondidas} questões
                        </span>
                      </div>
                      <div className={style.miraTrilha}>
                        <span
                          className={style.miraFill}
                          style={{
                            width: `${d.percentualAcerto}%`,
                            background: cor,
                          }}
                        />
                        <span className={style.miraMeta} />
                      </div>
                      <div className={style.miraVolume}>
                        <span
                          style={{
                            width: `${(d.respondidas / maxRespondidas) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        <div className={style.secaoDivisor}>
          <span className={style.secaoNum}>04</span>
          <h3 className={style.secaoNome}>Evolução nos simulados</h3>
          <span className={style.secaoLinha} />
        </div>

        <section className={`${style.chartsRow} ${style.cols1}`}>
          <Card
            titulo="Evolução nos simulados"
            subtitulo="Área = nota de cada simulado · linha tracejada = média móvel (3) · vermelho = média geral"
            icon={<LuTrendingUp />}
          >
            <div className={style.chartBoxAlto}>
              {evolucao.length === 0 ? (
                <Vazio texto="Realize simulados para acompanhar sua evolução." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={evolucaoPlus}
                    margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradNota" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis
                      dataKey="idx"
                      type="number"
                      domain={[0, "dataMax"]}
                      ticks={evolucaoPlus.map((e) => e.idx)}
                      tickFormatter={(i) => evolucaoPlus[i]?.rotulo ?? ""}
                      tick={eixoStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={eixoStyle} axisLine={false} tickLine={false} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(i) => evolucaoPlus[i]?.rotulo ?? ""}
                      formatter={(v, nome) => [Number(v).toFixed(1), nome]}
                    />
                    <ReferenceLine
                      y={mediaNotas}
                      stroke={DANGER}
                      strokeDasharray="6 4"
                      label={{
                        value: `média ${mediaNotas.toFixed(1)}`,
                        position: "insideTopRight",
                        fontSize: 10,
                        fill: DANGER,
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                    <Area
                      type="monotone"
                      name="Nota"
                      dataKey="nota"
                      stroke={BRAND}
                      strokeWidth={3}
                      fill="url(#gradNota)"
                      dot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    >
                      <LabelList
                        dataKey="nota"
                        position="top"
                        offset={10}
                        style={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
                        formatter={(v) => v.toFixed(1)}
                      />
                    </Area>
                    <Line
                      type="monotone"
                      name="Média móvel"
                      dataKey="mediaMovel"
                      stroke={ACCENT}
                      strokeWidth={2}
                      strokeDasharray="7 4"
                      dot={false}
                      activeDot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

        <div className={style.secaoDivisor}>
          <span className={style.secaoNum}>05</span>
          <h3 className={style.secaoNome}>Plano em andamento</h3>
          <span className={style.secaoLinha} />
        </div>

        <section className={`${style.chartsRow} ${style.cols21}`}>
          <Card
            titulo="Progresso por matéria"
            subtitulo="Horas concluídas vs. planejadas"
            icon={<LuListChecks />}
          >
            {materias.length === 0 ? (
              <Vazio texto="Nenhum plano ativo com matérias." />
            ) : (
              <div className={style.metasList}>
                {materias.map((m) => {
                  const pct =
                    m.horasTotais > 0
                      ? Math.min(Math.round((m.horasConcluidas / m.horasTotais) * 100), 100)
                      : 0;
                  return (
                    <div key={m.materia} className={style.metaItem}>
                      <div className={style.metaTopo}>
                        <span className={style.metaNome}>{m.materia}</span>
                        <span className={style.metaValor}>
                          {m.horasConcluidas}h / {m.horasTotais}h
                        </span>
                      </div>
                      <div className={style.barraTrilha}>
                        <div
                          className={style.barraPreenchida}
                          style={{
                            width: `${pct}%`,
                            background: m.cor || "var(--grad-brand)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card titulo="Progresso do plano" subtitulo={progresso.titulo || "Plano ativo"} icon={<LuAward />}>
            <div className={style.gaugeWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={[{ valor: percentualPlano }]}
                  innerRadius="78%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={90 - (360 * percentualPlano) / 100}
                >
                  <RadialBar
                    background={{ fill: "#eef2f7" }}
                    dataKey="valor"
                    cornerRadius={20}
                    fill={BRAND}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className={style.gaugeCentro}>
                <strong>{percentualPlano}%</strong>
                <span>concluído</span>
              </div>
            </div>
          </Card>
        </section>
        </>
        )}
      </div>
    </div>
  );
}

export default Desempenho;
