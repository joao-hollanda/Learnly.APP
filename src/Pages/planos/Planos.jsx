import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useEffect, useState } from "react";
import { FaPlay, FaPlus } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import PlanoAPI from "../../services/PlanoService";
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

  const [mostrarPlano, setMostrarPlano] = useState(false);
  const [mostrarCriarPlano, setMostrarCriarPlano] = useState(false);
  const [mostrarConfigurar, setMostrarConfigurar] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [planoConfigId, setPlanoConfigId] = useState(null);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);
  const [materiaId, setMateriaId] = useState("");
  const [horasTotais, setHorasTotais] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [materiasDoPlano, setMateriasDoPlano] = useState([]);
  const [horasSemana, setHorasSemana] = useState();
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);
  const [horasLancadas, setHorasLancadas] = useState("");
  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);
  const [mostrarIa, setMostrarIa] = useState(false);
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
    queryClient.invalidateQueries({
      queryKey: ["planos"],
      refetchType: "active",
    });

  const invalidarInicio = () => {
    queryClient.invalidateQueries({
      queryKey: ["planoAtivo"],
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["resumo"],
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["totalSimulados"],
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["comparacaoHoras"],
      refetchType: "active",
    });
  };

  const planoAtivoIndex = planosList.findIndex((p) => p.ativo);
  const planoAtivo = planosList[planoAtivoIndex >= 0 ? planoAtivoIndex : 0];
  const planoVisualizado =
    viewingIndex !== null ? planosList[viewingIndex] : null;

  const abrirLancamentoHoras = (materia) => {
    setMateriaSelecionada(materia);
    setHorasLancadas("");
    setMostrarHoras(true);
  };

  const lancarHoras = async () => {
    if (!horasLancadas || horasLancadas <= 0)
      return toast.warn("Informe um valor válido");

    const comparacao = await PlanoAPI.CompararHoras();
    const horasHoje = comparacao.horasHoje;
    const totalComNovoLancamento = horasHoje + Number(horasLancadas);

    if (totalComNovoLancamento > LIMITE_DIARIO) {
      return toast.warn(
        `Limite diário de ${LIMITE_DIARIO}h atingido. Você já lançou ${horasHoje}h hoje.`,
      );
    }

    try {
      setLoading(true);
      await PlanoAPI.LancarHoras(
        materiaSelecionada.planoMateriaId,
        Number(horasLancadas),
      );

      toast.success("Horas lançadas");
      setMostrarHoras(false);

      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["comparacaoHoras"] });
      invalidarPlanos();
    } catch {
      toast.error("Erro ao lançar horas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mostrarConfigurar) return;
    PlanoAPI.ListarMaterias()
      .then(setMateriasDisponiveis)
      .catch(() => toast.error("Erro ao carregar matérias"));
  }, [mostrarConfigurar]);

  const abrirCriarPlano = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }
    setTitulo("");
    setObjetivo("");
    setMostrarCriarPlano(true);
  };

  const abrirPlanoIa = () => {
    if (planosList.length >= 5) {
      toast.warn("Você já atingiu o limite de 5 planos.");
      return;
    }
    setTitulo("");
    setObjetivo("");
    setMostrarIa(true);
  };

  const diferencaEmDias = (inicio, fim) => {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    return Math.ceil(
      (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const criarPlano = async (planoIA) => {
    if (!titulo || !objetivo || !dataInicio || !dataFim)
      return toast.warn("Preencha todos os campos!");

    if (dataFim < dataInicio)
      return toast.warn("Data final não pode ser anterior à data de início");

    const duracaoDias = diferencaEmDias(dataInicio, dataFim);
    if (duracaoDias < 14)
      return toast.warn("O plano deve ter duração mínima de 2 semanas.");
    if (duracaoDias > 365 * 5)
      return toast.warn("O plano não pode ter duração maior que 2 anos.");

    try {
      setLoading(true);

      const planoCriado = await PlanoAPI.Criar({
        titulo,
        objetivo,
        dataInicio: new Date(dataInicio + "T00:00:00").toISOString(),
        dataFim: new Date(dataFim + "T00:00:00").toISOString(),
        horasPorSemana: horasSemana,
        ativo: true,
        planoIa: planoIA,
      });

      await PlanoAPI.AtivarPlano(planoCriado.planoId);

      setPlanoConfigId(planoCriado.planoId);
      setMostrarCriarPlano(false);
      if (!planoIA) setMostrarConfigurar(true);
      else setMostrarConfigurar(false);

      invalidarPlanos();
      invalidarInicio();

      setMateriasDoPlano([]);
      toast.success("Plano criado e ativado!");
      setMostrarIa(false);
    } catch {
      toast.error("Erro ao criar plano");
    } finally {
      setLoading(false);
    }
  };

  const adicionarMateria = async () => {
    if (!materiaId || !horasTotais)
      return toast.warn("Preencha todos os campos");

    try {
      setLoading(true);
      await PlanoAPI.AdicionarMateria(planoConfigId, {
        materiaId,
        horasTotais,
      });

      const materia = materiasDisponiveis.find((m) => m.materiaId == materiaId);
      setMateriasDoPlano((prev) => [
        ...prev,
        { nome: materia.nome, horasTotais, horasConcluidas: 0 },
      ]);
      setMateriaId("");
      setHorasTotais("");
      toast.success("Matéria adicionada");
    } catch {
      toast.error("Erro ao adicionar matéria");
    } finally {
      setLoading(false);
    }
  };

  const handleClickPlano = (index) => {
    setViewingIndex(index);
    setMostrarPlano(true);
  };

  const handleAtivarPlano = async () => {
    try {
      const plano = planosList[viewingIndex];
      await PlanoAPI.AtivarPlano(plano.planoId);

      setMostrarPlano(false);
      invalidarPlanos();
      invalidarInicio();

      toast.success("Plano ativado");
    } catch {
      toast.error("Erro ao ativar plano");
    }
  };

  const handleExcluirPlano = async () => {
    try {
      setLoading(true);
      await PlanoAPI.Excluir(planoParaExcluir.planoId);
      toast.success("Plano excluído");

      setMostrarExcluir(false);
      setMostrarPlano(false);
      setViewingIndex(null);

      queryClient.setQueryData(["planos"], (planosAntigos) => {
        if (!planosAntigos) return [];
        return planosAntigos.filter(
          (p) => p.planoId !== planoParaExcluir.planoId,
        );
      });

      invalidarPlanos();
      invalidarInicio();
    } catch {
      toast.error("Erro ao excluir plano");
    } finally {
      setLoading(false);
    }
  };

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
            Nenhum plano ainda, que tal criar um? <ImHappy />
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
                    onClick={() =>
                      handleClickPlano(
                        planoAtivoIndex >= 0 ? planoAtivoIndex : 0,
                      )
                    }
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
                  .map((plano, idx) => (
                    <Plano
                      key={plano.planoId}
                      titulo={plano.titulo}
                      ativo={false}
                      materias={plano.materias}
                      botao={
                        <button
                          className={style.botao_exibir}
                          onClick={() => handleClickPlano(idx)}
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
        planoVisualizado={planoVisualizado}
        viewingIndex={viewingIndex}
        planoAtivoIndex={planoAtivoIndex}
        onAtivarPlano={handleAtivarPlano}
        onExcluir={(plano) => {
          setPlanoParaExcluir(plano);
          setMostrarExcluir(true);
        }}
        onLancarHoras={abrirLancamentoHoras}
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

      <ModalConfigurarPlano
        show={mostrarConfigurar}
        onHide={() => setMostrarConfigurar(false)}
        materiasDisponiveis={materiasDisponiveis}
        materiasDoPlano={materiasDoPlano}
        materiaId={materiaId}
        setMateriaId={setMateriaId}
        horasTotais={horasTotais}
        setHorasTotais={setHorasTotais}
        onAdicionarMateria={adicionarMateria}
        onConcluir={() => {
          setMostrarConfigurar(false);
          invalidarPlanos();
        }}
        loading={loading}
      />

      <ModalLancarHoras
        show={mostrarHoras}
        onHide={() => setMostrarHoras(false)}
        materiaSelecionada={materiaSelecionada}
        horasLancadas={horasLancadas}
        setHorasLancadas={setHorasLancadas}
        onLancar={lancarHoras}
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
