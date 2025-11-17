import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ClockIcon, CalendarIcon } from "@phosphor-icons/react";
import api from "../../../services/api";
import CONSTS from "../../../consts";
import { setServicoSelecionado, limparServicoSelecionado } from "../../../store/slices/agendamentoSlice";

const { salaoId } = CONSTS;

const HomeCliente = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carrega os serviços do backend (apenas 3 em destaque)
    useEffect(() => {
        const carregarServicos = async () => {
            setLoading(true);
            try {
                const resposta = await api.get(`/servico/salao/${salaoId}`);
                // proteger caso resposta ou array sejam indefinidos
                const lista = (resposta?.data?.servicos) || [];
                setServicos(lista.slice(0, 3));
            } catch (error) {
                console.error("Erro ao carregar serviços:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarServicos();
    }, []);

    // Navega para a página de agendamento.
    // Se receber um serviço, salva no Redux para o Agendamento ler.
    //Se não estiver logado, redireciona para login
    const irParaAgendamento = (servicoSelecionado = null) => {
        //Verifica login
        const usuarioSalvo = localStorage.getItem('usuario');
        const isLogado = !!usuarioSalvo;

        if (!isLogado) {
            //Não logado mmanda para login
            navigate("/login");
            return;
        }

        //Logado vai para agendamento
        if (servicoSelecionado) {
            dispatch(setServicoSelecionado(servicoSelecionado));
        } else {
            dispatch(limparServicoSelecionado());
        }
        navigate("/agendamento");
    };
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-12">
            {/* Container centralizado para toda a página */}
            <div className="max-w-3xl mx-auto">

                {/* Botão Agendar agora */}
                <div className="mb-8">
                    <button
                        onClick={() => irParaAgendamento()}
                        aria-label="Agendar agora"
                        className="flex items-center justify-center gap-3 bg-black text-white font-medium py-4 px-6 rounded-xl w-full hover:bg-gray-800 transition text-lg"
                    >
                        <ClockIcon size={20} weight="bold" />
                        <span>Agendar agora</span>
                    </button>
                </div>


                <h2 className="text-xl md:text-2xl font-semibold pb-5 pt-8">Serviços em Destaque</h2>

                {loading ? (
                    <p className="text-center text-gray-500 mb-4">Carregando serviços...</p>
                ) : null}

                {/* Lista de serviços */}
                <div className="space-y-4">
                    {servicos.length === 0 && !loading ? (
                        <p className="text-gray-500 text-center">
                            Nenhum serviço disponível no momento.
                        </p>
                    ) : (
                        servicos.map((servico) => (
                            <article
                                key={servico._id}
                                className="relative bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition flex flex-col md:flex-row"
                            >
                                {/* Botão no topo direito */}
                                <button
                                    onClick={() => irParaAgendamento(servico)}
                                    aria-label={`Agendar ${servico.nomeServico}`}
                                    className="absolute top-4 right-5 bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow-sm transition"
                                >
                                    <CalendarIcon size={20} weight="regular" />
                                </button>

                                {/* Imagem */}
                                <img
                                    src={servico.foto || "/placeholder.png"}
                                    alt={servico.nomeServico}
                                    className="w-20 h-20 rounded-xl object-cover mb-3 md:mb-0 md:mr-4"
                                />

                                {/* Conteúdo */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-base md:text-lg text-gray-800 mb-1">
                                        {servico.nomeServico}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-900 font-medium">
                                        R$ {servico.preco}
                                        <span className="text-gray-500 text-xs md:text-sm ml-2">a partir</span>
                                    </p>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm mt-1">
                                        <ClockIcon size={14} />
                                        <span>{servico.duracao || "Duração não informada"}</span>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

};

export default HomeCliente;