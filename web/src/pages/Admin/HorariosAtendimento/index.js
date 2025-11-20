import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, parse, getHours, getMinutes, startOfWeek, getDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { dateFnsLocalizer, Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { TagPicker, Drawer, Modal, Checkbox, DatePicker, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

import toast, { Toaster } from "react-hot-toast";

// Redux actions
import {
  allHorarios,
  addHorario,
  removeHorario,
  updateHorario,
  allServicos,
  filterColaboradores,
  saveHorario,
} from "../../../store/slices/horarioSlice";

import util from "../../../services/util";

const colors = [
  "#3498db",
  "#9b59b6",
  "#e67e22",
  "#2ecc71",
  "#1abc9c",
  "#e74c3c",
  "#34495e",
  "#f1c40f",
];

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse: (value, formatStr) =>
    parse(value, formatStr, new Date(), { locale: ptBR }),
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

const diasSemanaData = [
  new Date(2025, 3, 13),
  new Date(2025, 3, 14),
  new Date(2025, 3, 15),
  new Date(2025, 3, 16),
  new Date(2025, 3, 17),
  new Date(2025, 3, 18),
  new Date(2025, 3, 19),
];

const diasDaSemana = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const HorariosAtendimento = () => {
  const dispatch = useDispatch();
  const {
    horario,
    horarios,
    form,
    components,
    behavior,
    servicos,
    colaboradores,
  } = useSelector((state) => state.horario);

  const setHorario = (key, value) => {
    dispatch(updateHorario({ horario: { ...horario, [key]: value } }));
  };

  const setComponentsState = (key, value) => {
    dispatch(updateHorario({ components: { ...components, [key]: value } }));
  };

  const onHorarioClick = (item) => {
    dispatch(updateHorario({ horario: item, behavior: "update" }));
    setComponentsState('drawer', true);
  };

  const save = () => {
    if (
      !util.allFields(horario, [
        "dias",
        "inicio",
        "fim",
        "especialidades",
        "colaboradores",
      ])
    ) {
      // ALTERAÇÃO — react-hot-toast 
      toast.error("Antes de prosseguir, preencha todos os campos!");
      return;
    }

    if (behavior === "create") dispatch(addHorario());
    else dispatch(saveHorario());
  };

  const remove = () => dispatch(removeHorario(horario._id));

  const formatEventos = () => {
    const lista = [];

    horarios.forEach((hor, index) => {
      hor.dias.forEach((dia) => {
        const inicio = new Date(hor.inicio);
        const fim = new Date(hor.fim);

        lista.push({
          resource: {
            horario: hor,
            backgroundColor: colors[index % colors.length],
          },
          title: `${hor.especialidades.length} espec. e ${hor.colaboradores.length} colab.`,
          start: new Date(
            diasSemanaData[dia].setHours(
              getHours(inicio),
              getMinutes(inicio)
            )
          ),
          end: new Date(
            diasSemanaData[dia].setHours(getHours(fim), getMinutes(fim))
          ),
        });
      });
    });

    return lista;
  };

  useEffect(() => {
    dispatch(allHorarios());
    dispatch(allServicos());
  }, []);

  useEffect(() => {
    if (!horario.especialidades || horario.especialidades.length === 0) {
      dispatch(updateHorario({ colaboradores: [] }));
      return;
    }
    dispatch(filterColaboradores());
  }, [horario.especialidades]);

  return (
    <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">

      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-catamaran font-semibold">Horários de atendimento</h2>
        <button
          onClick={() => setComponentsState("drawer", true)}
          className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/40  transition-all"
        >
          + Novo Horário
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={formatEventos()}
        selectable
        popup
        toolbar={false}
        style={{ height: 600 }}
        defaultDate={diasSemanaData[getDay(new Date())]}
        defaultView={components.view}
        onSelectEvent={(e) => onHorarioClick(e.resource.horario)}
        onSelectSlot={({ start, end }) => {
          dispatch(
            updateHorario({
              horario: {
                ...horario,
                dias: [getDay(start)],
                inicio: start.toISOString(),
                fim: end.toISOString(),
              },
            })
          );
          setComponentsState("drawer", true);
        }}
        formats={{
          dayFormat: (date, culture, localizer) =>
            localizer.format(date, "EEE dd/MM", culture),
          timeGutterFormat: "HH:mm",
        }}
        culture="pt-BR"
        eventPropGetter={(event) => ({
          style: {
            border: "none",
            color: "#fff",
          }
        })}

      />

      {/* DRAWER */}
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponentsState("drawer", false)}
      >
        <Drawer.Body>
          <h3>{behavior === "create" ? "Criar novo horário" : "Editar horário"}</h3>

          <div className="row mt-3">
            {/* Dias da semana */}
            <div className="col-12">
              <b>Dias da semana</b>
              <TagPicker
                size="lg"
                block
                data={diasDaSemana.map((label, value) => ({ label, value }))}
                value={horario.dias}
                onChange={(value) => setHorario("dias", value)}
              />
              <Checkbox
                checked={horario.dias.length === diasDaSemana.length}
                disabled={horario.dias.length === diasDaSemana.length}
                onChange={(_, selected) =>
                  setHorario(
                    "dias",
                    selected ? diasDaSemana.map((_, idx) => idx) : []
                  )
                }
              >
                Selecionar todos
              </Checkbox>
            </div>

            {/* Horário Inicial */}
            <div className="col-6 mt-3">
              <b className="d-block">Horário Inicial</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => ![0, 30].includes(min)}
                value={horario.inicio ? new Date(horario.inicio) : null}
                onChange={(e) => setHorario("inicio", e ? util.toLocalISO(e) : "")}
              />
            </div>

            {/* Horário Final */}
            <div className="col-6 mt-3">
              <b className="d-block">Horário Final</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => ![0, 30].includes(min)}
                value={horario.fim ? new Date(horario.fim) : null}
                onChange={(e) => setHorario("fim", e ? util.toLocalISO(e) : "")}
              />
            </div>

            {/* Especialidades */}
            <div className="col-12 mt-3">
              <b>Especialidades disponíveis</b>
              <TagPicker
                size="lg"
                block
                data={servicos}
                value={horario.especialidades}
                onChange={(v) => setHorario("especialidades", v)}
              />
              <Checkbox
                checked={horario.especialidades.length === servicos.length}
                disabled={horario.especialidades.length === servicos.length}
                onChange={(_, s) =>
                  setHorario(
                    "especialidades",
                    s ? servicos.map((s) => s.value) : []
                  )
                }
              >
                Selecionar todas
              </Checkbox>
            </div>

            {/* Colaboradores */}
            <div className="col-12 mt-3">
              <b>Colaboradores disponíveis</b>
              <TagPicker
                size="lg"
                block
                disabled={horario.especialidades.length === 0}
                data={colaboradores}
                value={horario.colaboradores}
                onChange={(v) => setHorario("colaboradores", v)}
              />
              <Checkbox
                checked={horario.colaboradores.length === colaboradores.length}
                disabled={horario.colaboradores.length === colaboradores.length}
                onChange={(_, s) =>
                  setHorario(
                    "colaboradores",
                    s ? colaboradores.map((c) => c.value) : []
                  )
                }
              >
                Selecionar todos
              </Checkbox>
            </div>
          </div>

          <Button
            loading={form.saving}
            color={behavior === "create" ? "green" : "blue"}
            block
            size="lg"
            onClick={save}
            className="mt-3"
          >
            Salvar horário
          </Button>

          {behavior === "update" && (
            <Button
              loading={form.saving}
              color="red"
              block
              size="lg"
              onClick={() => setComponentsState("confirmDelete", true)}
              className="mt-1"
            >
              Remover horário
            </Button>
          )}
        </Drawer.Body>
      </Drawer>

      {/* MODAL DELETE */}
      <Modal
        open={components.confirmDelete}
        onClose={() => setComponentsState("confirmDelete", false)}
        size="xs"
      >
        <Modal.Body>
          {/* ALTERAÇÃO — Removido ícone do RSuite */}
          Tem certeza que deseja excluir?
        </Modal.Body>
        <Modal.Footer>
          <Button loading={form.saving} color="red" onClick={remove}>
            Sim, tenho certeza
          </Button>
          <Button
            appearance="subtle"
            onClick={() => setComponentsState("confirmDelete", false)}
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default HorariosAtendimento;
