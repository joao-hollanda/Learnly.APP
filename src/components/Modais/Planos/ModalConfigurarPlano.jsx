import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsGear, BsCheckLg, BsPlus, BsTrash, BsSearch } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PlanoAPI from "../../../services/PlanoService";
import ModalBase from "../ModalBase";
import DatePicker from "../../DatePicker/DatePicker";
import style from "../_modal.module.css";

const PRESETS_HORAS = [10, 20, 40, 60, 80, 100];

function ModalConfigurarPlano({
  show,
  onHide,
  loading,
  plano,
  onSalvar,
  onExcluir,
  onAtivarPlano,
  isAtivo,
}) {
  const queryClient = useQueryClient();
  const [aba, setAba] = useState("editar");

  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState("");

  const [materiaId, setMateriaId] = useState("");
  const [horasTotais, setHorasTotais] = useState("");
  const [busca, setBusca] = useState("");
  const [loadingMateria, setLoadingMateria] = useState(false);

  const { data: materiasDisponiveis = [] } = useQuery({
    queryKey: ["materias"],
    queryFn: PlanoAPI.ListarMaterias,
    staleTime: Infinity,
    enabled: show,
  });

  useEffect(() => {
    if (show && plano) {
      setTitulo(plano.titulo ?? "");
      setObjetivo(plano.objetivo ?? "");
      setDataFim(plano.dataFim ? plano.dataFim.split("T")[0] : "");
      setHorasPorSemana(String(plano.horasPorSemana ?? ""));
      setMateriaId("");
      setHorasTotais("");
      setBusca("");
      setAba("editar");
    }
  }, [show]);

  const materias = plano?.materias ?? [];

  const matOptions = materiasDisponiveis.filter(
    (m) => !materias.some((pm) => pm.materiaId === m.materiaId)
  );
  const todasAdicionadas = materiasDisponiveis.length > 0 && matOptions.length === 0;

  const normalizar = (s) =>
    s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const matFiltradas = matOptions.filter((m) =>
    normalizar(m.nome).includes(normalizar(busca))
  );
  const materiaSel = matOptions.find((m) => m.materiaId === materiaId);

  const handleAdicionarMateria = async () => {
    try {
      setLoadingMateria(true);
      await PlanoAPI.AdicionarMateria(plano.planoId, {
        materiaId,
        horasTotais: Number(horasTotais),
      });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      queryClient.invalidateQueries({ queryKey: ["planoAtivo"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardDesempenho"] });
      setMateriaId("");
      setHorasTotais("");
      toast.success("Matéria adicionada!");
    } catch {
      toast.error("Erro ao adicionar matéria");
    } finally {
      setLoadingMateria(false);
    }
  };

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Configurar plano"
      subtitle={plano?.titulo}
      kicker="Planos"
      iconType="info"
      icon={<BsGear />}
      footer={
        aba === "editar" ? (
          <>
            <Button variant="danger" onClick={onExcluir}>
              <BsTrash /> Excluir
            </Button>
            {!isAtivo && onAtivarPlano && (
              <Button variant="secondary" onClick={onAtivarPlano}>
                <BsCheckLg /> Ativar
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() =>
                onSalvar({
                  titulo,
                  objetivo,
                  dataFim,
                  horasPorSemana: Number(horasPorSemana) || 0,
                })
              }
              disabled={loading}
            >
              {loading ? <span className={style.spinner} /> : <><BsCheckLg /> Salvar</>}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={handleAdicionarMateria}
            disabled={loadingMateria || !materiaId || !horasTotais}
          >
            {loadingMateria ? (
              <span className={style.spinner} />
            ) : (
              <><BsPlus /> Adicionar</>
            )}
          </Button>
        )
      }
    >
      <div className={style.abas}>
        <button
          type="button"
          className={`${style.aba} ${aba === "editar" ? style.abaAtiva : ""}`}
          onClick={() => setAba("editar")}
        >
          Editar
        </button>
        <button
          type="button"
          className={`${style.aba} ${aba === "materias" ? style.abaAtiva : ""}`}
          onClick={() => setAba("materias")}
        >
          Matérias
        </button>
      </div>

      {aba === "editar" ? (
        <>
          <div className={style.campo}>
            <span className={style.label}>Título</span>
            <input
              className="form-control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do plano"
            />
          </div>
          <div className={style.campo}>
            <span className={style.label}>Objetivo</span>
            <textarea
              className="form-control"
              rows={3}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Objetivo"
            />
          </div>
          <div className={style.campo}>
            <span className={style.label}>Data final</span>
            <DatePicker value={dataFim} onChange={setDataFim} />
          </div>
        </>
      ) : (
        <>
          {todasAdicionadas ? (
            <p className={style.listaVazia}>
              Todas as matérias já foram adicionadas.
            </p>
          ) : (
            <>
              <div className={style.campo}>
                <div className={style.labelLinha}>
                  <span className={style.label}>Matéria</span>
                  <span className={style.contador}>
                    {matFiltradas.length} disponíve{matFiltradas.length === 1 ? "l" : "is"}
                  </span>
                </div>
                <div className={style.buscaWrap}>
                  <BsSearch className={style.buscaIcone} />
                  <input
                    className={`form-control ${style.buscaInput}`}
                    placeholder="Buscar matéria..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className={style.pickerGrid}>
                  {matFiltradas.length === 0 ? (
                    <p className={style.pickerVazio}>
                      Nenhuma matéria encontrada para "{busca}".
                    </p>
                  ) : (
                    matFiltradas.map((m) => {
                      const ativa = m.materiaId === materiaId;
                      return (
                        <button
                          key={m.materiaId}
                          type="button"
                          className={`${style.pickerTile} ${ativa ? style.pickerTileAtivo : ""}`}
                          onClick={() => setMateriaId(ativa ? "" : m.materiaId)}
                        >
                          <span
                            className={style.pickerDot}
                            style={{ backgroundColor: m.cor || "var(--brand)" }}
                          />
                          <span className={style.pickerNome}>{m.nome}</span>
                          <span className={style.pickerCheck}>
                            <FaCheck />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <div className={style.campo}>
                <span className={style.label}>Horas totais</span>
                <div className={style.chips}>
                  {PRESETS_HORAS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`${style.chip} ${horasTotais === h ? style.chipAtivo : ""}`}
                      onClick={() => setHorasTotais(h)}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="form-control"
                  value={horasTotais}
                  placeholder="Ou digite um valor (5 – 200h)"
                  min={5}
                  max={200}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") return setHorasTotais("");
                    const num = parseInt(v, 10);
                    if (isNaN(num) || num < 5 || num > 200) return;
                    setHorasTotais(num);
                  }}
                />
              </div>

              {materiaSel && (
                <div className={style.resumoSelecao}>
                  <span
                    className={style.pickerDot}
                    style={{ backgroundColor: materiaSel.cor || "var(--brand)" }}
                  />
                  {materiaSel.nome}
                  {horasTotais ? (
                    <span className={style.resumoHoras}>{horasTotais}h totais</span>
                  ) : (
                    <span className={style.resumoPendente}>defina as horas</span>
                  )}
                </div>
              )}
            </>
          )}

          {materias.length > 0 && (
            <div className={style.campo}>
              <span className={style.label}>Matérias do plano</span>
              <div className={style.listaMaterias}>
                {materias.map((m) => (
                  <div key={m.planoMateriaId} className={style.materiaLinha}>
                    <span
                      className={style.materiaDotLinha}
                      style={{ backgroundColor: m.cor || "var(--brand)" }}
                    />
                    <span className={style.materiaNomeLinha}>{m.nome}</span>
                    <span className={style.materiaBarra}>
                      <span
                        className={style.materiaBarraFill}
                        style={{
                          width: `${Math.min(100, (m.horasConcluidas / m.horasTotais) * 100 || 0)}%`,
                          backgroundColor: m.cor || "var(--brand)",
                        }}
                      />
                    </span>
                    <span className={style.materiaHorasLinha}>
                      {m.horasConcluidas}h / {m.horasTotais}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ModalBase>
  );
}

export default ModalConfigurarPlano;
