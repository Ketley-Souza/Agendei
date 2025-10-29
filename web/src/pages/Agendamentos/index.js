import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "./actions";
import { Calendar, momentLocalizer } from "react-big-calendar";
import 'react-big-calendar/lib/css/react-big-calendar.css';
//erro import 'react-big-calendar/dist/react-big-calendar.css';

import moment from "moment";



const localizer = momentLocalizer(moment);

  const Agendamentos = () => {
  const dispatch = useDispatch();
  const { agendamentos } = useSelector((state) => state.agendamento);

  const formatEventos = () => {
    return agendamentos.map((agendamento) => ({
      resource: { agendamento },
      title: `${agendamento.servicoId.titulo} - ${agendamento.clienteId.nome}`,
      start: moment(agendamento.data).toDate(),
      end: moment(agendamento.data)
        .add(agendamento.servicoId.duracao, "minutes")
        .toDate(),
    }));
  };

  useEffect(() => {
    dispatch(
      filterAgendamentos({
        start: moment().weekday(0).format("YYYY-MM-DD"),
        end: moment().weekday(6).format("YYYY-MM-DD"),
      })
    );
  }, [dispatch]);

  const formatRange = (range) => {
    let finalRange = {};
    if (Array.isArray(range)) {
      finalRange = {
        start: moment(range[0]).format("YYYY-MM-DD"),
        end: moment(range[range.length - 1]).format("YYYY-MM-DD"),
      };
    } else {
      finalRange = {
        start: moment(range.start).format("YYYY-MM-DD"),
        end: moment(range.end).format("YYYY-MM-DD"),
      };
    }
    return finalRange;
  };

  return (
    <div className="col p-5 overflow-auto h-100">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4 mt-0">Agendamentos</h2>
          <Calendar
            localizer={localizer}
            onRangeChange={(range) =>
              dispatch(filterAgendamentos(formatRange(range)))
            }
            onSelectEvent={() => {}}
            events={formatEventos()}
            defaultView="month"
            selectable={true}
            popup={true}
            style={{ height: "calc(100vh - 120px)" }}
            eventPropGetter={(event) => {
              const servico =
                event.resource.agendamento.servicoId.titulo.toLowerCase();
              let color = "";
//teste
              if (servico.includes("unha")) color = "#007bff"; // azul
              else if (servico.includes("cabelo")) color = "#ff9900"; // laranja
              else if (servico.includes("spa")) color = "#ff0000"; // vermelho
              else color = "#555";
//--------------------------------------------------------------------------------
              return {
                style: {
                  backgroundColor: "transparent",
                  color,
                  fontWeight: "bold",
                  border: "none",
                },
              };
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Agendamentos;
