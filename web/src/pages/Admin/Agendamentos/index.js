import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "../../../store/slices/agendamentoSlice";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { urlImagem } from "../../../services/api";


const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


const FotoCalendario = ({ foto, nome }) => {
  const [erro, setErro] = useState(false);
  const fotoUrl = foto && foto.startsWith("http") ? foto : null;

  return (
    <div className="w-full flex flex-col items-center">
      {fotoUrl && !erro ? (
        <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden bg-white flex items-center justify-center">
          <img
            src={fotoUrl}
            alt={nome}
            className="w-full h-full object-cover"
            onError={() => setErro(true)}
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 font-semibold">
          {nome ? nome.charAt(0).toUpperCase() : "?"}
        </div>
      )}
    </div>
  );
};


const Agendamentos = () => {
  const dispatch = useDispatch();
  const { agendamentos } = useSelector((state) => state.agendamento);

  const [view, setView] = useState("month");

  const colaboradores = agendamentos
    .map((a) => a.colaboradorId)
    .filter(
      (c, i, arr) => c && arr.findIndex((x) => x?._id === c?._id) === i
    );

  const colaboradoresFormatados = colaboradores.map((c) => ({
    id: c._id,
    nome: c.nome,
    foto: urlImagem(c.foto),
  }));



  const eventosReais = agendamentos.map((agendamento) => {
    const inicio = new Date(agendamento.data);

    let duracaoTotal =
      agendamento.duracaoTotal || agendamento.servicoId?.duracao || 0;

    if (
      !agendamento.duracaoTotal &&
      Array.isArray(agendamento.servicosAdicionais)
    ) {
      agendamento.servicosAdicionais.forEach((s) => {
        duracaoTotal += s.duracao || 0;
      });
    }

    const fim = addMinutes(inicio, duracaoTotal);

    const principal = agendamento.servicoId?.nomeServico || "Serviço";
    const adicionais = Array.isArray(agendamento.servicosAdicionais)
      ? agendamento.servicosAdicionais.map((s) => s.nomeServico)
      : [];

    const titulo =
      adicionais.length > 0
        ? `${principal} + ${adicionais.join(" + ")}`
        : principal;

    return {
      resourceId: agendamento.colaboradorId?._id,
      title: `${titulo} - ${agendamento.clienteId?.nome || "Cliente"}`,
      start: inicio,
      end: fim,
    };
  });


  const gerarGhostEvents = () => {
    if (view !== "day") return [];

    const agora = new Date();
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 30);
    const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 30);



    return colaboradores.map((c) => ({
      id: `ghost-${c._id}`,
      title: "",
      start: inicio,
      end: fim,
      resourceId: c._id,
      ghost: true,
    }));
  };

  const eventosFinais = [...eventosReais, ...gerarGhostEvents()];


  useEffect(() => {
    const today = new Date();

    const start = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const end = format(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
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


  const ResourceHeader = ({ resource }) => (
    <div className="flex flex-col items-center py-1">
      <FotoCalendario foto={resource.foto} nome={resource.nome} />
      <span className="text-xs font-semibold">{resource.nome}</span>
    </div>
  );


  const renderEvento = ({ event }) => (
    <span>{!event.ghost ? event.title : ""}</span>
  );


  const CustomToolbar = ({ label, onNavigate, onView, view }) => (
    <div className="relative flex flex-col md:flex-row items-center bg-white px-6 py-3 border-b border-gray-200 rounded-t-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition"
        >
          <CaretLeftIcon size={22} weight="bold" className="text-gray-700" />
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition"
        >
          <CaretRightIcon size={22} weight="bold" className="text-gray-700" />
        </button>
      </div>

      <h2 className="absolute left-1/2 transform -translate-x-1/2 text-base font-medium text-gray-800 select-none">
        {label}
      </h2>

      <div className="flex gap-2 md:ml-auto">
        {["month", "week", "agenda"].map((mode) => (
          <button
            key={mode}
            onClick={() => onView(mode)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition
              ${view === mode
                ? "bg-yellow-600/70 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {mode === "month"
              ? "Mês"
              : mode === "week"
                ? "Semana"
                : "Agenda"}
          </button>
        ))}
      </div>
    </div>
  );
  console.log("colaboradoresFormatados:", colaboradoresFormatados);


  return (
    <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-catamaran font-semibold text-[#2c2c2c]">
          Agendamentos
        </h2>
      </div>

      <div className="overflow-hidden font-catamaran">
        <Calendar
          localizer={localizer}
          events={eventosFinais}
          view={view}
          onView={setView}
          onRangeChange={(range) => {
            // Não carregar de novo quando estiver na view DIA
            if (view === "day") return;
            dispatch(filterAgendamentos(formatRange(range)));
          }}

          components={{
            toolbar: CustomToolbar,
            event: renderEvento,
            resourceHeader: view === "day" ? ResourceHeader : () => null,
          }}
          resources={colaboradoresFormatados}
          resourceIdAccessor="id"
          resourceTitleAccessor="nome"
          popup
          eventPropGetter={(event) => {
            if (event.ghost) {
              return {
                style: {
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                },
              };
            }
            return {}; 
          }}
          style={{ minHeight: "600px", height: "calc(100vh - 220px)" }}
          culture="pt-BR"
          messages={{
            allDay: "Dia inteiro",
            showMore: (total) => `+${total} mais`,
          }}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer.format(date, "EEE dd/MM", culture),
            timeGutterFormat: "HH:mm",
          }}
        />
      </div>

    </div>
  );
};

export default Agendamentos;
