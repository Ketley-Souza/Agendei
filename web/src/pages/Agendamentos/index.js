import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "../../store/slices/agendamentoSlice";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import "./Agendamentos.css";

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
  const navigate = useNavigate();
  const { agendamentos } = useSelector((state) => state.agendamento);

  // === Formata os eventos ===
  const formatEventos = () =>
    agendamentos.map((agendamento) => {
      const inicio = new Date(agendamento.data);
      const duracao = agendamento.servicoId?.duracao || 0;
      const fim = addMinutes(inicio, duracao);

      return {
        resource: { agendamento },
        title: `${agendamento.clienteId?.nome || ""} - ${
          agendamento.servicoId?.titulo || ""
        }`,
        start: inicio,
        end: fim,
        type: agendamento.servicoId?.titulo?.toLowerCase() || "outro",
      };
    });

  // === Carrega os agendamentos do mês ===
  useEffect(() => {
    const today = new Date();
    const start = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const end = format(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
      "yyyy-MM-dd"
    );
    dispatch(filterAgendamentos({ start, end }));
  }, [dispatch]);

  // === Atualiza range quando o mês muda ===
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

  // === Renderiza cada evento ===
  const renderEvento = ({ event }) => (
    <span className={`evento evento-${event.type}`}>{event.title}</span>
  );

  return (
    <div className="col p-5 overflow-auto h-100">
      {/* ================== CABEÇALHO SUPERIOR ================== */}
      <div className="header-agendamentos d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo-agendamentos">Agendamentos</h2>

        <div className="d-flex align-items-center gap-3">
          {/* Espaço reservado para LOGO */}
          <div className="logo-placeholder">
            <span>LOGO</span>
          </div>

          {/* Botão ADICIONAR */}
          <button
            className="btn-add-agendamento"
            onClick={() => navigate("/agendamentos/novo")}
          >
            ADICIONAR
          </button>
        </div>
      </div>

      {/* ================== CALENDÁRIO ================== */}
      <div className="calendar-container bg-white rounded shadow-sm border">
        <Calendar
          localizer={localizer}
          events={formatEventos()}
          onRangeChange={(range) =>
            dispatch(filterAgendamentos(formatRange(range)))
          }
          defaultView="month"
          views={["month"]}
          components={{
            event: renderEvento,
          }}
          style={{ height: "calc(100vh - 220px)" }}
          messages={{
            allDay: "Dia inteiro",
            previous: "Voltar",
            next: "Próximo",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            showMore: (total) => `+${total} mais`,
          }}
        />
      </div>
    </div>
  );
};

export default Agendamentos;