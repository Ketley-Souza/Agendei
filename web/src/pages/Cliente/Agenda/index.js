import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import consts from '../../../consts';
import { User, Clock, Warning, CheckCircle, XCircle, Circle, CalendarBlank } from '@phosphor-icons/react';
import { Modal } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';

import { format, parseISO, isValid, isAfter, addMonths, addYears } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


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


  const StatusBadge = ({ status }) => {
    const config = {
      Cancelado: { bg: 'bg-rose-50', text: 'text-rose-800', icon: <XCircle size={14} weight="fill" /> },
      Concluído: { bg: 'bg-slate-50', text: 'text-slate-800', icon: <CheckCircle size={14} weight="fill" /> },
      Ativo: { bg: 'bg-emerald-50', text: 'text-emerald-800', icon: <Circle size={14} weight="fill" /> },
    };
    const style = config[status] || config.Ativo;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.icon}
        {status}
      </span>
    );
  };


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
        const lista = dados.map(a => {
          const adicionais = a.servicosAdicionais || [];
          const valorPrincipal = a.servicoId?.preco ?? 0;
          const valorAdicionais = adicionais.reduce((sum, s) => sum + (s.preco || 0), 0);
          const valorTotal = valorPrincipal + valorAdicionais;
          
          return {
            ...a,
            dataFinal: a.data,
            servicoNome: a.servicoId?.nomeServico ?? 'Serviço',
            servicosAdicionaisNomes: adicionais.map(s => s.nomeServico),
            valor: valorTotal,
          };
        });

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

    pro.sort((a, b) => a._dt - b._dt);
    pas.sort((a, b) => b._dt - a._dt);

    return { proximos: pro, passados: pas };
  }, [agendamentos]);


  const lista = filtro === 'proximos' ? proximos : passados;


  const confirmarCancelamento = async () => {
    if (!agendamentoSelecionado) return;

    try {
      await api.put(`/agendamento/cancelar/${agendamentoSelecionado._id}`);
      setAgendamentos(prev => prev.map(a => a._id === agendamentoSelecionado._id ? { ...a, status: 'I' } : a));
    } catch {
      alert('Erro ao cancelar agendamento.');
    }

    setModalCancel(false);
    setAgendamentoSelecionado(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        
        <header className="mb-8 sm:mb-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Minha Agenda
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">
                {lista.length} {filtro === 'proximos' ? 'próximo(s)' : 'passado(s)'}
              </span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto sm:mx-0">
            Gerencie seus agendamentos de forma simples e rápida
          </p>
        </header>

        <div className="mb-8">
          <div className="flex w-full bg-gray-200/70 p-1.5 rounded-xl gap-1.5">
            {[
              { key: 'proximos', label: 'Próximos' },
              { key: 'passados', label: 'Passados' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFiltro(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${filtro === tab.key ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#CDA327] rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Carregando agendamentos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && lista.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              {filtro === 'proximos' ? (
                <CalendarBlank size={40} weight="duotone" className="text-gray-400" />
              ) : (
                <CheckCircle size={40} weight="duotone" className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filtro === 'proximos' ? 'Nenhum agendamento próximo' : 'Histórico vazio'}
            </h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              {filtro === 'proximos' 
                ? 'Quando você agendar um serviço, ele aparecerá aqui.' 
                : 'Seus agendamentos passados aparecerão aqui.'}
            </p>
          </div>
        )}

        {!loading && !error && lista.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {lista.map((a, index) => (
              <article
                key={a._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
              >
                <div className="px-8 py-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    
                    <div className="flex-1 min-w-0">
                      <div className="sm:hidden mb-3">
                        <StatusBadge status={a.statusFinal} />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {a.servicoId?.nomeServico ?? 'Serviço'}
                      </h3>
                      
                      {a.servicosAdicionaisNomes?.length > 0 && (
                        <p className="text-xs text-gray-500 mb-2">
                          + {a.servicosAdicionaisNomes.join(', ')}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock size={16} weight="bold" className="text-gray-500" />
                        <time>{formatDateTime(a._dt)}</time>
                      </div>

                      {a.colaboradorId?.nome && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={16} weight="bold" className="text-gray-400" />
                          <span>com {a.colaboradorId.nome}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4">
                      
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Total</p>
                        <p className="text-xl font-bold text-gray-900">
                          R$ {Number(a.valor).toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <StatusBadge status={a.statusFinal} />
                      </div>
                    </div>
                  </div>

                  {filtro === 'proximos' && a.statusFinal === 'Ativo' && (
                    <div className="pt-4 flex justify-start">
                      <button
                        onClick={() => {
                          setAgendamentoSelecionado(a);
                          setModalCancel(true);
                        }}
                        className="w-full sm:w-auto sm:max-w-[48%] px-4 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
                      >
                        Cancelar agendamento
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className={`h-1 w-full ${
                    a.statusFinal === 'Cancelado' ? 'bg-red-700/20' :
                    a.statusFinal === 'Concluído' ? 'bg-slate-400' :
                    'bg-emerald-700/20'
                  }`}
                />
              </article>
            ))}
          </div>
        )}
      </div>


      <Modal 
        open={modalCancel} 
        onClose={() => setModalCancel(false)} 
        size="xs"
        className="font-catamaran"
      >
        <Modal.Header className="border-b border-gray-200 pb-4">
          <Modal.Title className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Confirmar cancelamento
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja cancelar este agendamento?
            </p>
            
            {agendamentoSelecionado && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium text-gray-900">
                    {agendamentoSelecionado.servicoNome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(agendamentoSelecionado._dt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-gray-900">
                    R$ {Number(agendamentoSelecionado.valor).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Warning size={18} weight="bold" />
              <span>Esta ação não pode ser desfeita.</span>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => setModalCancel(false)}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Manter agendamento
          </button>

          <button
            onClick={confirmarCancelamento}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
          >
            Sim, cancelar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
