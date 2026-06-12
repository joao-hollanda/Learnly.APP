import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsClock } from "react-icons/bs";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

const PRESETS = [1, 2, 3, 4, 6];

function ModalLancarHoras({ show, onHide, loading, plano, onLancar, initialPlanoMateriaId }) {
  const [planoMateriaId, setPlanoMateriaId] = useState("");
  const [horas, setHoras] = useState("");

  const materias = plano?.materias ?? [];
  const materiaSelecionada = materias.find((m) => m.planoMateriaId === planoMateriaId);
  const maxHoras = materiaSelecionada
    ? materiaSelecionada.horasTotais - materiaSelecionada.horasConcluidas
    : 0;
  const limite = Math.min(maxHoras, 20);

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
      subtitle={materiaSelecionada?.nome}
      kicker="Planos"
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
      {materiaSelecionada && (
        <span
          className="modal-badge modal-badge-info"
          style={{ marginBottom: "0.9rem" }}
        >
          Restam {maxHoras}h de {materiaSelecionada.horasTotais}h
        </span>
      )}

      <div className={style.campo}>
        <span className={style.label}>Horas estudadas</span>
        <div className={style.chips}>
          {PRESETS.filter((h) => h <= limite).map((h) => (
            <button
              key={h}
              type="button"
              className={`${style.chip} ${horas === h ? style.chipAtivo : ""}`}
              onClick={() => setHoras(h)}
              disabled={!planoMateriaId}
            >
              {h}h
            </button>
          ))}
        </div>
        <input
          type="number"
          className="form-control"
          placeholder={limite > 0 ? `Ou digite um valor (1 – ${limite}h)` : "Selecione uma matéria"}
          value={horas}
          disabled={!planoMateriaId}
          min={1}
          max={limite}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setHoras("");
            const num = parseInt(v, 10);
            if (isNaN(num) || num < 1 || num > limite) return;
            setHoras(num);
          }}
        />
        <span className={style.hint}>Limite diário de 20h por dia.</span>
      </div>
    </ModalBase>
  );
}

export default ModalLancarHoras;
