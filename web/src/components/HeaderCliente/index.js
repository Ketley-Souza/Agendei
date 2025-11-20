import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarIcon, CalendarCheckIcon, UserIcon } from "@phosphor-icons/react";

export default function HeaderCliente() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario } = useSelector((state) => state.auth);

    const isAgendamentoActive = location.pathname.includes('/agendamento');
    const isAgendaActive = location.pathname.includes('/agenda') && !isAgendamentoActive;
    const isPerfilActive = location.pathname.includes('/perfil');

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Nome */}
                    <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-70" onClick={() => navigate('/agendamento')}>
                        <h1 className="text-lg font-light tracking-[0.2em] text-gray-900 uppercase">Agendei</h1>
                    </div>

                    {/* Navegação */}
                    <nav className="flex items-center gap-8">
                        <button
                            onClick={() => navigate('/agendamento')}
                            className={`flex items-center gap-2 pb-[2px] text-sm font-light tracking-wide transition-all duration-200 relative group ${
                                isAgendamentoActive
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                            }`}
                        >
                            <CalendarIcon size={18} weight="thin" />
                            <span className="hidden sm:inline">Agendar</span>
                            <div className={`absolute -bottom-2 left-0 right-0 h-[2px] transition-all duration-200 ${
                                isAgendamentoActive 
                                    ? 'bg-gray-900' 
                                    : 'bg-gray-300 opacity-0 group-hover:opacity-100'
                            }`}></div>
                        </button>
                        <button
                            onClick={() => navigate('/agenda')}
                            className={`flex items-center gap-2 pb-[2px] text-sm font-light tracking-wide transition-all duration-200 relative group ${
                                isAgendaActive
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                            }`}
                        >
                            <CalendarCheckIcon size={18} weight="thin" />
                            <span className="hidden sm:inline">Agenda</span>
                            <div className={`absolute -bottom-2 left-0 right-0 h-[2px] transition-all duration-200 ${
                                isAgendaActive 
                                    ? 'bg-gray-900' 
                                    : 'bg-gray-300 opacity-0 group-hover:opacity-100'
                            }`}></div>
                        </button>
                        <button
                            onClick={() => navigate('/perfil')}
                            className={`flex items-center gap-2 pb-[2px] text-sm font-light tracking-wide transition-all duration-200 relative group ${
                                isPerfilActive
                                    ? 'text-gray-800'
                                    : 'text-gray-500'
                            }`}
                        >
                            <UserIcon size={18} weight="thin" />
                            <span className="hidden sm:inline">Perfil</span>
                            <div className={`absolute -bottom-2 left-0 right-0 h-[2px] transition-all duration-200 ${
                                isPerfilActive 
                                    ? 'bg-gray-800' 
                                    : 'bg-gray-300 opacity-0 group-hover:opacity-100'
                            }`}></div>
                        </button>
                    </nav>

                    {/* Nome do usuário */}
                    <div className="hidden md:block">
                        <p className="text-sm font-light text-gray-600 tracking-wide">{usuario?.nome || "Cliente"}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

