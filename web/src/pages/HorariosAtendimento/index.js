import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  format,
  parse,
  startOfWeek as startOfWeekFn,
  getDay,
  getHours,
  getMinutes,
  set as setDateParts,
} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import {
  allHorarios,
  addHorario,
  removeHorario,
  updateHorario,
  allServicos,
  filterColaboradores,
  saveHorario,
} from '../../store/slices/horarioSlice';

import util from '../../services/util';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    format(date, formatStr, { ...options, locale: ptBR }),
  parse: (value, formatStr, options) =>
    parse(value, formatStr, new Date(), { ...options, locale: ptBR }),
  startOfWeek: (date) => startOfWeekFn(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const diasDaSemana = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const diasSemanaData = [
  new Date(2021, 3, 11, 0, 0, 0, 0),
  new Date(2021, 3, 12, 0, 0, 0, 0),
  new Date(2021, 3, 13, 0, 0, 0, 0),
  new Date(2021, 3, 14, 0, 0, 0, 0),
  new Date(2021, 3, 15, 0, 0, 0, 0),
  new Date(2021, 3, 16, 0, 0, 0, 0),
  new Date(2021, 3, 17, 0, 0, 0, 0),
];

const defaultHorarioShape = {
  dias: [],
  inicio: '09:00',
  fim: '17:00',
  especialidades: [],
  colaboradores: [],
};

const INTERNAL_PALETTE = [
  '#EF4444',
  '#F97316',
  '#FBBF24',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#A78BFA',
  '#EC4899',
  '#F43F5E',
  '#7C3AED',
];
const getColor = (index) => INTERNAL_PALETTE[index % INTERNAL_PALETTE.length];

const HorariosAtendimento = () => {
  const dispatch = useDispatch();
  const {
    horario = null,
    horarios = [],
    form = {},
    components = {},
    behavior = 'create',
    servicos = [],
    colaboradores = [],
  } = useSelector((s) => s.horario || {});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localHorario, setLocalHorario] = useState(defaultHorarioShape);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        await Promise.all([dispatch(allHorarios()), dispatch(allServicos())]);
      } catch (err) {
        console.error('Erro ao buscar horários/serviços:', err);
        setToast({ type: 'error', text: 'Falha ao conectar com a API.' });
      }
    };
    fetchInitial();
  }, [dispatch]);

  useEffect(() => {
    if (horario) {
      const inicioStr =
        typeof horario.inicio === 'string'
          ? horario.inicio
          : horario.inicio
          ? format(new Date(horario.inicio), 'HH:mm')
          : defaultHorarioShape.inicio;
      const fimStr =
        typeof horario.fim === 'string'
          ? horario.fim
          : horario.fim
          ? format(new Date(horario.fim), 'HH:mm')
          : defaultHorarioShape.fim;
      setLocalHorario({ ...defaultHorarioShape, ...horario, inicio: inicioStr, fim: fimStr });
    }
  }, [horario]);

  useEffect(() => {
    dispatch(filterColaboradores());
  }, [dispatch, localHorario.especialidades]);

  const setHorarioKey = (key, value) => setLocalHorario((h) => ({ ...h, [key]: value }));

  const openNew = () => {
    setLocalHorario(defaultHorarioShape);
    try {
      dispatch(updateHorario({ horario: defaultHorarioShape, behavior: 'create' }));
    } catch (e) {}
    setDrawerOpen(true);
  };

  const onHorarioClick = (horarioSelecionado) => {
    dispatch(updateHorario({ horario: horarioSelecionado, behavior: 'update' }));
    setDrawerOpen(true);
  };

  const save = () => {
    if (!util.allFields(localHorario, ['dias', 'inicio', 'fim', 'especialidades', 'colaboradores'])) {
      setToast({ type: 'error', text: 'Preencha todos os campos antes de salvar.' });
      return;
    }
    try {
      if (behavior === 'create' || !localHorario._id) {
        dispatch(addHorario(localHorario));
        setToast({ type: 'success', text: 'Horário criado.' });
      } else {
        dispatch(saveHorario(localHorario));
        setToast({ type: 'success', text: 'Horário atualizado.' });
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setToast({ type: 'error', text: 'Erro ao salvar horário.' });
    } finally {
      setDrawerOpen(false);
      dispatch(allHorarios());
    }
  };

  const remove = () => {
    try {
      dispatch(removeHorario());
      setToast({ type: 'success', text: 'Pedido de remoção enviado.' });
    } catch (err) {
      console.error('Erro ao remover:', err);
      setToast({ type: 'error', text: 'Erro ao remover.' });
    } finally {
      setConfirmOpen(false);
      setDrawerOpen(false);
      dispatch(allHorarios());
    }
  };

  const formatEventos = useMemo(() => {
    const listaEventos = [];
    (horarios || []).forEach((hor, index) => {
      (hor.dias || []).forEach((dia) => {
        const inicioDate =
          typeof hor.inicio === 'string'
            ? parse(hor.inicio, 'HH:mm', new Date())
            : new Date(hor.inicio);
        const fimDate =
          typeof hor.fim === 'string' ? parse(hor.fim, 'HH:mm', new Date()) : new Date(hor.fim);

        const start = setDateParts(diasSemanaData[dia], {
          hours: getHours(inicioDate),
          minutes: getMinutes(inicioDate),
        });
        const end = setDateParts(diasSemanaData[dia], {
          hours: getHours(fimDate),
          minutes: getMinutes(fimDate),
        });

        listaEventos.push({
          resource: { horario: hor, backgroundColor: getColor(index) },
          title: `${(hor.especialidades || []).length} espec. e ${(hor.colaboradores || []).length} colab.`,
          start,
          end,
        });
      });
    });
    return listaEventos;
  }, [horarios]);

  const formatTime = (d) => {
    try {
      return format(new Date(d), 'HH:mm');
    } catch {
      return String(d || '');
    }
  };

  return (
    <div className="p-5 overflow-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Horários de atendimento</h2>
        <button
          onClick={openNew}
          className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/20 transition-all"
        >
          + Novo Horário
        </button>
      </div>

      {toast && (
        <div
          className={`mb-4 p-3 rounded ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <Calendar
          localizer={localizer}
          onSelectEvent={(e) => onHorarioClick(e.resource.horario)}
          onSelectSlot={(slotInfo) => {
            const { start, end } = slotInfo;
            const dia = getDay(start);
            dispatch(updateHorario({ horario: { ...localHorario, dias: [dia], inicio: start, fim: end }, behavior: 'create' }));
            setLocalHorario({ ...defaultHorarioShape, dias: [dia], inicio: formatTime(start), fim: formatTime(end) });
            setDrawerOpen(true);
          }}
          formats={{
            dateFormat: 'dd',
            dayFormat: (date) => format(date, 'EEEE', { locale: ptBR }),
            timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ptBR }),
            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`,
          }}
          events={formatEventos}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.backgroundColor,
              borderColor: event.resource.backgroundColor,
            },
          })}
          date={diasSemanaData[getDay(new Date())]}
          view={components?.view || 'week'}
          selectable
          popup
          toolbar={false}
          style={{ height: 600 }}
        />
      </div>

      {/* Drawer Lateral*/}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="ml-auto w-full md:w-2/5 bg-white h-full shadow-xl p-6 overflow-auto z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {localHorario._id ? 'Editar horário' : 'Criar novo horário de atendimento'}
              </h3>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-700">
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              {/* Seleção de um único dia da semana */}
              <div>
                <label className="block font-medium mb-2">Dia da semana</label>
                <select
                  value={
                    localHorario.dias && localHorario.dias.length > 0
                      ? String(localHorario.dias[0])
                      : ''
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setHorarioKey('dias', v === '' ? [] : [parseInt(v, 10)]);
                  }}
                  className="border rounded w-full p-2"
                >
                  <option value="">Selecione um dia</option>
                  {diasDaSemana.map((label, idx) => (
                    <option key={label} value={idx}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={localHorario.inicio}
                    onChange={(e) => setHorarioKey('inicio', e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={localHorario.fim}
                    onChange={(e) => setHorarioKey('fim', e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <label className="block font-medium mb-2">Especialidades</label>
                <select
                  multiple
                  value={localHorario.especialidades || []}
                  onChange={(e) =>
                    setHorarioKey(
                      'especialidades',
                      Array.from(e.target.selectedOptions).map((o) => o.value)
                    )
                  }
                  className="border rounded w-full p-2 h-32"
                >
                  {(servicos || []).map((s) => (
                    <option key={s.value ?? s._id ?? s.id} value={s.value ?? s._id ?? s.id}>
                      {s.label ?? s.titulo ?? s.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colaboradores */}
              <div>
                <label className="block font-medium mb-2">Colaboradores</label>
                <select
                  multiple
                  value={localHorario.colaboradores || []}
                  onChange={(e) =>
                    setHorarioKey(
                      'colaboradores',
                      Array.from(e.target.selectedOptions).map((o) => o.value)
                    )
                  }
                  className="border rounded w-full p-2 h-32"
                >
                  {(colaboradores || []).map((c) => (
                    <option key={c.value ?? c._id ?? c.id} value={c.value ?? c._id ?? c.id}>
                      {c.label ?? c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <button
                  onClick={save}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  {localHorario._id ? 'Salvar Horário' : 'Criar Horário'}
                </button>
                {localHorario._id && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    Remover Horário
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="bg-white p-6 rounded shadow max-w-sm z-10">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-500 text-2xl">⚠️</div>
              <div>
                <p className="font-semibold">Tem certeza que deseja excluir?</p>
                <p className="text-sm text-gray-600">Essa ação será irreversível.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={remove}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Sim, tenho certeza
              </button>
              <button onClick={() => setConfirmOpen(false)} className="flex-1 border py-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosAtendimento;
