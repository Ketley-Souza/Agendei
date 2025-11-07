//agenda
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
  const [filtro, setFiltro] = useState('proximos'); // 'proximos' | 'passados'

  // clienteId / salaoId fixos (ajuste se houver autenticação)
  const clienteId = consts?.clienteId;
  const salaoId = consts?.salaoId;

  console.log('TESTANDO COM clienteId:', clienteId, 'e salaoId:', salaoId);

  useEffect(() => {
    let mounted = true;

    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[DEBUG] api.baseURL ->', api?.defaults?.baseURL);

        // calcula intervalo sem mutar variáveis
        const startDate = format(addMonths(new Date(), -6), 'yyyy-MM-dd');
        const endDate = format(addYears(new Date(), 1), 'yyyy-MM-dd');

        const payload = {
          salaoId,
          clienteId,
          range: {
            start: startDate,
            end: endDate,
          },
        };

        console.log('[DEBUG] POST /agendamento/filter payload ->', payload);

        const resp = await api.post('/agendamento/filter', payload);
        console.log('[DEBUG] /agendamento/filter resposta ->', resp?.status, resp?.data);

        if (!mounted) return;

        if (!resp || !resp.data) {
          setError('Resposta inesperada do servidor.');
          setAgendamentos([]);
          return;
        }

        // normalizar retorno
        let lista = [];
        if (Array.isArray(resp.data.agendamentos)) lista = resp.data.agendamentos;
        else if (Array.isArray(resp.data)) lista = resp.data;
        else if (Array.isArray(resp.data.data)) lista = resp.data.data;
        else if (Array.isArray(resp.data.result)) lista = resp.data.result;
        else if (resp.data.agendamentos && typeof resp.data.agendamentos === 'object') lista = resp.data.agendamentos;
        else lista = Array.isArray(resp.data) ? resp.data : [];

        // DEBUG: inspecionar o objeto retornado
        console.log('[DEBUG] agendamentos retornados (raw):', lista);
        if (lista && lista.length > 0) console.log('[DEBUG] primeiro item (inspecionar campos):', lista[0]);

        // util para detectar se o agendamento pertence ao cliente (tenta várias formas)
        const matchesCliente = (item, clienteIdToCheck) => {
          if (!clienteIdToCheck) return true; // sem cliente configurado => não filtrar
          const cid = String(clienteIdToCheck);

          // possíveis locais onde o id pode estar
          const candidates = [
            item.clienteId,
            item.cliente,
            item.cliente?._id,
            item.clienteId?._id,
            item.clienteId?._id?._id,
            item.clienteId?._id?._id?._id,
          ];

          for (const c of candidates) {
            if (!c) continue;
            try {
              if (String(c) === cid) return true;
              if (c && typeof c === 'object') {
                if (String(c._id ?? c.id) === cid) return true;
              }
            } catch (e) { /* ignore */ }
          }
          return false;
        };

        // normalização extra (nome do serviço, valor)
        lista = (Array.isArray(lista) ? lista : []).map(a => ({
          ...a,
          servicoNome: a.servicoId?.nomeServico || a.servicoNome || a.servico?.nome || 'Serviço Indefinido',
          valor: a.preco || a.servicoId?.preco || a.valor,
        }));

        // filtra de forma tolerante (usa cliente populado como no seu log)
        let listaFiltrada = lista.filter((a) => matchesCliente(a, clienteId));

        // ---------- AQUI: se o filtro por cliente ficou vazio mas a API retornou itens,
        // fazemos fallback para mostrar os agendamentos (útil para testes sem login).
        if (clienteId && listaFiltrada.length === 0 && lista.length > 0) {
          console.warn('[DEBUG] filtro por cliente resultou em vazio; aplicando FALLBACK e mostrando TODOS os agendamentos para teste.');
          console.warn('[DEBUG] cliente esperado:', clienteId, 'exibindo itens do salão para inspeção.');
          listaFiltrada = lista;
        }
        // -------------------------------------------------------------------------

        // adiciona campo _dt para o sorting/parsing posterior
        const listaComDt = listaFiltrada.map(item => {
          const _dt = item.dataHora || item.data || item.inicio || item.createdAt || item.date || null;
          return { ...item, _dt };
        });

        console.log('[DEBUG] lista final que será setada ->', listaComDt);

        setAgendamentos(Array.isArray(listaComDt) ? listaComDt : []);
      } catch (err) {
        console.error('[ERROR] Falha ao buscar agendamentos', err);

        const status = err?.response?.status;
        const respData = err?.response?.data;
        const req = err?.request;

        console.group('[DEBUG] Erro detalhes /agendamento/filter');
        console.log('message:', err.message);
        console.log('status:', status);
        console.log('response.data:', respData);
        console.log('request:', req);
        console.groupEnd();

        let userMessage = 'Falha ao carregar agendamentos.';
        if (status) userMessage += ` (status ${status})`;
        if (respData && typeof respData === 'object' && respData.message) userMessage += ` — ${respData.message}`;

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

  // Substitui o useMemo antigo por este com logs detalhados
  const { proximos, passados } = useMemo(() => {
    console.log('[DEBUG-MEMO] INICIANDO separação Próximos/Passados — agendamentos type:', typeof agendamentos, 'isArray:', Array.isArray(agendamentos), 'length:', (agendamentos || []).length);
    if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
      console.log('[DEBUG-MEMO] agendamentos vazio ou não-array -> retornando vazios');
      return { proximos: [], passados: [] };
    }

    const now = new Date();
    const p = [];
    const pa = [];

    for (let i = 0; i < agendamentos.length; i += 1) {
      const a = agendamentos[i];
      try {
        console.log(`[DEBUG-MEMO] item[${i}] _id/id:`, a._id ?? a.id ?? '(sem id)', 'raw keys:', Object.keys(a || {}).slice(0,40));
      } catch (e) {
        console.log(`[DEBUG-MEMO] item[${i}] erro keys:`, e);
      }

      const dtRaw = a._dt ?? a.dataHora ?? a.data ?? a.inicio ?? a.createdAt ?? a.date ?? null;
      console.log(`[DEBUG-MEMO] item[${i}] dtRaw ->`, dtRaw);

      let dt;
      try {
        if (typeof dtRaw === 'string') {
          // tenta parseISO para strings ISO
          dt = parseISO(dtRaw);
        } else {
          dt = new Date(dtRaw);
        }
      } catch (e) {
        console.warn(`[DEBUG-MEMO] item[${i}] parse erro ->`, e);
        dt = new Date(dtRaw);
      }

      const valid = isValid(dt);
      const status = String(a.status || '').toLowerCase();
      const isConcluidoOuCancelado = status.includes('concluid') || status.includes('cancelad') || status === 'c' || status === 'finalizado' || status === 'f';

      console.log(`[DEBUG-MEMO] item[${i}] parsed dt=`, dt, 'isValid=', valid, 'status=', status, 'concluido?', isConcluidoOuCancelado);

      if (!valid) {
        // fallback (para debug mostra como próximo)
        console.warn(`[DEBUG-MEMO] item[${i}] data inválida — armazenando em PRÓXIMOS apenas para debug`);
        p.push({ ...a, _dt: dt });
        continue;
      }

      if (isAfter(dt, now) && !isConcluidoOuCancelado) {
        p.push({ ...a, _dt: dt });
        console.log(`[DEBUG-MEMO] item[${i}] classificado -> PRÓXIMO`);
      } else {
        pa.push({ ...a, _dt: dt });
        console.log(`[DEBUG-MEMO] item[${i}] classificado -> PASSADO`);
      }
    }

    console.log('[DEBUG-MEMO] Antes ordenar -> Próximos:', p.length, 'Passados:', pa.length);

    p.sort((x, y) => x._dt - y._dt);
    pa.sort((x, y) => y._dt - x._dt);

    console.log('[DEBUG-MEMO] Depois ordenar -> Próximos:', p.length, 'Passados:', pa.length);
    if (p.length > 0) console.log('[DEBUG-MEMO] primeiro PRÓXIMO ->', p[0]);
    if (pa.length > 0) console.log('[DEBUG-MEMO] primeiro PASSADO ->', pa[0]);

    return { proximos: p, passados: pa };
  }, [agendamentos]);

  const listToShow = filtro === 'proximos' ? proximos : passados;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minha Agenda</h1>
          <p className="text-sm text-gray-600">Consulte os seus agendamentos</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFiltro('proximos')} className={`px-4 py-2 rounded ${filtro === 'proximos' ? 'bg-[#CDA327] text-white' : 'border border-gray-300 bg-white text-gray-800'}`}>Próximos</button>
        <button onClick={() => setFiltro('passados')} className={`px-4 py-2 rounded ${filtro === 'passados' ? 'bg-[#CDA327] text-white' : 'border border-gray-300 bg-white text-gray-800'}`}>Passados</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading && <p>Carregando agendamentos…</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && listToShow.length === 0 && (
          <div className="py-12 text-center text-gray-500">Nenhum agendamento encontrado.</div>
        )}

        {!loading && !error && listToShow.length > 0 && (
          <div className="grid gap-4">
            {listToShow.map((a) => (
              <div key={a._id || a.id || (a._dt && a._dt.getTime())} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-sm">
                <div>
                  <div className="font-semibold">{a.servicoNome || a.servico?.nome || a.servico || 'Serviço'}</div>
                  <div className="text-sm text-gray-600">{formatDateTime(a._dt || a.dataHora || a.data || a.inicio)}</div>
                </div>

                <div className="mt-3 md:mt-0 md:text-right">
                  <div className="font-medium">{typeof a.valor === 'number' ? `R$ ${a.valor.toFixed(2).replace('.', ',')}` : (a.valor || '—')}</div>
                  <div className="text-sm mt-1">
                    <span className={`px-2 py-1 rounded ${a.status && (a.status.toLowerCase().includes('concluid') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}`}>{a.status || 'Pendente'}</span>
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
