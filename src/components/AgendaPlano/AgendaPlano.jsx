import { useEffect, useState } from "react";
import CalendarView from "../Calendario/Calendario";
import PlanoAPI from "../../services/PlanoService";
import { toast } from "react-toastify";

function AgendaPlano({ planoId }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!planoId) return;

    PlanoAPI.ObterAgenda(planoId)
      .then((res) => setEventos(mapAgendaParaCalendar(res)))
      .catch(() => toast.error("Erro ao carregar agenda"));
  }, [planoId]);

  return <CalendarView eventos={eventos} />;
}

export default AgendaPlano;
