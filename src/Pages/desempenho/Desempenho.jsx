import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import DesempenhoAPI from "../../services/DesempenhoService";
import style from "./_desempenho.module.css";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  LuClock3,
  LuListChecks,
  LuTarget,
  LuFlame,
  LuTrendingUp,
  LuChartPie,
  LuChartColumn,
  LuActivity,
  LuAward,
} from "react-icons/lu";

const BRAND = "#2563eb";
const BRAND_LIGHT = "#60a5fa";
const ACCENT = "#6c5ce7";
const SUCCESS = "#16a34a";
const WARNING = "#f59e0b";
const CORES_PIZZA = [BRAND, BRAND_LIGHT, ACCENT, SUCCESS, WARNING, "#0ea5e9", "#ec4899"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 16px rgba(15, 23, 42, 0.1)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  padding: "0.5rem 0.75rem",
};

const eixoStyle = { fontSize: 12, fill: "#94a3b8", fontFamily: "var(--font-sans)" };

const Vazio = ({ texto }) => <div className={style.vazio}>{texto}</div>;

function Desempenho() {
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
  const distribuicao = materias.filter((m) => m.horasConcluidas > 0);
  const evolucao = (dash.evolucaoSimulados ?? []).map((e, i) => ({
    idx: i,
    rotulo: e.rotulo,
    nota: Number(e.nota),
  }));
  const progresso = dash.progressoPlano ?? {};
  const percentualPlano = progresso.percentual ?? 0;

  const diffHoras = (dash.horasEstudadasSemana ?? 0) - (dash.horasSemanaPassada ?? 0);

  return (
    <div className="page">
      <Header />
      <div className={style.container}>
        <header className={style.hero}>
          <span className="eyebrow">Seu desempenho</span>
          <h2 className={style.titulo}>Dashboard de métricas</h2>
          <p className={style.sub}>
            Acompanhe sua evolução, identifique pontos fortes e saiba onde focar
            os estudos.
          </p>
        </header>

        {isPending ? (
          <>
            <section className={style.kpiGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} lines={1} />
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
            <section className={`${style.chartsRow} ${style.cols21}`}>
              <SkeletonCard lines={4} />
              <SkeletonCard chart={260} />
            </section>
          </>
        ) : (
        <>
        <section className={style.kpiGrid}>
          <Card titulo="Horas estudadas (semana)" icon={<LuClock3 />}>
            <span>{dash.horasEstudadasSemana ?? 0}h</span>
            {diffHoras === 0 ? (
              <div className={style.deltaNeutro}>Mesmo ritmo da semana passada</div>
            ) : (
              <div
                className={`${style.delta} ${diffHoras > 0 ? style.deltaUp : style.deltaDown}`}
              >
                <LuTrendingUp />
                {diffHoras > 0 ? `+${diffHoras}h` : `${diffHoras}h`} vs. semana
                passada
              </div>
            )}
          </Card>

          <Card titulo="Questões respondidas" icon={<LuListChecks />}>
            <span>{dash.totalQuestoesRespondidas ?? 0}</span>
            <div className={style.deltaNeutro}>
              {dash.totalSimulados ?? 0} simulados realizados
            </div>
          </Card>

          <Card titulo="Taxa de acerto" icon={<LuTarget />}>
            <span>{dash.taxaAcertoGeral ?? 0}%</span>
            <div className={style.deltaNeutro}>Média geral de acertos</div>
          </Card>

          <Card titulo="Sequência de estudo" icon={<LuFlame />}>
            <span>{dash.sequenciaDias ?? 0} dias</span>
            <div className={style.deltaNeutro}>
              Seu recorde: {dash.melhorSequencia ?? 0} dias
            </div>
          </Card>
        </section>

        <section className={`${style.chartsRow} ${style.cols21}`}>
          <Card
            titulo="Horas de estudo"
            subtitulo="Últimos 7 dias"
            icon={<LuActivity />}
          >
            <div className={style.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={horasPorDia}
                  margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="dia" tick={eixoStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={eixoStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}h`, "Horas"]} />
                  <Area
                    type="monotone"
                    dataKey="horas"
                    stroke={BRAND}
                    strokeWidth={2.5}
                    fill="url(#gradHoras)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            titulo="Tempo por matéria"
            subtitulo="Horas concluídas no plano ativo"
            icon={<LuChartPie />}
          >
            <div className={style.chartBox}>
              {distribuicao.length === 0 ? (
                <Vazio texto="Lance horas no seu plano para ver a distribuição." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicao}
                      dataKey="horasConcluidas"
                      nameKey="materia"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {distribuicao.map((m, i) => (
                        <Cell key={i} fill={m.cor || CORES_PIZZA[i % CORES_PIZZA.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}h`, "Horas"]} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

        <section className={`${style.chartsRow} ${style.cols11}`}>
          <Card
            titulo="Acerto por disciplina"
            subtitulo="Percentual de questões certas"
            icon={<LuChartColumn />}
          >
            <div className={style.chartBox}>
              {disciplinas.length === 0 ? (
                <Vazio texto="Responda simulados para ver seu acerto por disciplina." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={disciplinas}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis
                      dataKey="disciplina"
                      tick={{ ...eixoStyle, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis tick={eixoStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                      contentStyle={tooltipStyle}
                      formatter={(v) => [`${v}%`, "Acerto"]}
                    />
                    <Bar dataKey="percentualAcerto" radius={[8, 8, 0, 0]} maxBarSize={42}>
                      {disciplinas.map((m, i) => (
                        <Cell
                          key={i}
                          fill={
                            m.percentualAcerto >= 80
                              ? SUCCESS
                              : m.percentualAcerto >= 60
                                ? BRAND
                                : WARNING
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card
            titulo="Cobertura por disciplina"
            subtitulo="Questões respondidas em cada área"
            icon={<LuTarget />}
          >
            <div className={style.chartBox}>
              {disciplinas.length === 0 ? (
                <Vazio texto="Sem dados de simulados ainda." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={disciplinas} outerRadius="72%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="disciplina" tick={{ ...eixoStyle, fontSize: 11 }} />
                    <Radar
                      dataKey="respondidas"
                      stroke={ACCENT}
                      strokeWidth={2}
                      fill={ACCENT}
                      fillOpacity={0.22}
                    />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Respondidas"]} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

        <section className={`${style.chartsRow} ${style.cols1}`}>
          <Card
            titulo="Evolução nos simulados"
            subtitulo="Nota final de cada simulado ao longo do tempo"
            icon={<LuTrendingUp />}
          >
            <div className={style.chartBoxAlto}>
              {evolucao.length === 0 ? (
                <Vazio texto="Realize simulados para acompanhar sua evolução." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evolucao}
                    margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis
                      dataKey="idx"
                      type="number"
                      domain={[0, "dataMax"]}
                      ticks={evolucao.map((e) => e.idx)}
                      tickFormatter={(i) => evolucao[i]?.rotulo ?? ""}
                      tick={eixoStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={eixoStyle} axisLine={false} tickLine={false} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(i) => evolucao[i]?.rotulo ?? ""}
                      formatter={(v) => [Number(v).toFixed(1), "Nota"]}
                    />
                    <Line
                      type="monotone"
                      name="Nota"
                      dataKey="nota"
                      stroke={BRAND}
                      strokeWidth={3}
                      dot={{ r: 4, fill: BRAND }}
                      activeDot={{ r: 6 }}
                    >
                      <LabelList
                        dataKey="nota"
                        position="top"
                        offset={10}
                        style={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
                        formatter={(v) => v.toFixed(1)}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

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
