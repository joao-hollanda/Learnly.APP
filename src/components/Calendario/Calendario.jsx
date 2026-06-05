import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { createPortal } from "react-dom";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./_calendario.module.css";
import { CiCalendar } from "react-icons/ci";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

const STATUS = {
  concluido: { cor: "#22c55e", label: "Concluído" },
  atual: { cor: "#3b82f6", label: "Em andamento" },
  proximo: { cor: "#ef4444", label: "Próximo" },
};
const STATUS_PADRAO = { cor: "#5B72F2", label: "" };

const fmtHora = (d) =>
  d instanceof Date
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

function Calendario({ eventos }) {
  const [hovered, setHovered] = useState(null);
  const [data, setData] = useState(new Date());

  const CustomDateHeader = ({ label, date }) => {
    const eventosDoDia = eventos.filter(
      (ev) =>
        ev.start instanceof Date &&
        ev.start.toDateString() === date.toDateString(),
    );

    return (
      <div
        className={style.dateHeader}
        onMouseEnter={(e) => {
          if (!eventosDoDia.length) return;

          const rect = e.currentTarget.getBoundingClientRect();

          setHovered({
            date,
            eventos: eventosDoDia,
            top: rect.top,
            left: rect.left,
            width: rect.width,
          });
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {label}
      </div>
    );
  };

  return (
    <div className={style.calendarioCard}>
      <div className={style.calHeader}>
        <button
          type="button"
          className={style.calNav}
          onClick={() => setData((d) => subMonths(d, 1))}
          aria-label="Mês anterior"
        >
          <FiChevronLeft />
        </button>
        <span className={style.calTitulo}>
          {format(data, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <button
          type="button"
          className={style.calNav}
          onClick={() => setData((d) => addMonths(d, 1))}
          aria-label="Próximo mês"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className={style.calGrid}>
        <Calendar
          localizer={localizer}
          events={eventos}
          date={data}
          onNavigate={setData}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          view="month"
          views={["month"]}
          toolbar={false}
          style={{ height: "100%" }}
          formats={{
            weekdayFormat: (date, culture, localizer) =>
              localizer.format(date, "EEEEEE", culture).toUpperCase(),
          }}
          messages={{ showMore: (total) => `${total} outros` }}
          components={{
            month: {
              dateHeader: CustomDateHeader,
            },
          }}
          eventPropGetter={(event) => ({
            className: style.calendarEvent,
            style: {
              backgroundColor: (STATUS[event.status] || STATUS_PADRAO).cor,
            },
          })}
        />
      </div>

      <div className={style.legenda}>
        {Object.values(STATUS).map((s) => (
          <span key={s.label} className={style.legendaItem}>
            <span className={style.legendaDot} style={{ background: s.cor }} />
            {s.label}
          </span>
        ))}
      </div>

      {hovered &&
        createPortal(
          <div
            className={style.tooltip}
            style={{
              top: hovered.top - 8,
              left: hovered.left + hovered.width / 2,
            }}
          >
            <div className={style.tooltipArrow} />

            <div className={style.tooltipHeader}>
              <span className={style.tooltipHeaderIcon}>
                <CiCalendar />
              </span>
              <div>
                <span className={style.tooltipDate}>
                  {hovered.date.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className={style.tooltipCount}>
                  {hovered.eventos.length}{" "}
                  {hovered.eventos.length === 1 ? "evento" : "eventos"}
                </span>
              </div>
            </div>

            <div className={style.tooltipList}>
              {hovered.eventos.map((e, i) => {
                const s = STATUS[e.status] || STATUS_PADRAO;
                return (
                  <div key={i} className={style.tooltipItem}>
                    <span
                      className={style.tooltipDot}
                      style={{ background: s.cor }}
                    />
                    <div className={style.tooltipInfo}>
                      <span className={style.tooltipTitle}>{e.title}</span>
                      <span className={style.tooltipTime}>
                        {fmtHora(e.start)} – {fmtHora(e.end)}
                      </span>
                    </div>
                    {s.label && (
                      <span
                        className={style.tooltipStatus}
                        style={{ color: s.cor, background: `${s.cor}1a` }}
                      >
                        {s.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Calendario;
