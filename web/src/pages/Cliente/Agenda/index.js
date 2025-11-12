import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import consts from '../../../consts';
import { format, parseISO, isAfter, addMonths, addYears, isValid } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const formatDateTime = (isoOrDate) => {
  try {
    const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : new Date(isoOrDate);
    return format(d, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  } catch {
    return String(isoOrDate || '');
  }
};

export default function AgendaCliente() {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('proximos');

  const clienteId = consts?.clienteId;
  const salaoId = consts?.salaoId;

  useEffect(() => {
    let mounted = true;

    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);

      try {
        const startDate = format(addMonths(new Date(), -6), 'yyyy-MM-dd');
        const endDate = format(addYears(new Date(), 1), 'yyyy-MM-dd');
        const payload = { salaoId, clienteId, range: { start: startDate, end: endDate } };
        const resp = await api.post('/agendamento/filter', payload);

        if (!mounted) return;

        let lista = [];
        if (Array.isArray(resp.data.agendamentos)) lista = resp.data.agendamentos;
        else if (Array.isArray(resp.data)) lista = resp.data;
        else if (Array.isArray(resp.data.data)) lista = resp.data.data;
        else if (Array.isArray(resp.data.result)) lista = resp.data.result;
        else if (resp.data.agendamentos && typeof resp.data.agendamentos === 'object') lista = resp.data.agendamentos;
        else lista = Array.isArray(resp.data) ? resp.data : [];

        const matchesCliente = (item, clienteIdToCheck) => {
          if (!clienteIdToCheck) return true;
          const cid = String(clienteIdToCheck);
          const candidates = [item.clienteId, item.cliente, item.cliente?._id, item.clienteId?._id];
          return candidates.some(c => c && (String(c) === cid || String(c._id ?? c.id) === cid));
        };

        lista = lista.map(a => ({
          ...a,
          servicoNome: a.servicoId?.nomeServico || a.servicoNome || a.servico?.nome || 'Serviço Indefinido',
          valor: a.preco || a.servicoId?.preco || a.valor,
        }));

        let listaFiltrada = lista.filter(a => matchesCliente(a, clienteId));
        if (clienteId && listaFiltrada.length === 0 && lista.length > 0) listaFiltrada = lista;

        const listaComDt = listaFiltrada.map(item => ({
          ...item,
          _dt: item.dataHora || item.data || item.inicio || item.createdAt || item.date || null
        }));

        setAgendamentos(listaComDt);
      } catch (err) {
        let userMessage = 'Falha ao carregar agendamentos.';
        if (err?.response?.status) userMessage += ` (status ${err.response.status})`;
        if (err?.response?.data?.message) userMessage += ` — ${err.response.data.message}`;
        if (mounted) {
          setError(userMessage);
          setAgendamentos([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAgendamentos();
    return () => { mounted = false; };
  }, [clienteId, salaoId]);

  const { proximos, passados } = useMemo(() => {
    if (!Array.isArray(agendamentos) || agendamentos.length === 0) return { proximos: [], passados: [] };
    const now = new Date();
    const p = [], pa = [];

    agendamentos.forEach(a => {
      let dt = a._dt ? (typeof a._dt === 'string' ? parseISO(a._dt) : new Date(a._dt)) : new Date();
      if (!isValid(dt)) { p.push({ ...a, _dt: dt }); return; }

      const status = String(a.status || '').toLowerCase();
      const isConcluidoOuCancelado = status.includes('concluid') || status.includes('cancelad') || status === 'c' || status === 'finalizado' || status === 'f';
      if (isAfter(dt, now) && !isConcluidoOuCancelado) p.push({ ...a, _dt: dt });
      else pa.push({ ...a, _dt: dt });
    });

    p.sort((x, y) => x._dt - y._dt);
    pa.sort((x, y) => y._dt - x._dt);

    return { proximos: p, passados: pa };
  }, [agendamentos]);

  const listToShow = filtro === 'proximos' ? proximos : passados;

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-3xl mx-auto font-catamaran">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Minha Agenda</h1>
          <p className="text-sm text-gray-600">Consulte os seus agendamentos</p>
        </div>

        {/* Tabs modernos */}
        <div className="flex w-full bg-[#ABAFB1]/10 p-1.5 rounded-lg mb-6">
          {['proximos', 'passados'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFiltro(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${filtro === tab
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#6E6E6E] hover:text-gray-700'
                }`}
            >
              {tab === 'proximos' ? 'Próximos' : 'Passados'}
            </button>
          ))}
        </div>


        {/* Lista de agendamentos */}
        {loading && <p>Carregando agendamentos…</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && listToShow.length === 0 && (
          <div className="py-12 text-center text-gray-500">Nenhum agendamento encontrado.</div>
        )}

        {!loading && !error && listToShow.length > 0 && (
          <div className="grid gap-4">
            {listToShow.map((a) => (
              <div
                key={a._id || a.id || (a._dt && a._dt.getTime())}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-sm"
              >
                <div>
                  <div className="font-semibold text-gray-900">{a.servicoNome}</div>
                  <div className="text-sm text-gray-600">{formatDateTime(a._dt)}</div>
                </div>
                <div className="mt-3 md:mt-0 md:text-right">
                  <div className="font-medium text-gray-800">
                    {typeof a.valor === 'number'
                      ? `R$ ${a.valor.toFixed(2).replace('.', ',')}`
                      : a.valor || '—'}
                  </div>
                  <div className="text-sm mt-1">
                    <span
                      className={`px-2 py-1 rounded ${a.status &&
                        (a.status.toLowerCase().includes('concluid')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800')
                        }`}
                    >
                      {a.status || 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
