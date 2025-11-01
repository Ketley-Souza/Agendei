import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "../../store/slices/agendamentoSlice";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import "react-big-calendar/lib/css/react-big-calendar.css";




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
  const [view, setView] = useState("month");
  // === Formata os eventos ===
  const formatEventos = () =>
    agendamentos.map((agendamento) => {
      const inicio = new Date(agendamento.data);
      const duracao = agendamento.servicoId?.duracao || 0;
      const fim = addMinutes(inicio, duracao);

      return {
        resource: { agendamento },
title: `${agendamento.servicoId.titulo} - ${agendamento.clienteId.nome} - ${agendamento.colaboradorId.nome}`,        start: inicio,
        end: fim,
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
  const renderEvento = ({ event }) => <span>{event.title}</span>;



  const CustomToolbar = ({ label, onNavigate, onView, view }) => (
    <div className="relative flex flex-col md:flex-row items-center bg-white px-6 py-3 border-b border-gray-200 rounded-t-lg shadow-sm">

      {/* Navegação (voltar / próximo) */}
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <button onClick={() => onNavigate("PREV")} className="p-2 rounded-full hover:bg-gray-100 bg-gray-200 transition">
          <CaretLeftIcon size={22} weight="bold" className="text-gray-700" />
        </button>
        <button onClick={() => onNavigate("NEXT")} className="p-2 rounded-full hover:bg-gray-100 bg-gray-200 transition">
          <CaretRightIcon size={22} weight="bold" className="text-gray-700" />
        </button>
      </div>

      {/* Título centralizado */}
      <h2 className="absolute left-1/2 transform -translate-x-1/2 text-base font-medium text-gray-800 select-none">
        {label}
      </h2>

      {/* Tipos de visualização */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center mt-2 sm:mt-0 md:ml-auto">
        {["month", "week", "day", "agenda"].map((mode) => (
          <button
            key={mode}
            onClick={() => onView(mode)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${view === mode
              ? "bg-yellow-600/70 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {mode === "month" ? "Mês" : mode === "week" ? "Semana" : mode === "day" ? "Dia" : "Agenda"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
      {/* ===== Cabeçalho ===== */}
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-xl fint-sans font-semibold text-[#2c2c2c]">
          Agendamentos
        </h2>
      </div>

      {/* ===== Calendário ===== */}
      <div className="overflow-hidden">
        <Calendar
          localizer={localizer}
          events={formatEventos()}
          view={view}
          onView={(newView) => setView(newView)}
          onRangeChange={(range) =>
            dispatch(filterAgendamentos(formatRange(range)))
          }
          components={{
            toolbar: CustomToolbar,
            event: renderEvento,
          }}
          popup
          selectable
          style={{ minHeight: "600px", height: "calc(100vh - 220px)" }}
          messages={{
            allDay: "Dia inteiro",
            date: "Data",
            time: "Hora",
            event: "Evento",
            showMore: (total) => `+${total} mais`,
          }}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer.format(date, "EEE dd/MM", culture),
            timeGutterFormat: "HH:mm",
          }}
          culture="pt-BR"
        />
      </div>

      {/* ==== ESTILIZAÇÃO DO DIA ATUAL ==== */}
      <style>{`
        .rbc-today {
          background-color: rgba(35, 34, 31, 0.21); /* Amarelo suave */
        }
      `}</style>
    </div>
  );
};

export default Agendamentos;