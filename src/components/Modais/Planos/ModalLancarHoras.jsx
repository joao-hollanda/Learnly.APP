import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsClock } from "react-icons/bs";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

function ModalLancarHoras({ show, onHide, loading, plano, onLancar, initialPlanoMateriaId }) {
  const [planoMateriaId, setPlanoMateriaId] = useState("");
  const [horas, setHoras] = useState("");

  const materias = plano?.materias ?? [];
  const materiaSelecionada = materias.find((m) => m.planoMateriaId === planoMateriaId);
  const maxHoras = materiaSelecionada
    ? materiaSelecionada.horasTotais - materiaSelecionada.horasConcluidas
    : 0;

  useEffect(() => {
    if (show) {
      setPlanoMateriaId(initialPlanoMateriaId ?? "");
      setHoras("");
    }
  }, [show]);

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Lançar horas"
      iconType="info"
      icon={<BsClock />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => onLancar({ planoMateriaId, horas: Number(horas) })}
            disabled={loading || !planoMateriaId || !horas}
          >
            {loading ? <span className={style.spinner} /> : <><BsClock /> Lançar</>}
          </Button>
        </>
      }
    >
      <div style={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Matéria</label>
          <select
            className="form-select"
            value={planoMateriaId}
            onChange={(e) => {
              setPlanoMateriaId(e.target.value);
              setHoras("");
            }}
          >
            <option value="">Selecione a matéria</option>
            {materias.map((m) => (
              <option
                key={m.planoMateriaId}
                value={m.planoMateriaId}
                disabled={m.horasConcluidas >= m.horasTotais}
              >
                {m.nome} ({m.horasConcluidas}h / {m.horasTotais}h)
              </option>
            ))}
          </select>
        </div>

        {materiaSelecionada && (
          <span className="modal-badge modal-badge-info" style={{ alignSelf: "flex-start" }}>
            Restam {maxHoras}h de {materiaSelecionada.horasTotais}h
          </span>
        )}

        <div>
          <label style={labelStyle}>Horas estudadas</label>
          <input
            type="number"
            className="form-control"
            placeholder={maxHoras > 0 ? `1 – ${maxHoras}h` : "Selecione uma matéria"}
            value={horas}
            disabled={!planoMateriaId}
            min={1}
            max={Math.min(maxHoras, 20)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setHoras("");
              const num = parseInt(v, 10);
              if (isNaN(num) || num < 1 || num > Math.min(maxHoras, 20)) return;
              setHoras(num);
            }}
          />
        </div>
      </div>
    </ModalBase>
  );
}

const labelStyle = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: 4,
  display: "block",
};

export default ModalLancarHoras;
