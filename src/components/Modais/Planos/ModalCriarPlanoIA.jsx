import { Button } from "react-bootstrap";
import { BsStars } from "react-icons/bs";
import ModalBase from "../ModalBase";
import DatePicker from "../../DatePicker/DatePicker";
import style from "../_modal.module.css";

const PRESETS_HORAS = [10, 15, 20, 30, 40];

function ModalCriarPlanoIA({
  show,
  onHide,
  titulo,
  setTitulo,
  objetivo,
  setObjetivo,
  horasSemana,
  setHorasSemana,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  hoje,
  onCriar,
  loading,
}) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Criar plano com IA"
      subtitle="A IA monta as matérias, tópicos e horas para você"
      kicker="Planos · IA"
      iconType="warning"
      icon={<BsStars />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onCriar} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><BsStars /> Gerar plano</>}
          </Button>
        </>
      }
    >
      <div className={style.campo}>
        <span className={style.label}>Título</span>
        <input
          className="form-control"
          placeholder="Ex: Rumo ao ENEM 2026"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className={style.campo}>
        <span className={style.label}>Objetivo</span>
        <input
          className="form-control"
          placeholder="Quanto mais detalhes, melhor o plano gerado"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
        />
        <span className={style.hint}>
          Ex: "Medicina na UFPE — tenho dificuldade em exatas".
        </span>
      </div>

      <div className={style.campo}>
        <span className={style.label}>Carga horária semanal</span>
        <div className={style.chips}>
          {PRESETS_HORAS.map((h) => (
            <button
              key={h}
              type="button"
              className={`${style.chip} ${horasSemana === h ? style.chipAtivo : ""}`}
              onClick={() => setHorasSemana(h)}
            >
              {h}h
            </button>
          ))}
        </div>
        <input
          type="number"
          className="form-control"
          placeholder="Ou digite as horas por semana (máx: 60)"
          value={horasSemana}
          min={1}
          max={60}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setHorasSemana("");
            if (+v < 1 || +v > 60) return;
            setHorasSemana(+v);
          }}
        />
      </div>

      <div className={style.grid2}>
        <div className={style.campo}>
          <span className={style.label}>Data de início</span>
          <DatePicker value={dataInicio} onChange={setDataInicio} min={hoje} />
        </div>
        <div className={style.campo}>
          <span className={style.label}>Data final</span>
          <DatePicker
            value={dataFim}
            onChange={setDataFim}
            min={dataInicio || hoje}
          />
        </div>
      </div>
    </ModalBase>
  );
}

export default ModalCriarPlanoIA;
