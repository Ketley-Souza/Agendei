import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "../../store/slices/agendamentoSlice";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Agendamentos = () => {
  const dispatch = useDispatch();
  const { agendamentos } = useSelector((state) => state.agendamento);

  const formatEventos = () =>
    agendamentos.map((agendamento) => {
      const inicio = new Date(agendamento.data);
      const duracao = agendamento.servicoId?.duracao || 0;
      const fim = addMinutes(inicio, duracao);

      return {
        resource: { agendamento },
        title: `${agendamento.servicoId?.titulo || ""} - ${agendamento.clienteId?.nome || ""
          }`,
        start: inicio,
        end: fim,
      };
    });

  useEffect(() => {
    const today = new Date();
    const start = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const end = format(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
      "yyyy-MM-dd"
    );

    dispatch(filterAgendamentos({ start, end }));
  }, [dispatch]);

  const formatRange = (range) => {
    if (Array.isArray(range)) {
      return {
        start: format(range[0], "yyyy-MM-dd"),
        end: format(range[range.length - 1], "yyyy-MM-dd"),
      };
    }
    return {
      start: format(range.start, "yyyy-MM-dd"),
      end: format(range.end, "yyyy-MM-dd"),
    };
  };

  return (
    <div className="col p-5 overflow-auto h-100">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4 mt-0">Agendamentos</h2>
          <Calendar
            localizer={localizer}
            events={formatEventos()}
            onRangeChange={(range) =>
              dispatch(filterAgendamentos(formatRange(range)))
            }
            defaultView="week"
            selectable
            popup
            style={{ height: "calc(100vh - 120px)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Agendamentos;
