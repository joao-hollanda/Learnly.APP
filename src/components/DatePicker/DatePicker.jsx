import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import style from "./_datepicker.module.css";

const POP_HEIGHT = 340;
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const paraData = (valor) => {
  if (!valor) return null;
  try {
    return parseISO(valor);
  } catch {
    return null;
  }
};

export default function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Selecione a data",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const fieldRef = useRef(null);
  const popRef = useRef(null);

  const selecionado = paraData(value);
  const minData = min ? startOfDay(parseISO(min)) : null;
  const [mesAtual, setMesAtual] = useState(selecionado ?? minData ?? new Date());

  const calcularPosicao = () => {
    const r = fieldRef.current.getBoundingClientRect();
    const largura = Math.max(r.width, 288);
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
    setMesAtual(selecionado ?? minData ?? new Date());
    calcularPosicao();
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const reposicionar = () => calcularPosicao();
    window.addEventListener("resize", reposicionar);
    return () => window.removeEventListener("resize", reposicionar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (fieldRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const inicioGrade = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 0 });
  const fimGrade = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 0 });
  const dias = eachDayOfInterval({ start: inicioGrade, end: fimGrade });

  const selecionar = (dia) => {
    if (minData && isBefore(startOfDay(dia), minData)) return;
    onChange(format(dia, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <div className={style.wrapper}>
      <button
        type="button"
        ref={fieldRef}
        className={`${style.field} ${open ? style.fieldOpen : ""}`}
        onClick={() => (open ? setOpen(false) : abrir())}
      >
        <span className={selecionado ? style.valor : style.placeholder}>
          {selecionado ? format(selecionado, "dd/MM/yyyy") : placeholder}
        </span>
        <FiCalendar className={style.icone} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popRef}
            className={style.popover}
            style={{ top: coords.top, left: coords.left, width: coords.width }}
          >
            <div className={style.cabecalho}>
              <button
                type="button"
                className={style.nav}
                onClick={() => setMesAtual((m) => addMonths(m, -1))}
                aria-label="Mês anterior"
              >
                <FiChevronLeft />
              </button>
              <span className={style.mesLabel}>
                {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <button
                type="button"
                className={style.nav}
                onClick={() => setMesAtual((m) => addMonths(m, 1))}
                aria-label="Próximo mês"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className={style.semana}>
              {SEMANA.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className={style.grade}>
              {dias.map((dia) => {
                const foraMes = !isSameMonth(dia, mesAtual);
                const desabilitado = minData && isBefore(startOfDay(dia), minData);
                const ativo = selecionado && isSameDay(dia, selecionado);
                const ehHoje = isSameDay(dia, new Date());
                return (
                  <button
                    key={dia.toISOString()}
                    type="button"
                    disabled={desabilitado}
                    onClick={() => selecionar(dia)}
                    className={[
                      style.dia,
                      foraMes ? style.foraMes : "",
                      ativo ? style.diaAtivo : "",
                      ehHoje && !ativo ? style.hoje : "",
                    ].join(" ")}
                  >
                    {format(dia, "d")}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
