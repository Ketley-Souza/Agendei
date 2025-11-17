import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
    CalendarBlankIcon,
    IdentificationBadgeIcon,
    AddressBookIcon,
    ClockCounterClockwiseIcon,
    PackageIcon,
    SignOutIcon
} from "@phosphor-icons/react";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { usuario } = useSelector((state) => state.auth);

    //Mmenu com limitações de acesso
    const todosMenuItems = [
        { label: "Agendamentos", icon: CalendarBlankIcon, path: "/agendamentos", roles: ['salao', 'colaborador'] },
        { label: "Clientes", icon: IdentificationBadgeIcon, path: "/clientes", roles: ['salao'] },
        { label: "Colaboradores", icon: AddressBookIcon, path: "/colaboradores", roles: ['salao'] },
        { label: "Horarios", icon: ClockCounterClockwiseIcon, path: "/horarios-atendimento", roles: ['salao', 'colaborador'] },
        { label: "Servicos", icon: PackageIcon, path: "/servicos", roles: ['salao', 'colaborador'] },
    ];

    //Filtro pelo tipo de usuário
    const menuItems = todosMenuItems.filter(item => 
        item.roles.includes(usuario?.tipo || '')
    );

    return (
        <aside
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={`font-catamaran  bg-[#0d1117] text-[#c9d1d9] h-screen flex flex-col 
                p-4 border-r border-[#30363d] transition-all duration-300 ease-in-out
                ${open ? "w-64" : "w-24"}`}
        >
            {/* Cabeçalho */}
            <div className="flex items-center relative p-3">
                {/* Logo */}
                    <img
                        src="/logo.png"       // Certifique que está em public/logo.png
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                    />

                {/* Nome do espaço */}
                <div className={`absolute left-16 transition-all duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                    <h1 className="font-semibold text-sm text-white">
                        {usuario?.tipo === 'salao' ? usuario?.nome || 'Salão' : 'Área Administrativa'}
                    </h1>
                    <p className="text-xs text-zinc-500">
                        {usuario?.tipo === 'salao' ? 'Administrador' : usuario?.tipo === 'colaborador' ? 'Colaborador' : 'Usuário'}
                    </p>
                </div>
            </div>




            {/* Itens do menu */}
            <nav className="flex-1 mt-4 space-y-1 relative">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            to={item.path}
                            key={item.label}
                            className={`group relative flex items-center px-4 py-2 w-full rounded-xl 
                                text-sm font-medium tracking-tight transition-all duration-200
                                ${isActive ? "bg-[#CDA327]/10" : "hover:bg-[#161b22]/80"}`}
                        >
                            {isActive && (
                                <div className="absolute left-[-10px] top-1.5 bottom-1.5 w-[4px] rounded-full bg-yellow-500" />
                            )}
                            <div className="w-8 h-8 flex justify-center items-center shrink-0">
                                <item.icon
                                    size={22}
                                    className={`transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}
                                />
                            </div>
                            <span className={`absolute left-16 transition-all duration-300 ${open ? `opacity-100 visible ${isActive ? "text-white" : "text-[#c9d1d9]"}` : "opacity-0 invisible"}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Rodapé */}
            <div className="border-t border-[#30363d] p-3 space-y-2">
                {/* Informações do usuário */}
                <div className="flex items-center gap-3 relative">
                    <img
                        src={usuario?.foto || "https://avatars.githubusercontent.com/u/139895814?v=4"}
                        alt={usuario?.nome || "Usuário"}
                        className="w-8 h-8 rounded-full shrink-0 object-cover"
                    />
                    <div className={`absolute left-16 transition-all duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                        <p className="text-sm font-medium text-white">{usuario?.nome || "Usuário"}</p>
                        <p className="text-xs text-zinc-400">{usuario?.email || "email@exemplo.com"}</p>
                    </div>
                </div>
                
                {/* Botão de logout */}
                <button
                    onClick={() => {
                        dispatch(logout());
                        navigate('/login');
                    }}
                    className={`w-full flex items-center px-4 py-2 rounded-xl text-sm font-medium 
                        text-red-400 hover:bg-red-400/10 transition-all duration-200
                        ${open ? "justify-start gap-3" : "justify-center"}`}
                >
                    <SignOutIcon size={22} className="shrink-0" />
                    {open && <span>Desconectar</span>}
                </button>
            </div>
        </aside>
    );
}
