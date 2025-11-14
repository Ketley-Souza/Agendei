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

/* ---------- Cores para eventos (simples paleta interna) ---------- */
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

/* ---------- Forma padrão de um horário (ao criar) ---------- */
const defaultHorarioShape = {
  dias: [],
  inicio: "09:00",
  fim: "17:00",
  especialidades: [],
  colaboradores: [],
};

/* =================== Componente principal =================== */
/* Este componente:
   - Carrega horários/serviços via thunks (redux)
   - Exibe calendário (react-big-calendar)
   - Abre drawer para criar/editar horários
   - Permite selecionar múltiplos serviços e colaboradores via UI clicável
   - Valida horário (fim > início) antes de enviar
*/
const HorariosAtendimento = () => {
  const dispatch = useDispatch();
  const { horarios = [], servicos = [], colaboradores = [] } =
    useSelector((s) => s.horario || {});

  /* UI local state */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localHorario, setLocalHorario] = useState(defaultHorarioShape);
  const [toast, setToast] = useState(null);

  /* Colaboradores filtrados conforme especialidades selecionadas */
  const [localColaboradores, setLocalColaboradores] = useState([]);
  const [colabLoading, setColabLoading] = useState(false);

  /* Inputs de busca para melhorar escolha (UI) */
  const [serviceQuery, setServiceQuery] = useState("");
  const [colabQuery, setColabQuery] = useState("");

  /* Carrega horários e serviços ao montar a página */
  useEffect(() => {
    dispatch(allHorarios());
    dispatch(allServicos());
  }, [dispatch]);

  /* Busca colaboradores quando as especialidades mudam.
     Primeiro tenta o thunk; se vazio/falha, faz fallback com fetch direto.
     Normaliza a resposta para um formato consistente {value,label,_id,nome}.
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
      .catch(async () => {
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
        } catch {
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

  /* Atualiza uma chave do localHorario (utilitário simples) */
  const setHorarioKey = (key, value) =>
    setLocalHorario((h) => ({ ...h, [key]: value }));

  /* Datas da semana para posicionar eventos (semana atual) */
  const startOfWeekDate = startOfWeekFn(new Date(), { weekStartsOn: 0 });
  const diasSemanaData = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeekDate, i)
  );

  /*
    Monta eventos para o calendário a partir do array `horarios`.
    Aceita tempos em "HH:mm" ou ISO; converte para Date usando a data base
    do dia da semana correspondente.
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

  /* Formata Date para "HH:mm" (usado nos inputs type="time") */
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
    setServiceQuery("");
    setColabQuery("");
  };

  /* ---------- Helpers pequenos para validação/normalização ---------- */
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

  /* Toggle para adicionar/remover seleção (serviços/colaboradores) */
  const toggleSelection = (key, id) => {
    setLocalHorario((h) => {
      const arr = Array.isArray(h[key]) ? [...h[key]] : (h[key] ? [h[key]] : []);
      const exists = arr.find((v) => String(v) === String(id));
      if (exists) return { ...h, [key]: arr.filter((v) => String(v) !== String(id)) };
      arr.push(id);
      return { ...h, [key]: arr };
    });
  };

  const removeSelected = (key, idToRemove) => {
    setLocalHorario((h) => {
      const arr = Array.isArray(h[key]) ? [...h[key]] : (h[key] ? [h[key]] : []);
      return { ...h, [key]: arr.filter((v) => String(v) !== String(idToRemove)) };
    });
  };

  /* Rotinas para mostrar label de id (UI) */
  const getServiceLabel = (id) => {
    const s = (servicos || []).find((x) => String(x._id ?? x.value ?? x.id) === String(id));
    return s ? (s.label ?? s.nome ?? s.titulo ?? String(id)) : String(id);
  };
  const getColabLabel = (id) => {
    const c = (localColaboradores || []).find((x) => String(x.value ?? x._id ?? x.id) === String(id))
      || (colaboradores || []).find((x) => String(x._id ?? x.value ?? x.id) === String(id));
    return c ? (c.label ?? c.nome ?? String(id)) : String(id);
  };

  /* =================== SALVAR (criar / atualizar) ===================
     - Valida que todos os campos estejam preenchidos
     - Valida que fim > início (mensagem única: "O horário de fim deve ser posterior ao início.")
     - Converte horas HH:mm para ISO antes de enviar
  */
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

    const startMin = hhmmToMinutes(localHorario.inicio);
    const endMin = hhmmToMinutes(localHorario.fim);
    if (startMin === null || endMin === null) {
      setToast({ type: "error", text: "Formato de horário inválido (use HH:mm)." });
      return;
    }
    if (endMin <= startMin) {
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
        const id = localHorario._id || localHorario.id;
        const payloadWithId = { ...basePayload, _id: id };
        dispatch(updateHorario({ horario: payloadWithId }));
        await dispatch(saveHorario());
      } else {
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

  /* Filtragens simples para a UI de busca (serviços e colaboradores) */
  const filteredServices = (servicos || []).filter((s) => {
    if (!serviceQuery) return true;
    const label = (s.label ?? s.nome ?? s.titulo ?? "").toLowerCase();
    return label.includes(serviceQuery.trim().toLowerCase());
  });
  const filteredColabs = (localColaboradores || []).filter((c) => {
    if (!colabQuery) return true;
    const label = (c.label ?? c.nome ?? "").toLowerCase();
    return label.includes(colabQuery.trim().toLowerCase());
  });

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

      <div className="bg-white rounded shadow p-4 mb-6">
        <Calendar
          localizer={localizer}
          onSelectEvent={(e) => {
            const hor = e.resource?.horario ?? e.resource;
            setLocalHorario({
              ...hor,
              inicio: formatTime(hor.inicio),
              fim: formatTime(hor.fim),
              especialidades: Array.isArray(hor.especialidades) ? hor.especialidades : hor.especialidades ? [hor.especialidades] : [],
              colaboradores: Array.isArray(hor.colaboradores) ? hor.colaboradores : hor.colaboradores ? [hor.colaboradores] : [],
            });
            setDrawerOpen(true);
            setServiceQuery("");
            setColabQuery("");
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
            setServiceQuery("");
            setColabQuery("");
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
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setDrawerOpen(false)} />
          <div className="ml-auto w-full md:w-2/5 bg-white h-full shadow-xl p-6 overflow-auto z-50">
            <h3 className="text-lg font-semibold mb-4">
              {localHorario && (localHorario._id || localHorario.id) ? "Editar horário" : "Novo horário"}
            </h3>

            {/* Dia da semana */}
            <div className="mb-3">
              <label className="block font-medium mb-1">Dia da semana</label>
              <select value={localHorario.dias && localHorario.dias.length > 0 ? String(localHorario.dias[0]) : ""} onChange={(e) => setHorarioKey("dias", [parseInt(e.target.value, 10)])} className="border rounded w-full p-2">
                <option value="">Selecione</option>
                {["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map((d, i) => (<option key={i} value={i}>{d}</option>))}
              </select>
            </div>

            {/* Início / Fim */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Início</label>
                <input type="time" value={localHorario.inicio} onChange={(e) => setHorarioKey("inicio", e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Fim</label>
                <input type="time" value={localHorario.fim} onChange={(e) => setHorarioKey("fim", e.target.value)} className="border rounded w-full p-2" />
              </div>
            </div>

            {/* Especialidades - busca e botões clicáveis (multi-select) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-medium">Especialidades</label>
                <div className="text-sm text-gray-500">{(Array.isArray(localHorario.especialidades) ? localHorario.especialidades.length : 0)} selecionado(s)</div>
              </div>

              <input
                placeholder="Buscar especialidade..."
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />

              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-auto border rounded p-2">
                {filteredServices.length === 0 ? (
                  <div className="text-sm text-gray-500 col-span-2">Nenhuma especialidade encontrada</div>
                ) : (
                  filteredServices.map((s) => {
                    const id = s._id ?? s.value ?? s.id;
                    const selected = Array.isArray(localHorario.especialidades) && localHorario.especialidades.find((v) => String(v) === String(id));
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleSelection("especialidades", id)}
                        className={`text-left px-3 py-2 rounded border transition-colors duration-150 ${selected ? "bg-[#CDA327] text-white border-transparent shadow" : "bg-white text-gray-800 hover:bg-gray-50"}`}
                        aria-pressed={!!selected}
                      >
                        {s.label ?? s.nome ?? s.titulo}
                      </button>
                    );
                  })
                )}
              </div>

              {/* chips das especialidades selecionadas */}
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(localHorario.especialidades) ? localHorario.especialidades : []).map((id) => (
                  <span key={id} className="inline-flex items-center bg-gray-100 border rounded-full px-3 py-1 text-sm">
                    <span className="mr-2">{getServiceLabel(id)}</span>
                    <button onClick={() => removeSelected("especialidades", id)} className="text-gray-600 hover:text-gray-900" type="button">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colaboradores - busca e botões clicáveis (multi-select) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-medium">Colaboradores</label>
                <div className="text-sm text-gray-500">{(Array.isArray(localHorario.colaboradores) ? localHorario.colaboradores.length : 0)} selecionado(s)</div>
              </div>

              <input
                placeholder="Buscar colaborador..."
                value={colabQuery}
                onChange={(e) => setColabQuery(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
                disabled={colabLoading || (localHorario.especialidades || []).length === 0}
              />

              <div className="max-h-44 overflow-auto border rounded p-2">
                {colabLoading ? (
                  <div className="p-2 text-sm text-gray-500">Carregando...</div>
                ) : (filteredColabs.length === 0) ? (
                  <div className="p-2 text-sm text-gray-500">Nenhum colaborador disponível</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredColabs.map((c) => {
                      const id = c.value ?? c._id ?? c.id;
                      const selected = Array.isArray(localHorario.colaboradores) && localHorario.colaboradores.find((v) => String(v) === String(id));
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleSelection("colaboradores", id)}
                          className={`text-left px-3 py-2 rounded border transition-colors duration-150 ${selected ? "bg-[#CDA327] text-white border-transparent shadow" : "bg-white text-gray-800 hover:bg-gray-50"}`}
                          aria-pressed={!!selected}
                        >
                          {c.label ?? c.nome ?? String(id)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* chips dos colaboradores selecionados */}
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(localHorario.colaboradores) ? localHorario.colaboradores : []).map((id) => (
                  <span key={id} className="inline-flex items-center bg-gray-100 border rounded-full px-3 py-1 text-sm">
                    <span className="mr-2">{getColabLabel(id)}</span>
                    <button onClick={() => removeSelected("colaboradores", id)} className="text-gray-600 hover:text-gray-900" type="button">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                {localHorario && (localHorario._id || localHorario.id) ? "Salvar alterações" : "Criar horário"}
              </button>

              {(localHorario && (localHorario._id || localHorario.id)) && (
                <button onClick={() => setConfirmOpen(true)} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Excluir horário</button>
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
