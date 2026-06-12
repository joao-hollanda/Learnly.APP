import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiClock } from "react-icons/fi";
import style from "./_timepicker.module.css";

const POP_HEIGHT = 240;
const pad = (n) => String(n).padStart(2, "0");

export default function TimePicker({
  value,
  onChange,
  placeholder = "--:--",
  minuteStep = 5,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const fieldRef = useRef(null);
  const popRef = useRef(null);

  const [h, m] = value ? value.split(":") : ["", ""];

  const horas = Array.from({ length: 24 }, (_, i) => pad(i));
  const minutos = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) =>
    pad(i * minuteStep)
  );

  const calcularPosicao = () => {
    const r = fieldRef.current.getBoundingClientRect();
    const largura = Math.max(r.width, 160);
    let left = r.left;
    if (left + largura > window.innerWidth - 8) left = window.innerWidth - 8 - largura;
    if (left < 8) left = 8;
    let top = r.bottom + 6;
    if (top + POP_HEIGHT > window.innerHeight - 8) {
      const acima = r.top - 6 - POP_HEIGHT;
      top = acima < 8 ? Math.max(8, window.innerHeight - 8 - POP_HEIGHT) : acima;
    }
    setCoords({ top, left, width: largura });
  };

  const abrir = () => {
    calcularPosicao();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (fieldRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const reposicionar = () => calcularPosicao();
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", reposicionar);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", reposicionar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && popRef.current) {
      popRef.current
        .querySelectorAll(`.${style.opcaoAtiva}`)
        .forEach((el) => el.scrollIntoView({ block: "center" }));
    }
  }, [open]);

  const setHora = (nh) => onChange(`${nh}:${m || "00"}`);
  const setMinuto = (nm) => onChange(`${h || "00"}:${nm}`);

  return (
    <div className={style.wrapper}>
      <button
        type="button"
        ref={fieldRef}
        className={`${style.field} ${open ? style.fieldOpen : ""}`}
        onClick={() => (open ? setOpen(false) : abrir())}
      >
        <span className={value ? style.valor : style.placeholder}>
          {value || placeholder}
        </span>
        <FiClock className={style.icone} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popRef}
            className={style.popover}
            style={{ top: coords.top, left: coords.left, width: coords.width }}
          >
            <div className={style.coluna}>
              {horas.map((hh) => (
                <button
                  key={hh}
                  type="button"
                  className={`${style.opcao} ${h === hh ? style.opcaoAtiva : ""}`}
                  onClick={() => setHora(hh)}
                >
                  {hh}
                </button>
              ))}
            </div>
            <div className={style.separador}>:</div>
            <div className={style.coluna}>
              {minutos.map((mm) => (
                <button
                  key={mm}
                  type="button"
                  className={`${style.opcao} ${m === mm ? style.opcaoAtiva : ""}`}
                  onClick={() => setMinuto(mm)}
                >
                  {mm}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
