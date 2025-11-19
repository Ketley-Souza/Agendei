import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import consts from '../../../consts';

import { Modal } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';

import { format, parseISO, isValid, isAfter, addMonths, addYears } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


// --------------------------
// FORMATA DATA (SEM CONVERSÕES EXTRAS)
// --------------------------
const formatDateTime = (value) => {
  if (!value) return '-';

  try {
    const dt = typeof value === 'string' ? parseISO(value) : new Date(value);
    return isValid(dt)
      ? format(dt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
      : '-';
  } catch {
    return '-';
  }
};


export default function AgendaCliente() {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState(null);

  const [filtro, setFiltro] = useState('proximos');

  const [modalCancel, setModalCancel] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const clienteId = usuario?.id;
  const salaoId = consts?.salaoId;


  // -------------------------------------------
  // BUSCA AGENDAMENTOS
  // -------------------------------------------
  useEffect(() => {
    let mounted = true;

    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);

      try {
        const start = format(addMonths(new Date(), -6), 'yyyy-MM-dd');
        const end = format(addYears(new Date(), 1), 'yyyy-MM-dd');

        const resp = await api.post('/agendamento/filter', {
          salaoId,
          clienteId,
          range: { start, end },
        });

        if (!mounted) return;

        const dados = resp?.data?.agendamentos ?? [];

        // organização simples e direta
        const lista = dados.map(a => ({
          ...a,
          dataFinal: a.data, // padroniza campo
          servicoNome: a.servicoId?.nomeServico ?? 'Serviço',
          valor: a.preco ?? 0,
        }));

        setAgendamentos(lista);
      } catch (err) {
        if (mounted) setError('Falha ao carregar agendamentos.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAgendamentos();

    return () => { mounted = false; };
  }, [clienteId, salaoId]);


  // -----------------------------------------------------
  // SEPARAÇÃO: PRÓXIMOS | PASSADOS + STATUS AUTOMÁTICO
  // -----------------------------------------------------
  const { proximos, passados } = useMemo(() => {
    const now = new Date();
    const pro = [];
    const pas = [];

    agendamentos.forEach(a => {
      const dt = a.dataFinal ? new Date(a.dataFinal) : null;

      const cancelado = String(a.status).toUpperCase() === 'I';
      const futuro = dt && isAfter(dt, now);

      const statusFinal = cancelado
        ? 'Cancelado'
        : futuro
          ? 'Ativo'
          : 'Concluído';

      const item = { ...a, _dt: dt, statusFinal };

      futuro ? pro.push(item) : pas.push(item);
    });

    // ordenação
    pro.sort((a, b) => a._dt - b._dt);
    pas.sort((a, b) => b._dt - a._dt);

    return { proximos: pro, passados: pas };
  }, [agendamentos]);


  const lista = filtro === 'proximos' ? proximos : passados;


  // -----------------------------------------------------
  // CANCELAR AGENDAMENTO (BACKEND)
  // -----------------------------------------------------
  const confirmarCancelamento = async () => {
    if (!agendamentoSelecionado) return;

    try {
      // estado de loading no botão
      setAgendamentoSelecionado(prev => ({ ...prev, _loading: true }));

      await api.put(`/agendamento/cancelar/${agendamentoSelecionado._id}`);

      // atualização imediata no frontend
      setAgendamentos(prev =>
        prev.map(a =>
          a._id === agendamentoSelecionado._id
            ? { ...a, status: 'I' }
            : a
        )
      );
    } catch {
      alert('Erro ao cancelar agendamento.');
    }

    setModalCancel(false);
    setAgendamentoSelecionado(null);
  };


  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-3xl mx-auto font-catamaran">

        <h1 className="text-2xl font-bold text-center mb-1">Minha Agenda</h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Consulte e gerencie seus agendamentos
        </p>

        {/* ----------------------------------------- */}
        {/* TABS */}
        {/* ----------------------------------------- */}
        <div className="flex w-full bg-[#ABAFB1]/10 p-1.5 rounded-lg mb-6">
          {['proximos', 'passados'].map(tab => (
            <button
              key={tab}
              onClick={() => setFiltro(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${filtro === tab ? 'bg-white text-black shadow-sm' : 'text-[#6E6E6E]'}`}
            >
              {tab === 'proximos' ? 'Próximos' : 'Passados'}
            </button>
          ))}
        </div>

        {/* ----------------------------------------- */}
        {/* LISTA */}
        {/* ----------------------------------------- */}
        {loading && <p>Carregando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && lista.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Nenhum agendamento encontrado.
          </div>
        )}

        {!loading && !error && lista.length > 0 && (
          <div className="grid gap-4">
            {lista.map(a => (
              <div
                key={a._id}
                className="p-4 bg-white border rounded-xl shadow-sm flex flex-col md:flex-row md:justify-between md:items-center"
              >
                <div>
                  <div className="font-semibold text-gray-900">{a.servicoNome}</div>
                  <div className="text-sm text-gray-600">{formatDateTime(a._dt)}</div>
                </div>

                <div className="mt-3 md:mt-0 md:text-right">
                  <div className="font-medium text-gray-800">
                    R$ {Number(a.valor).toFixed(2).replace('.', ',')}
                  </div>

                  <div className="mt-2">
                    {/* STATUS */}
                    <span
                      className={`px-2 py-1 rounded text-sm
                        ${a.statusFinal === 'Cancelado' ? 'bg-red-100 text-red-700'
                          : a.statusFinal === 'Concluído' ? 'bg-gray-200 text-gray-800'
                            : 'bg-green-100 text-green-700'}`}
                    >
                      {a.statusFinal}
                    </span>
                  </div>

                  {/* BOTÃO CANCELAR: aparece só em PRÓXIMOS e apenas se estiver ATIVO */}
                  {filtro === 'proximos' && a.statusFinal === 'Ativo' && (
                    <button
                      onClick={() => { setAgendamentoSelecionado(a); setModalCancel(true); }}
                      className="mt-3 bg-red-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-red-700 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* ------------------------------------------------ */}
      {/* MODAL CANCELAMENTO */}
      {/* ------------------------------------------------ */}
      <Modal open={modalCancel} onClose={() => setModalCancel(false)} size="xs">
        <Modal.Header>
          <Modal.Title>Cancelar agendamento</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Tem certeza que deseja cancelar este agendamento?
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <button
            onClick={confirmarCancelamento}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sim, cancelar
          </button>

          <button
            onClick={() => setModalCancel(false)}
            className="bg-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Voltar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
