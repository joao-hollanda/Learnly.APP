import { Button } from "react-bootstrap";
import { BsClipboardPlus } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";
import {
  LuBookOpen,
  LuCalculator,
  LuFlaskConical,
  LuLandmark,
} from "react-icons/lu";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

const materias = [
  {
    label: "Linguagens",
    area: "Português · Literatura",
    value: "linguagens",
    icone: <LuBookOpen />,
  },
  {
    label: "Matemática",
    area: "Álgebra · Geometria",
    value: "matematica",
    icone: <LuCalculator />,
  },
  {
    label: "Ciências da Natureza",
    area: "Física · Química · Bio",
    value: "ciencias-natureza",
    icone: <LuFlaskConical />,
  },
  {
    label: "Ciências Humanas",
    area: "História · Geografia",
    value: "ciencias-humanas",
    icone: <LuLandmark />,
  },
];

const PRESETS_QUESTOES = [5, 10, 15, 20, 25];

export default function ModalCriarSimulado({
  show,
  onHide,
  loading,
  quantidade,
  setQuantidade,
  materiasSelecionadas,
  toggleMateria,
  onGerar,
}) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Novo simulado"
      subtitle="Escolha as áreas e o tamanho da prova"
      kicker="Simulados"
      iconType="info"
      icon={<BsClipboardPlus />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onGerar} disabled={loading}>
            {loading ? <span className={style.spinner} /> : <><BsClipboardPlus /> Criar</>}
          </Button>
        </>
      }
    >
      <div className={style.campo}>
        <span className={style.label}>Matérias</span>
        <div className={style.selector}>
          {materias.map((m) => {
            const ativa = materiasSelecionadas.includes(m.value);
            return (
              <button
                key={m.value}
                type="button"
                className={`${style.selTile} ${ativa ? style.selTileAtivo : ""}`}
                onClick={() => toggleMateria(m.value)}
              >
                <span className={style.selIcone}>{m.icone}</span>
                <span className={style.selTexto}>
                  <span className={style.selNome}>{m.label}</span>
                  <span className={style.selArea}>{m.area}</span>
                </span>
                <span className={style.selCheck}>
                  <FaCheck />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={style.campo}>
        <span className={style.label}>Quantidade de questões</span>
        <div className={style.chips}>
          {PRESETS_QUESTOES.map((q) => (
            <button
              key={q}
              type="button"
              className={`${style.chip} ${quantidade === q ? style.chipAtivo : ""}`}
              onClick={() => setQuantidade(q)}
            >
              {q}
            </button>
          ))}
        </div>
        <input
          type="number"
          className="form-control"
          value={quantidade}
          min={1}
          max={25}
          placeholder="Ou digite um valor (máx: 25)"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setQuantidade("");
            if (+v < 1 || +v > 25) return;
            setQuantidade(+v);
          }}
        />
        <span className={style.hint}>
          As questões vêm de provas reais do ENEM (2009–2023).
        </span>
      </div>
    </ModalBase>
  );
}
