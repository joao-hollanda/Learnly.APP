import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsGear, BsCheckLg, BsPlus, BsTrash } from "react-icons/bs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PlanoAPI from "../../../services/PlanoService";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

const labelStyle = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: 4,
  display: "block",
};

const tabBase = {
  flex: 1,
  padding: "7px 0",
  borderRadius: 6,
  border: "none",
  background: "none",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#94a3b8",
  cursor: "pointer",
  transition: "all 0.15s",
};

const tabAtivo = {
  ...tabBase,
  background: "#fff",
  color: "#1e293b",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

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
      setAba("editar");
    }
  }, [show]);

  const materias = plano?.materias ?? [];

  const matOptions = materiasDisponiveis.filter(
    (m) => !materias.some((pm) => pm.materiaId === m.materiaId)
  );
  const todasAdicionadas = materiasDisponiveis.length > 0 && matOptions.length === 0;

  const handleAdicionarMateria = async () => {
    if (!materiaId || !horasTotais) {
      toast.warn("Selecione a matéria e as horas");
      return;
    }
    try {
      setLoadingMateria(true);
      await PlanoAPI.AdicionarMateria(plano.planoId, {
        materiaId,
        horasTotais: Number(horasTotais),
      });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
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
            variant="secondary"
            onClick={handleAdicionarMateria}
            disabled={loadingMateria}
          >
            {loadingMateria ? (
              <span className={style.spinner_dark} />
            ) : (
              <><BsPlus /> Adicionar</>
            )}
          </Button>
        )
      }
    >
      {/* Abas */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#f1f5f9",
          borderRadius: 8,
          padding: 3,
          width: "100%",
          marginBottom: 12,
        }}
      >
        <button style={aba === "editar" ? tabAtivo : tabBase} onClick={() => setAba("editar")}>
          Editar
        </button>
        <button style={aba === "materias" ? tabAtivo : tabBase} onClick={() => setAba("materias")}>
          Matérias
        </button>
      </div>

      {aba === "editar" ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input
              className="form-control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do plano"
            />
          </div>
          <div>
            <label style={labelStyle}>Objetivo</label>
            <textarea
              className="form-control"
              rows={3}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Objetivo"
            />
          </div>
          <div>
            <label style={labelStyle}>Data final</label>
            <input
              type="date"
              className="form-control"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
          {todasAdicionadas ? (
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", textAlign: "center" }}>
              Todas as matérias já foram adicionadas.
            </p>
          ) : (
            <>
              <div>
                <label style={labelStyle}>Matéria</label>
                <select
                  className="form-select"
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                >
                  <option value="">Selecione a matéria</option>
                  {matOptions.map((m) => (
                    <option key={m.materiaId} value={m.materiaId}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Horas totais</label>
                <input
                  type="number"
                  className="form-control"
                  value={horasTotais}
                  placeholder="5 – 200h"
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {[10, 20, 40, 60, 80, 100].map((h) => (
                    <button
                      key={h}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: horasTotais === h ? "#2563eb" : "#e2e8f0",
                        background: horasTotais === h ? "#2563eb" : "#fff",
                        color: horasTotais === h ? "#fff" : "#475569",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => setHorasTotais(h)}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {materias.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Matérias do plano
              </span>
              {materias.map((m) => (
                <div
                  key={m.planoMateriaId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: m.cor || "#2563eb",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: "0.875rem", color: "#1e293b", fontWeight: 500 }}>
                    {m.nome}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {m.horasConcluidas}h / {m.horasTotais}h
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ModalBase>
  );
}

export default ModalConfigurarPlano;
