//horario
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek as startOfWeekFn,
  getDay,
  getHours,
  getMinutes,
  set as setDateParts,
  isValid as isValidDate,
  addDays,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import {
  allHorarios,
  addHorario,
  removeHorario,
  allServicos,
  filterColaboradores,
  saveHorario,
  updateHorario,
} from "../../../store/slices/horarioSlice";

/* ---------- Locale / Localizer (date-fns + react-big-calendar) ---------- */
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    format(date, formatStr, { ...options, locale: ptBR }),
  parse: (value, formatStr, options) =>
    parse(value, formatStr, new Date(), { ...options, locale: ptBR }),
  startOfWeek: (date) => startOfWeekFn(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

/* ---------- Palette (cores dos eventos) ---------- */
const INTERNAL_PALETTE = [
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#FBBF24",
  "#F97316",
  "#EF4444",
  "#A78BFA",
];
const getColor = (i) => INTERNAL_PALETTE[i % INTERNAL_PALETTE.length];

/* ---------- Forma padrão de um horário (uso ao criar) ---------- */
const defaultHorarioShape = {
  dias: [],
  inicio: "09:00",
  fim: "17:00",
  especialidades: [],
  colaboradores: [],
};

/* =================== Componente principal =================== */
const HorariosAtendimento = () => {
  const dispatch = useDispatch();
  const { horarios = [], servicos = [], colaboradores = [] } =
    useSelector((s) => s.horario || {});

  /* UI local state */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localHorario, setLocalHorario] = useState(defaultHorarioShape);
  const [toast, setToast] = useState(null);

  /* Colaboradores mostrados no select (carregados pela especialidade) */
  const [localColaboradores, setLocalColaboradores] = useState([]);
  const [colabLoading, setColabLoading] = useState(false);

  /* Carrega horários e serviços ao montar a página */
  useEffect(() => {
    dispatch(allHorarios());
    dispatch(allServicos());
  }, [dispatch]);

  /*
    Carrega colaboradores com base na(s) especialidade(s) selecionada(s).
    Tenta usar o thunk filterColaboradores (por compatibilidade) e faz fallback
    para request direto ao endpoint caso necessário.
  */
  useEffect(() => {
    const servicosArray =
      localHorario.especialidades && localHorario.especialidades.length > 0
        ? localHorario.especialidades
        : [];

    if (servicosArray.length === 0) {
      setLocalColaboradores([]);
      return;
    }

    let mounted = true;
    setColabLoading(true);

    dispatch(filterColaboradores({ servicos: servicosArray }))
      .then((res) => {
        const payload = res && (res.payload || res.data || res);
        let list = [];

        if (payload) {
          if (Array.isArray(payload)) list = payload;
          else if (Array.isArray(payload.colaboradores)) list = payload.colaboradores;
          else if (Array.isArray(payload.data)) list = payload.data;
        }

        if (list && list.length > 0) {
          const normalized = (list || [])
            .map((c) => {
              if (!c) return null;
              if (c.label && c.value) return { value: c.value, label: c.label, _id: c._id ?? c.value, nome: c.label };
              if (c.colaboradorId && c.colaboradorId._id) {
                return {
                  value: c.colaboradorId._id,
                  label: c.colaboradorId.nome,
                  _id: c.colaboradorId._id,
                  nome: c.colaboradorId.nome,
                };
              }
              if (c._id && (c.nome || c.label)) return { value: c._id, label: c.nome ?? c.label, _id: c._id, nome: c.nome ?? c.label };
              return { value: c.value ?? c._id ?? c.id ?? String(c), label: c.label ?? c.nome ?? String(c), _id: c._id ?? c.id ?? c.value, nome: c.nome ?? c.label ?? String(c) };
            })
            .filter(Boolean);
          if (mounted) setLocalColaboradores(normalized);
        } else {
          throw new Error("thunk-empty");
        }
      })
      .catch(async (err) => {
        // fallback: request direto ao backend
        try {
          const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
          const resp = await fetch(`${API}/horario/colaboradores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ servicos: servicosArray }),
          });
          const text = await resp.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }

          let list = [];
          if (Array.isArray(data)) list = data;
          else if (data && Array.isArray(data.colaboradores)) list = data.colaboradores;
          else if (data && Array.isArray(data.data)) list = data.data;

          const normalized = (list || [])
            .map((c) => {
              if (!c) return null;
              if (c.label && c.value) return { value: c.value, label: c.label, _id: c._id ?? c.value, nome: c.label };
              if (c.colaboradorId && c.colaboradorId._id) return { value: c.colaboradorId._id, label: c.colaboradorId.nome, _id: c.colaboradorId._id, nome: c.colaboradorId.nome };
              if (c._id && (c.nome || c.label)) return { value: c._id, label: c.nome ?? c.label, _id: c._id, nome: c.nome ?? c.label };
              return { value: c.value ?? c._id ?? c.id ?? String(c), label: c.label ?? c.nome ?? String(c), _id: c._id ?? c.id ?? c.value, nome: c.nome ?? c.label ?? String(c) };
            })
            .filter(Boolean);

          if (mounted) {
            if (normalized.length > 0) setLocalColaboradores(normalized);
            else if (Array.isArray(colaboradores) && colaboradores.length > 0) {
              const normalizedFromSlice = colaboradores.map((c) => ({
                value: c.value ?? c._id ?? c.id,
                label: c.label ?? c.nome ?? String(c),
                _id: c._id ?? c.id ?? c.value,
                nome: c.nome ?? c.label ?? String(c),
              }));
              setLocalColaboradores(normalizedFromSlice);
            } else {
              setLocalColaboradores([]);
            }
          }
        } catch (fetchErr) {
          if (mounted) setLocalColaboradores([]);
        }
      })
      .finally(() => {
        if (mounted) setColabLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, localHorario.especialidades, colaboradores]);

  /* Atualiza uma chave do localHorario */
  const setHorarioKey = (key, value) =>
    setLocalHorario((h) => ({ ...h, [key]: value }));

  /* Datas utilizadas para construir eventos na semana atual */
  const startOfWeekDate = startOfWeekFn(new Date(), { weekStartsOn: 0 });
  const diasSemanaData = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeekDate, i)
  );

  /*
    Monta os eventos que o react-big-calendar exibirá.
    - Aceita `inicio`/`fim` em "HH:mm" ou ISO (string).
    - Constrói start/end com a data base do dia da semana.
  */
  const formatEventos = useMemo(() => {
    const listaEventos = [];

    (horarios || []).forEach((hor, index) => {
      const diasArray = Array.isArray(hor.dias)
        ? hor.dias
        : (hor.dias !== undefined && hor.dias !== null)
        ? [hor.dias]
        : [];

      if (!diasArray.length) return;

      diasArray.forEach((diaRaw) => {
        const dia = Number(diaRaw);
        if (!Number.isFinite(dia) || dia < 0 || dia > 6) return;

        const tryParseHHmm = (s) => {
          if (typeof s !== 'string') return null;
          if (!/^\s*\d{1,2}:\d{2}\s*$/.test(s)) return null;
          try { return parse(s.trim(), 'HH:mm', new Date()); } catch { return null; }
        };

        const tryParseISOorDate = (v) => {
          try {
            if (v instanceof Date && !isNaN(v)) return v;
            if (typeof v === 'number') {
              const d = new Date(v);
              return isValidDate(d) ? d : null;
            }
            if (typeof v === 'string') {
              const d = new Date(v);
              if (isValidDate(d)) return d;
            }
          } catch { }
          return null;
        };

        const inicioDate = tryParseHHmm(hor.inicio) || tryParseISOorDate(hor.inicio);
        const fimDate = tryParseHHmm(hor.fim) || tryParseISOorDate(hor.fim);

        if (!inicioDate || !fimDate) return;

        const baseDate = Array.isArray(diasSemanaData) && diasSemanaData[dia]
          ? diasSemanaData[dia]
          : (() => { const start = startOfWeekFn(new Date(), { weekStartsOn: 0 }); return addDays(start, dia); })();

        const start = setDateParts(baseDate, {
          hours: getHours(inicioDate),
          minutes: getMinutes(inicioDate),
          seconds: 0,
          milliseconds: 0,
        });
        const end = setDateParts(baseDate, {
          hours: getHours(fimDate),
          minutes: getMinutes(fimDate),
          seconds: 0,
          milliseconds: 0,
        });

        if (!(isValidDate(start) && isValidDate(end) && end > start)) return;

        const nomesColab = (hor.colaboradores || []).map((id) => {
          const x = (localColaboradores || []).find((c) => String(c.value) === String(id) || String(c._id) === String(id));
          if (x) return x.label ?? x.nome ?? '';
          const y = (colaboradores || []).find((c) => String(c._id) === String(id) || String(c.value) === String(id));
          return y ? (y.label ?? y.nome ?? '') : '';
        }).filter(Boolean);

        const nomesServ = (hor.especialidades || []).map((id) => {
          const s = (servicos || []).find((sv) => String(sv._id) === String(id) || String(sv.value) === String(id));
          return s ? (s.label ?? s.nome ?? '') : '';
        }).filter(Boolean);

        const title = `${nomesServ.join(', ') || 'Serviço'} — ${nomesColab.join(', ') || 'Sem colaborador'}`;

        listaEventos.push({
          resource: { horario: hor, backgroundColor: getColor(index) },
          title,
          start,
          end,
        });
      });
    });

    return listaEventos;
  }, [horarios, servicos, colaboradores, localColaboradores, diasSemanaData]);

  /* Formata objeto Date para "HH:mm" (usado em inputs type="time") */
  const formatTime = (d) => {
    try {
      return format(new Date(d), "HH:mm");
    } catch {
      return String(d || "");
    }
  };

  const openNew = () => {
    setLocalHorario(defaultHorarioShape);
    setDrawerOpen(true);
  };

  /* ---------- Helpers pequenos para validação e envio ---------- */
  const hhmmToMinutes = (hhmm) => {
    if (!hhmm || typeof hhmm !== "string") return null;
    const parts = hhmm.split(":");
    if (parts.length < 2) return null;
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 60 + mm;
  };

  const timeHHmmToISOString = (hhmm) => {
    if (!hhmm || typeof hhmm !== "string") return null;
    const parts = hhmm.split(":");
    if (parts.length < 2) return null;
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  };

  /* =================== SALVAR (criar / atualizar) =================== */
  const save = async () => {
    if (
      !localHorario.dias ||
      localHorario.dias.length === 0 ||
      !localHorario.inicio ||
      !localHorario.fim ||
      !localHorario.especialidades ||
      localHorario.especialidades.length === 0 ||
      !localHorario.colaboradores ||
      localHorario.colaboradores.length === 0
    ) {
      setToast({ type: "error", text: "Preencha todos os campos." });
      return;
    }

    // Validação: fim deve ser posterior ao início
    const startMin = hhmmToMinutes(localHorario.inicio);
    const endMin = hhmmToMinutes(localHorario.fim);
    if (startMin === null || endMin === null) {
      setToast({ type: "error", text: "Formato de horário inválido (use HH:mm)." });
      return;
    }
    if (endMin <= startMin) {
      // Mensagem ao tentar salvar um horário onde o fim não é posterior ao início
      setToast({ type: "error", text: "O horário de fim deve ser posterior ao início." });
      return;
    }

    setToast({ type: "info", text: "Salvando..." });

    const basePayload = {
      ...localHorario,
      inicio: timeHHmmToISOString(localHorario.inicio),
      fim: timeHHmmToISOString(localHorario.fim),
      especialidades: Array.isArray(localHorario.especialidades) ? localHorario.especialidades : [localHorario.especialidades].filter(Boolean),
      colaboradores: Array.isArray(localHorario.colaboradores) ? localHorario.colaboradores : [localHorario.colaboradores].filter(Boolean),
    };

    try {
      if (localHorario && (localHorario._id || localHorario.id)) {
        // atualizar
        const id = localHorario._id || localHorario.id;
        const payloadWithId = { ...basePayload, _id: id };
        dispatch(updateHorario({ horario: payloadWithId }));
        await dispatch(saveHorario());
      } else {
        // criar
        dispatch(updateHorario({ horario: basePayload }));
        await dispatch(addHorario());
      }

      await dispatch(allHorarios());
      setToast({ type: "success", text: "Horário salvo com sucesso!" });
      setDrawerOpen(false);
    } catch (err) {
      console.error("Erro ao salvar horário:", err);
      setToast({ type: "error", text: "Erro ao salvar horário." });
    }
  };

  /* =================== REMOVER =================== */
  const remove = async () => {
    const id = localHorario && (localHorario._id || localHorario.id);
    if (!id) {
      setToast({ type: "error", text: "ID do horário não encontrado." });
      return;
    }
    try {
      await dispatch(removeHorario(id));
      await dispatch(allHorarios());
      setToast({ type: "success", text: "Horário removido!" });
      setConfirmOpen(false);
      setDrawerOpen(false);
    } catch (err) {
      console.error("Erro ao remover:", err);
      setToast({ type: "error", text: "Erro ao remover horário." });
    }
  };

  /* =================== RENDER =================== */
  return (
    <div className="p-5 overflow-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Horários de atendimento</h2>
        <button
          onClick={openNew}
          className="bg-[#CDA327] text-white px-4 py-2 rounded-lg hover:bg-[#b58e22]"
        >
          + Novo Horário
        </button>
      </div>

      {toast && (
        <div
          className={`mb-4 p-3 rounded ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : toast.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <Calendar
          localizer={localizer}
          onSelectEvent={(e) => {
            const hor = e.resource?.horario ?? e.resource;
            setLocalHorario({
              ...hor,
              inicio: formatTime(hor.inicio),
              fim: formatTime(hor.fim),
            });
            setDrawerOpen(true);
          }}
          onSelectSlot={({ start, end }) => {
            const dia = getDay(start);
            setLocalHorario({
              ...defaultHorarioShape,
              dias: [dia],
              inicio: formatTime(start),
              fim: formatTime(end),
            });
            setDrawerOpen(true);
          }}
          selectable
          events={formatEventos}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.backgroundColor,
              border: "none",
              color: "#fff",
            },
          })}
          defaultView="week"
          views={["week"]}
          style={{ height: 600 }}
          toolbar={false} /* mantém os botões ocultos */
          culture="pt-BR"
          messages={{
            week: 'Semana',
            work_week: 'Semana útil',
            day: 'Dia',
            month: 'Mês',
            previous: 'Anterior',
            next: 'Próximo',
            today: 'Hoje',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            allDay: 'Dia inteiro',
            showMore: (total) => `+${total} mais`,
          }}
          formats={{
            dayFormat: (date, culture, localizerFn) =>
              localizerFn.format(date, 'EEE', culture).replace(/^\w/, (c) => c.toUpperCase()),
            weekdayFormat: (date, culture, localizerFn) =>
              localizerFn.format(date, 'EEE', culture).replace(/^\w/, (c) => c.toUpperCase()),
            timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ptBR }),
            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`,
          }}
        />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="ml-auto w-full md:w-2/5 bg-white h-full shadow-xl p-6 overflow-auto z-50">
            <h3 className="text-lg font-semibold mb-4">
              {localHorario && (localHorario._id || localHorario.id) ? "Editar horário" : "Novo horário"}
            </h3>

            {/* Dia */}
            <div className="mb-3">
              <label className="block font-medium mb-1">Dia da semana</label>
              <select
                value={localHorario.dias && localHorario.dias.length > 0 ? String(localHorario.dias[0]) : ""}
                onChange={(e) => setHorarioKey("dias", [parseInt(e.target.value, 10)])}
                className="border rounded w-full p-2"
              >
                <option value="">Selecione</option>
                {["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Início</label>
                <input
                  type="time"
                  value={localHorario.inicio}
                  onChange={(e) => setHorarioKey("inicio", e.target.value)}
                  className="border rounded w-full p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Fim</label>
                <input
                  type="time"
                  value={localHorario.fim}
                  onChange={(e) => setHorarioKey("fim", e.target.value)}
                  className="border rounded w-full p-2"
                />
              </div>
            </div>

            {/* Especialidade */}
            <div className="mt-3">
              <label className="block font-medium mb-1">Especialidade</label>
              <select
                value={localHorario.especialidades && localHorario.especialidades.length > 0 ? String(localHorario.especialidades[0]) : ""}
                onChange={(e) => setHorarioKey("especialidades", e.target.value ? [e.target.value] : [])}
                className="border rounded w-full p-2"
              >
                <option value="">Selecione</option>
                {(servicos || []).map((s) => (
                  <option key={s._id ?? s.value ?? s.id} value={s._id ?? s.value ?? s.id}>
                    {s.label ?? s.nome ?? s.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Colaborador */}
            <div className="mt-3">
              <label className="block font-medium mb-1">Colaborador</label>
              <select
                value={localHorario.colaboradores && localHorario.colaboradores.length > 0 ? String(localHorario.colaboradores[0]) : ""}
                onChange={(e) => setHorarioKey("colaboradores", e.target.value ? [e.target.value] : [])}
                className="border rounded w-full p-2"
                disabled={colabLoading}
              >
                <option value="">{colabLoading ? "Carregando..." : "Selecione"}</option>
                {!colabLoading && localColaboradores.length === 0 && <option value="" disabled>Nenhum colaborador disponível</option>}
                {(localColaboradores || []).map((c) => (
                  <option key={c.value ?? c._id ?? c.id} value={c.value ?? c._id ?? c.id}>
                    {c.label ?? c.nome ?? (c.colaboradorId && c.colaboradorId.nome) ?? String(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                {localHorario && (localHorario._id || localHorario.id) ? "Salvar alterações" : "Criar horário"}
              </button>

              {(localHorario && (localHorario._id || localHorario.id)) && (
                <button onClick={() => setConfirmOpen(true)} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                  Excluir horário
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <p className="font-semibold mb-4">Deseja realmente excluir este horário?</p>
            <div className="flex gap-3">
              <button onClick={remove} className="bg-red-600 text-white px-4 py-2 rounded">Sim</button>
              <button onClick={() => setConfirmOpen(false)} className="border px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosAtendimento;
