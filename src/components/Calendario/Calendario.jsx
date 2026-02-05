import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { createPortal } from "react-dom";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./_calendario.module.css";
import { CiCalendar } from "react-icons/ci";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

function Calendario({ eventos }) {
  const [hovered, setHovered] = useState(null);

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
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"
        view="month"
        views={["month"]}
        toolbar={false}
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
            backgroundColor:
              {
                concluido: "#22c55e",
                atual: "#3b82f6",
                proximo: "#ef4444",
              }[event.status] || "#5B72F2",
          },
        })}
      />

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
              <CiCalendar />
              <span>
                {hovered.date.toLocaleDateString("pt-BR")}
              </span>
            </div>

            {hovered.eventos.map((e, i) => {
              const inicio =
                e.start instanceof Date ? e.start.getHours() : "--";
              const fim =
                e.end instanceof Date ? e.end.getHours() : "--";

              return (
                <div key={i} className={style.tooltipItem}>
                  • {e.title} ({inicio}h - {fim}h)
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

export default Calendario;