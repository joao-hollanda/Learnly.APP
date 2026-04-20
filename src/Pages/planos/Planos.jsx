import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useState } from "react";
import { FaPlay, FaPlus } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import PlanoAPI from "../../services/PlanoService";
import { getApiError } from "../../services/client";
import { ImHappy } from "react-icons/im";
import { BsRobot } from "react-icons/bs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ModalExcluirPlano from "../../components/Modais/Planos/ModalExcluirPlano";
import ModalLancarHoras from "../../components/Modais/Planos/ModalLancarHoras";
import ModalConfigurarPlano from "../../components/Modais/Planos/ModalConfigurarPlano";
import ModalCriarPlano from "../../components/Modais/Planos/ModalCriarPlano";
import ModalVisualizarPlano from "../../components/Modais/Planos/ModalVisualizarPlano";
import ModalCriarPlanoIA from "../../components/Modais/Planos/ModalCriarPlanoIA";

const mapPlanoBackend = (plano) => ({
  planoId: plano.planoId,
  titulo: plano.titulo,
  objetivo: plano.objetivo,
  dataInicio: plano.dataInicio,
  dataFim: plano.dataFim,
  horasPorSemana: plano.horasPorSemana,
  ativo: plano.ativo,
  materias: (plano.planoMaterias ?? []).map((pm) => ({
    planoMateriaId: pm.planoMateriaId,
    materiaId: pm.materiaId,
    nome: pm.materia.nome,
    cor: pm.materia.cor,
    horasTotais: pm.horasTotais,
    horasConcluidas: pm.horasConcluidas,
    topicos: pm.topicos ?? [],
  })),
});

function Planos() {
  const queryClient = useQueryClient();

  const hoje = new Date().toISOString().split("T")[0];

  // Modais
  const [mostrarPlano, setMostrarPlano] = useState(false);
  const [mostrarCriarPlano, setMostrarCriarPlano] = useState(false);
  const [mostrarConfigurar, setMostrarConfigurar] = useState(false);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [mostrarIa, setMostrarIa] = useState(false);

  // ID do plano sendo visualizado / configurado
  const [viewingPlanoId, setViewingPlanoId] = useState(null);
  const [configurandoPlanoId, setConfigurandoPlanoId] = useState(null);

  // Plano para excluir
  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);

  // Campos de criação de plano
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasSemana, setHorasSemana] = useState("");

  const [materialParaLancar, setMaterialParaLancar] = useState(null);
  const [loading, setLoading] = useState(false);

  const LIMITE_DIARIO = 20;

  const { data: planosList = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const resposta = await PlanoAPI.Listar5();
      return resposta.map(mapPlanoBackend);
    },
    staleTime: Infinity,
    onError: () => toast.error("Erro ao carregar planos"),
  });

  const invalidarPlanos = () =>
    queryClient.invalidateQueries({ queryKey: ["planos"], refetchType: "active" });

  const invalidarInicio = () => {
    queryClient.invalidateQueries({ queryKey: ["planoAtivo"], refetchType: "active" });
    queryClient.invalidateQueries({ queryKey: ["resumo"], refetchType: "active" });
    queryClient.invalidateQueries({ queryKey: ["totalSimulados"], refetchType: "active" });
    queryClient.invalidateQueries({ queryKey: ["comparacaoHoras"], refetchType: "active" });
  };

  // fix 2: sem fallback para planosList[0] — inativo não aparece como "Plano Atual"
  const planoAtivo = planosList.find((p) => p.ativo) ?? null;
  // fix 1: lookup por ID, não por índice
  const planoVisualizado = planosList.find((p) => p.planoId === viewingPlanoId) ?? null;
  const planoParaConfigurar = planosList.find((p) => p.planoId === configurandoPlanoId) ?? null;

  // ── Criação ──────────────────────────────────────────────────────────────

  const abrirCriarPlano = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }
    setTitulo("");
    setObjetivo("");
    setDataInicio("");
    setDataFim("");
    setHorasSemana("");
    setMostrarCriarPlano(true);
  };

  const abrirPlanoIa = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }
    setTitulo("");
    setObjetivo("");
    setDataInicio("");
    setDataFim("");
    setHorasSemana("");
    setMostrarIa(true);
  };

  const diferencaEmDias = (inicio, fim) => {
    const a = new Date(inicio);
    const b = new Date(fim);
    return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  };

  const criarPlano = async (planoIA) => {
    if (!titulo || !objetivo || !dataInicio || !dataFim)
      return toast.warn("Preencha todos os campos!");
    if (dataFim < dataInicio)
      return toast.warn("Data final não pode ser anterior à data de início");
    const duracao = diferencaEmDias(dataInicio, dataFim);
    if (duracao < 14) return toast.warn("O plano deve ter duração mínima de 2 semanas.");
    if (duracao > 365 * 5) return toast.warn("O plano não pode ter duração maior que 5 anos.");

    try {
      setLoading(true);
      const planoCriado = await PlanoAPI.Criar({
        titulo,
        objetivo,
        dataInicio: new Date(dataInicio + "T00:00:00").toISOString(),
        dataFim: new Date(dataFim + "T00:00:00").toISOString(),
        horasPorSemana: Number(horasSemana) || 0,
        ativo: true,
        planoIa: planoIA,
      });

      await PlanoAPI.AtivarPlano(planoCriado.planoId);

      // Insere otimisticamente no cache para o modal de configurar poder abrir já
      const novoPlano = mapPlanoBackend({ ...planoCriado, planoMaterias: [] });
      queryClient.setQueryData(["planos"], (old = []) => [...old, novoPlano]);

      setConfigurandoPlanoId(planoCriado.planoId);
      setMostrarCriarPlano(false);
      setMostrarIa(false);
      if (!planoIA) setMostrarConfigurar(true);

      invalidarPlanos();
      invalidarInicio();
      toast.success("Plano criado e ativado!");
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao criar plano"));
    } finally {
      setLoading(false);
    }
  };

  // ── Visualização ─────────────────────────────────────────────────────────

  const handleClickPlano = (planoId) => {
    setViewingPlanoId(planoId);
    setMostrarPlano(true);
  };

  // ── Configuração ──────────────────────────────────────────────────────────

  const abrirConfigurar = () => {
    setConfigurandoPlanoId(planoVisualizado.planoId);
    setMostrarPlano(false);
    setMostrarConfigurar(true);
  };

  const salvarPlano = async ({ titulo, objetivo, dataFim, horasPorSemana }) => {
    try {
      setLoading(true);
      await PlanoAPI.Atualizar({
        planoId: planoParaConfigurar.planoId,
        titulo,
        objetivo,
        dataFim: dataFim ? new Date(dataFim + "T00:00:00").toISOString() : null,
        horasPorSemana,
      });
      toast.success("Plano salvo!");
      setMostrarConfigurar(false);
      invalidarPlanos();
      invalidarInicio();
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao salvar plano"));
    } finally {
      setLoading(false);
    }
  };

  const handleAtivarPlanoFromConfigurar = async () => {
    try {
      await PlanoAPI.AtivarPlano(planoParaConfigurar.planoId);
      setMostrarConfigurar(false);
      invalidarPlanos();
      invalidarInicio();
      toast.success("Plano ativado");
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao ativar plano"));
    }
  };

  // ── Lançar horas ──────────────────────────────────────────────────────────

  const abrirLancamentoHoras = (pm) => {
    setMaterialParaLancar(pm ?? null);
    setMostrarHoras(true);
  };

  const lancarHoras = async ({ planoMateriaId, horas }) => {
    if (!horas || horas <= 0) return toast.warn("Informe um valor válido");

    try {
      setLoading(true);
      const comparacao = await PlanoAPI.CompararHoras();
      const horasHoje = comparacao.horasHoje;
      if (horasHoje + Number(horas) > LIMITE_DIARIO) {
        toast.warn(
          `Limite diário de ${LIMITE_DIARIO}h atingido. Você já lançou ${horasHoje}h hoje.`
        );
        return;
      }
      await PlanoAPI.LancarHoras(planoMateriaId, Number(horas));
      toast.success("Horas lançadas");
      setMostrarHoras(false);
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["comparacaoHoras"] });
      invalidarPlanos();
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao lançar horas"));
    } finally {
      setLoading(false);
    }
  };

  // ── Exclusão ──────────────────────────────────────────────────────────────

  const handleExcluirPlano = async () => {
    try {
      setLoading(true);
      await PlanoAPI.Excluir(planoParaExcluir.planoId);
      toast.success("Plano excluído");

      setMostrarExcluir(false);
      setMostrarPlano(false);
      // fix 1: reset por ID
      setViewingPlanoId(null);

      // fix 3: sem setQueryData otimista — evita race condition com o refetch imediato
      invalidarPlanos();
      invalidarInicio();
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao excluir plano"));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <Header
        children={
          <button className={style.botao} onClick={abrirCriarPlano}>
            <FaPlus />
          </button>
        }
      />

      <div className={style.fab_container}>
        <button className={style.fab} onClick={abrirPlanoIa}>
          <BsRobot className={style.icon} />
        </button>
      </div>

      {planosList.length === 0 ? (
        <div className={style.container}>
          <div className={style.vazio}>
            Nenhum plano ainda, que tal criar um?
          </div>
        </div>
      ) : (
        <>
          {planoAtivo && (
            <div className={style.container}>
              <h4 className={style.atividade}>Plano Atual</h4>
              <Plano
                titulo={planoAtivo.titulo}
                ativo
                materias={planoAtivo.materias}
                botao={
                  <button
                    className={style.botao_exibir}
                    onClick={() => handleClickPlano(planoAtivo.planoId)}
                  >
                    <FaPlay /> Visualizar Plano
                  </button>
                }
              />
            </div>
          )}

          {planosList.filter((p) => !p.ativo).length > 0 && (
            <>
              <h4 className={style.atividade}>Planos Inativos</h4>
              <div className={style.planos_container}>
                {planosList
                  .filter((p) => !p.ativo)
                  .map((plano) => (
                    <Plano
                      key={plano.planoId}
                      titulo={plano.titulo}
                      ativo={false}
                      materias={plano.materias}
                      botao={
                        <button
                          className={style.botao_exibir}
                          onClick={() => handleClickPlano(plano.planoId)}
                        >
                          <FaPlay /> Visualizar Plano
                        </button>
                      }
                    />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      <ModalVisualizarPlano
        show={mostrarPlano}
        onHide={() => setMostrarPlano(false)}
        plano={planoVisualizado}
        onConfigurar={abrirConfigurar}
        onLancarHoras={abrirLancamentoHoras}
      />

      <ModalConfigurarPlano
        show={mostrarConfigurar}
        onHide={() => setMostrarConfigurar(false)}
        loading={loading}
        plano={planoParaConfigurar}
        onSalvar={salvarPlano}
        onExcluir={() => {
          setMostrarConfigurar(false);
          setPlanoParaExcluir(planoParaConfigurar);
          setMostrarExcluir(true);
        }}
        onAtivarPlano={handleAtivarPlanoFromConfigurar}
        isAtivo={planoParaConfigurar?.ativo ?? false}
      />

      <ModalLancarHoras
        show={mostrarHoras}
        onHide={() => setMostrarHoras(false)}
        loading={loading}
        plano={planoVisualizado}
        onLancar={lancarHoras}
        initialPlanoMateriaId={materialParaLancar?.planoMateriaId ?? ""}
      />

      <ModalCriarPlano
        show={mostrarCriarPlano}
        onHide={() => setMostrarCriarPlano(false)}
        titulo={titulo}
        setTitulo={setTitulo}
        objetivo={objetivo}
        setObjetivo={setObjetivo}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        hoje={hoje}
        onCriar={() => criarPlano(false)}
        loading={loading}
      />

      <ModalCriarPlanoIA
        show={mostrarIa}
        onHide={() => setMostrarIa(false)}
        titulo={titulo}
        setTitulo={setTitulo}
        objetivo={objetivo}
        setObjetivo={setObjetivo}
        horasSemana={horasSemana}
        setHorasSemana={setHorasSemana}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        hoje={hoje}
        onCriar={() => criarPlano(true)}
        loading={loading}
      />

      <ModalExcluirPlano
        show={mostrarExcluir}
        onHide={() => setMostrarExcluir(false)}
        planoParaExcluir={planoParaExcluir}
        onExcluir={handleExcluirPlano}
        loading={loading}
      />
    </div>
  );
}

export default Planos;
