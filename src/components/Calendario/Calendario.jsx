import { useState, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
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

function CalendarView({ eventos }) {
    const [hovered, setHovered] = useState(null);
    const calendarWrapperRef = useRef(null);

    const CustomDateHeader = ({ label, date }) => {
        const eventosDoDia = eventos.filter(
            (ev) =>
                ev.start instanceof Date &&
                ev.start.toDateString() === date.toDateString()
        );

        return (
            <div
                style={{ position: "relative", width: "100%", height: "100%" }}
                onMouseEnter={(e) => {
                    if (!eventosDoDia.length) return;
                    const cardRect = e.currentTarget.getBoundingClientRect();
                    const containerRect = calendarWrapperRef.current.getBoundingClientRect();

                    setHovered({
                        date,
                        eventos: eventosDoDia,
                        top: cardRect.top - containerRect.top,
                        left: cardRect.left - containerRect.left,
                        width: cardRect.width,
                        height: cardRect.height,
                    });
                }}
                onMouseLeave={() => setHovered(null)}
            >
                {label}
            </div>
        );
    };

    return (
        <div
            ref={calendarWrapperRef}
            className={style.calendario_card}
            style={{ position: "relative" }}
        >
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
                eventPropGetter={(event) => {
                    const cores = {
                        concluido: "#22c55e",
                        atual: "#3b82f6",
                        proximo: "#ef4444",
                    };

                    return {
                        style: {
                            backgroundColor: cores[event.status] || "#5B72F2",
                            color: "white",
                            fontSize: "0.7rem",
                            borderRadius: "6px",
                            padding: "2px 4px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        },
                    };
                }}
            />

            {hovered && (
                <div
                    style={{
                        position: "absolute",
                        top: hovered.top - 8,
                        left: hovered.left + hovered.width / 2,
                        transform: "translate(-50%, -100%)",
                        backgroundColor: "#fff",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                        padding: "10px",
                        borderRadius: 10,
                        zIndex: 9999,
                        minWidth: 200,
                        pointerEvents: "none",
                        overflow: "visible"
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            bottom: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "8px solid #fff",
                        }}
                    />
                    <strong style={{ display: "block", marginBottom: 6 }} >
                        <div className={style.eventos}>
                            <CiCalendar />
                            <p>{hovered.date.toLocaleDateString("pt-BR")}</p>
                        </div>
                    </strong>

                    {hovered.eventos.map((e, i) => {
                        const inicio = e.start instanceof Date ? e.start.getHours() : "--";
                        const fim = e.end instanceof Date ? e.end.getHours() : "--";
                        return (
                            <div key={i} style={{ fontSize: "0.85rem", marginTop: 6, color: "#333"}}>
                                <span style={{fontSize: "1rem", color: "black", marginRight: ".2rem"}}>•</span> {e.title} ({inicio}h - {fim}h)
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CalendarView;
