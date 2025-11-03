import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterAgendamentos } from "../store/slices/agendamentoSlice";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Modal, Button, Message } from "rsuite";
import util from "../services/util";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const Agendamentos = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { agendamentos } = useSelector((state) => state.agendamento);

    const [view, setView] = useState("month");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({
        clienteId: "",
        salaoId: "",
        servicoId: "",
        servicosAdicionais: [], // Array opcional de serviços adicionais
        colaboradorId: "",
    });

    // Formata os eventos
    const formatEventos = () =>
        agendamentos.map((agendamento) => {
            const inicio = new Date(agendamento.data);
            
            // Calcular duração total (serviço principal + adicionais)
            let duracaoTotal = util.duracaoParaMinutos(agendamento.servicoId?.duracao || 0);
            
            // Somar duração dos serviços adicionais
            if (agendamento.servicosAdicionais && Array.isArray(agendamento.servicosAdicionais)) {
                agendamento.servicosAdicionais.forEach(servico => {
                    duracaoTotal += util.duracaoParaMinutos(servico?.duracao || 0);
                });
            }
            
            const fim = addMinutes(inicio, duracaoTotal);

            // Concatenar nomes dos serviços
            const nomeServicoPrincipal = agendamento.servicoId?.nomeServico || 'Serviço?';
            const nomesAdicionais = agendamento.servicosAdicionais && Array.isArray(agendamento.servicosAdicionais)
                ? agendamento.servicosAdicionais.map(s => s?.nomeServico).filter(Boolean)
                : [];
            
            const todosServicos = [nomeServicoPrincipal, ...nomesAdicionais].join(', ');

            return {
                resource: { agendamento },
                title: `${todosServicos} - ${agendamento.clienteId?.nome || 'Cliente?'} - ${agendamento.colaboradorId?.nome || 'Colaborador?'}`,
                start: inicio,
                end: fim,
            };
        });

    // Carrega agendamentos
    useEffect(() => {
        const today = new Date();
        const start = format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");
        const end = format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), "yyyy-MM-dd");
        dispatch(filterAgendamentos({ start, end }));
    }, [dispatch]);

    const formatRange = (range) => {
        if (Array.isArray(range)) {
            return { start: format(range[0], "yyyy-MM-dd"), end: format(range[range.length - 1], "yyyy-MM-dd") };
        }
        return { start: format(range.start, "yyyy-MM-dd"), end: format(range.end, "yyyy-MM-dd") };
    };

    const renderEvento = ({ event }) => <span>{event.title}</span>;

    const CustomToolbar = ({ label, onNavigate, onView, view }) => (
        <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200 rounded-t-lg shadow-sm">
            <div className="flex items-center space-x-2">
                <button onClick={() => onNavigate("PREV")} className="p-2 rounded-full hover:bg-gray-100 bg-gray-200 transition">
                    <CaretLeftIcon size={22} weight="bold" className="text-gray-700" />
                </button>
                <button onClick={() => onNavigate("NEXT")} className="p-2 rounded-full hover:bg-gray-100 bg-gray-200 transition">
                    <CaretRightIcon size={22} weight="bold" className="text-gray-700" />
                </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 text-center select-none">{label}</h2>

            <div className="flex space-x-2">
                {["month", "week", "day", "agenda"].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onView(mode)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${view === mode ? "bg-yellow-600/70 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {mode === "month" ? "Mês" : mode === "week" ? "Semana" : mode === "day" ? "Dia" : "Agenda"}
                    </button>
                ))}
            </div>
        </div>
    );

    // Abrir modal ao selecionar intervalo
    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo);
        setModalOpen(true);
    };

    // Submeter agendamento
    const handleSubmit = async () => {
        try {
            const payload = { ...formData, data: selectedSlot.start };
            const response = await axios.post("/api/agendamentos", payload);
            if (!response.data.error) {
                Message.success("Agendamento criado com sucesso!");
                setModalOpen(false);
                dispatch(filterAgendamentos(formatRange([selectedSlot.start, selectedSlot.end])));
            } else {
                Message.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            Message.error("Erro ao criar agendamento");
        }
    };

    return (
        <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[1.4rem] font-semibold text-[#2c2c2c]">Agendamentos</h2>
            </div>

            <div className="overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={formatEventos()}
                    view={view}
                    onView={(newView) => setView(newView)}
                    onRangeChange={(range) => dispatch(filterAgendamentos(formatRange(range)))}
                    components={{ toolbar: CustomToolbar, event: renderEvento }}
                    popup
                    selectable
                    onSelectSlot={handleSelectSlot}
                    style={{ minHeight: "600px", height: "calc(100vh - 220px)" }}
                    messages={{
                        allDay: "Dia inteiro",
                        date: "Data",
                        time: "Hora",
                        event: "Evento",
                        showMore: (total) => `+${total} mais`,
                    }}
                    formats={{
                        dayFormat: (date, culture, localizer) => localizer.format(date, "EEE dd/MM", culture),
                        timeGutterFormat: "HH:mm",
                    }}
                    culture="pt-BR"
                />
            </div>

            {/* Modal RSuite */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="sm" backdrop="static">
                <Modal.Header>
                    <Modal.Title>Novo Agendamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label className="block mb-2">
                        Cliente:
                        <input type="text" value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })} className="border p-2 w-full rounded mb-2" />
                    </label>
                    <label className="block mb-2">
                        Salão:
                        <input type="text" value={formData.salaoId} onChange={(e) => setFormData({ ...formData, salaoId: e.target.value })} className="border p-2 w-full rounded mb-2" />
                    </label>
                    <label className="block mb-2">
                        Serviço Principal:
                        <input type="text" value={formData.servicoId} onChange={(e) => setFormData({ ...formData, servicoId: e.target.value })} className="border p-2 w-full rounded mb-2" />
                    </label>
                    <label className="block mb-2">
                        Serviços Adicionais (IDs separados por vírgula):
                        <input 
                            type="text" 
                            value={formData.servicosAdicionais.join(', ')} 
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                servicosAdicionais: e.target.value.split(',').map(id => id.trim()).filter(Boolean) 
                            })} 
                            className="border p-2 w-full rounded mb-2"
                            placeholder="Opcional: 123abc, 456def"
                        />
                    </label>
                    <label className="block mb-2">
                        Colaborador:
                        <input type="text" value={formData.colaboradorId} onChange={(e) => setFormData({ ...formData, colaboradorId: e.target.value })} className="border p-2 w-full rounded mb-2" />
                    </label>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setModalOpen(false)} appearance="subtle">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} appearance="primary">
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`.rbc-today { background-color: rgba(35, 34, 31, 0.21); }`}</style>
        </div>
    );
};

export default Agendamentos;
