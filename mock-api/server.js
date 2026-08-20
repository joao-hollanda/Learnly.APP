const http = require("http");

const PORTA = process.env.PORT ? Number(process.env.PORT) : 5099;
const PORTA_APP = process.env.APP_PORT ?? "3001";

const USUARIO = {
  id: 1,
  usuarioId: 1,
  nome: "Ana Mockada",
  email: "ana@learnly.dev",
  foto: null,
  emailConfirmado: true,
  dataCriacao: "2026-01-15",
};

const MATERIAS = [
  { materiaId: 1, nome: "Matemática", cor: "#2563eb" },
  { materiaId: 2, nome: "Português", cor: "#16a34a" },
  { materiaId: 3, nome: "Biologia", cor: "#f59e0b" },
  { materiaId: 4, nome: "História", cor: "#8b5cf6" },
  { materiaId: 5, nome: "Química", cor: "#ef4444" },
  { materiaId: 6, nome: "Física", cor: "#0ea5e9" },
];

const TOPICOS = {
  Matemática: ["Funções", "Geometria plana", "Probabilidade", "Análise combinatória"],
  Português: ["Interpretação de texto", "Figuras de linguagem", "Sintaxe", "Variação linguística"],
  Biologia: ["Citologia", "Genética", "Ecologia", "Evolução"],
  História: ["Brasil República", "Era Vargas", "Guerra Fria", "Revolução Industrial"],
  Química: ["Estequiometria", "Química orgânica", "Termoquímica", "Soluções"],
  Física: ["Cinemática", "Leis de Newton", "Eletrodinâmica", "Ondulatória"],
};

const DISCIPLINAS = {
  linguagens: "Português",
  matematica: "Matemática",
  "ciencias-natureza": "Biologia",
  "ciencias-humanas": "História",
};

const estadoInicial = () => ({ planos: [], simulados: [], eventos: [], seq: 1 });
let estado = estadoInicial();

const proximoId = () => estado.seq++;
const iso = (d) => d.toISOString();
const emDias = (n) => new Date(Date.now() + n * 86400000);

const montarPlano = ({ titulo, objetivo, horasPorSemana, dataInicio, dataFim }) => {
  const escolhidas = MATERIAS.slice(0, 5);
  const horasPorMateria = Math.max(4, Math.round((Number(horasPorSemana) || 12) * 1.5));

  return {
    planoId: proximoId(),
    titulo: titulo?.trim() || "Meu plano de estudos",
    objetivo: objetivo?.trim() || "Passar no ENEM",
    dataInicio: dataInicio || iso(new Date()),
    dataFim: dataFim || iso(emDias(120)),
    horasPorSemana: Number(horasPorSemana) || 12,
    ativo: true,
    grupoId: null,
    planoMaterias: escolhidas.map((m, i) => ({
      planoMateriaId: proximoId(),
      materiaId: m.materiaId,
      materia: { nome: m.nome, cor: m.cor },
      horasTotais: horasPorMateria,
      horasConcluidas: i === 0 ? Math.round(horasPorMateria / 3) : 0,
      topicos: TOPICOS[m.nome] ?? [],
    })),
  };
};

const montarQuestao = (disciplina, indice) => {
  const id = proximoId();
  const letras = ["A", "B", "C", "D", "E"];
  const correta = indice % 5;

  return {
    questaoId: id,
    titulo: `Questão ${indice + 1} — ${DISCIPLINAS[disciplina] ?? disciplina}`,
    contexto:
      "Este é um enunciado de teste gerado pelo mock server. Nenhuma questão real do ENEM foi usada aqui.",
    introducaoAlternativa: "Assinale a alternativa correta:",
    disciplina,
    alternativas: letras.map((letra, i) => ({
      alternativaId: proximoId(),
      letra,
      texto: `Alternativa ${letra} da questão ${indice + 1}`,
      correta: i === correta,
      arquivo: null,
    })),
  };
};

const montarSimulado = ({ disciplinas, quantidadeQuestoes }) => {
  const areas = disciplinas?.length ? disciplinas : ["matematica"];
  const total = Math.min(Math.max(Number(quantidadeQuestoes) || 5, 1), 25);
  const questoes = Array.from({ length: total }, (_, i) =>
    montarQuestao(areas[i % areas.length], i),
  );

  return {
    simuladoId: proximoId(),
    data: iso(new Date()),
    quantidadeQuestoes: total,
    notaFinal: 0,
    questoes,
    respostas: [],
  };
};

const resumoPlanos = () => {
  const materias = estado.planos.flatMap((p) => p.planoMaterias);
  return {
    horasTotais: materias.reduce((a, m) => a + m.horasTotais, 0),
    horasConcluidas: materias.reduce((a, m) => a + m.horasConcluidas, 0),
  };
};

const rotas = [
  ["GET", /^login\/authcheck$/, () => ({})],
  ["GET", /^login\/user$/, () => USUARIO],
  ["POST", /^login\/refresh$/, () => ({})],
  ["POST", /^login\/logout$/, () => ({})],

  ["GET", /^plano$/, () => estado.planos],
  ["GET", /^plano\/plano-ativo$/, () => estado.planos.find((p) => p.ativo) ?? null],
  ["GET", /^plano\/gerar-resumo$/, () => resumoPlanos()],
  ["GET", /^plano\/horas\/comparacao$/, () => ({ horasHoje: 2, diferenca: 1 })],
  ["GET", /^plano\/(\d+)$/, (_, m) => estado.planos.find((p) => p.planoId === +m[1]) ?? null],
  ["POST", /^plano$/, (corpo) => {
    const plano = montarPlano(corpo);
    estado.planos.forEach((p) => (p.ativo = false));
    estado.planos.push(plano);
    return plano;
  }],
  ["POST", /^ia\/criar-plano$/, (corpo) => {
    const plano = montarPlano(corpo);
    estado.planos.forEach((p) => (p.ativo = false));
    estado.planos.push(plano);
    return plano;
  }],
  ["PUT", /^plano\/(\d+)\/ativar$/, (_, m) => {
    estado.planos.forEach((p) => (p.ativo = p.planoId === +m[1]));
    return {};
  }],
  ["DELETE", /^plano\/(\d+)$/, (_, m) => {
    estado.planos = estado.planos.filter((p) => p.planoId !== +m[1]);
    return {};
  }],
  ["GET", /^materia$/, () => MATERIAS],

  ["GET", /^simulado\/listar$/, () =>
    estado.simulados.map(({ questoes, respostas, ...resto }) => resto)],
  ["GET", /^simulado\/contar$/, () => estado.simulados.length],
  ["POST", /^simulado$/, (corpo) => {
    const simulado = montarSimulado(corpo);
    estado.simulados.push(simulado);
    return simulado;
  }],
  ["GET", /^simulado\/(\d+)$/, (_, m) =>
    estado.simulados.find((s) => s.simuladoId === +m[1]) ?? null],
  ["PUT", /^simulado\/responder\/(\d+)$/, (corpo, m) => {
    const simulado = estado.simulados.find((s) => s.simuladoId === +m[1]);
    if (!simulado) return null;

    const escolhas = Array.isArray(corpo) ? corpo : (corpo?.respostas ?? []);
    let acertos = 0;
    for (const q of simulado.questoes) {
      const escolha = escolhas.find((r) => r.questaoId === q.questaoId);
      const alt = q.alternativas.find((a) => a.alternativaId === escolha?.alternativaId);
      if (alt?.correta) acertos++;
    }

    simulado.notaFinal = Number(((acertos / simulado.questoes.length) * 10).toFixed(1));
    simulado.respostas = escolhas;

    return {
      simuladoId: simulado.simuladoId,
      notaFinal: simulado.notaFinal,
      acertos,
      totalQuestoes: simulado.questoes.length,
      questoes: simulado.questoes,
      respostas: escolhas,
      materiaisRecomendados: [],
    };
  }],

  ["GET", /^eventos$/, () => estado.eventos],
  ["POST", /^eventos\/lote$/, (corpo) => {
    for (const e of corpo?.eventos ?? [])
      estado.eventos.push({ eventoId: proximoId(), ...e });
    return {};
  }],
  ["POST", /^eventos$/, (corpo) => {
    const evento = { eventoId: proximoId(), ...corpo };
    estado.eventos.push(evento);
    return evento;
  }],
  ["DELETE", /^eventos$/, () => {
    estado.eventos = [];
    return {};
  }],

  ["GET", /^_mock\/reset$/, () => {
    estado = estadoInicial();
    return { reiniciado: true };
  }],
  ["GET", /^_mock\/seed$/, () => {
    estado = estadoInicial();
    estado.planos.push(
      montarPlano({ titulo: "Rumo ao ENEM 2026", objetivo: "Medicina na UFPE", horasPorSemana: 20 }),
    );
    estado.simulados.push(montarSimulado({ disciplinas: ["matematica"], quantidadeQuestoes: 5 }));
    estado.simulados[0].notaFinal = 7.5;
    return { planos: estado.planos.length, simulados: estado.simulados.length };
  }],
];

const lerCorpo = (req) =>
  new Promise((resolve) => {
    let bruto = "";
    req.on("data", (c) => (bruto += c));
    req.on("end", () => {
      try {
        resolve(bruto ? JSON.parse(bruto) : null);
      } catch {
        resolve(null);
      }
    });
  });

const servidor = http.createServer(async (req, res) => {
  const origem = req.headers.origin ?? "http://localhost:3000";

  res.setHeader("Access-Control-Allow-Origin", origem);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname)
    .replace(/^\/api\/?/, "")
    .replace(/\/$/, "")
    .toLowerCase();

  const corpo = ["POST", "PUT", "PATCH"].includes(req.method)
    ? await lerCorpo(req)
    : null;

  for (const [metodo, padrao, handler] of rotas) {
    const m = caminho.match(padrao);
    if (metodo === req.method && m) {
      const dados = handler(corpo, m);
      console.log(`${req.method} /api/${caminho} → 200`);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true, data: dados, errors: [] }));
    }
  }

  console.log(`${req.method} /api/${caminho} → sem mock, devolvendo []`);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, data: [], errors: [] }));
});

servidor.listen(PORTA, () => {
  console.log(`\n  Mock da Learnly.API em http://localhost:${PORTA}/api/`);
  console.log(`  Logado como: ${USUARIO.nome} <${USUARIO.email}>`);
  console.log(`  Conta começa vazia — é o cenário dos tutoriais.\n`);
  console.log(`  Abra:  http://localhost:${PORTA_APP}/home`);
  console.log(`  Zerar: http://localhost:${PORTA}/api/_mock/reset`);
  console.log(`  Popular com plano + simulado: http://localhost:${PORTA}/api/_mock/seed\n`);
});
