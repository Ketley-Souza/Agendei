import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    CalendarBlankIcon,
    IdentificationBadgeIcon,
    AddressBookIcon,
    ClockCounterClockwiseIcon,
    PackageIcon
} from "@phosphor-icons/react";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { label: "Agendamentos", icon: CalendarBlankIcon, path: "/" },
        { label: "Clientes", icon: IdentificationBadgeIcon, path: "/clientes" },
        { label: "Colaboradores", icon: AddressBookIcon, path: "/colaboradores" },
        { label: "Horarios", icon: ClockCounterClockwiseIcon, path: "/horarios-atendimento" },
        { label: "Servicos", icon: PackageIcon, path: "/servicos" },
    ];

    return (
        <aside
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={`font-mono bg-[#0d1117] text-[#c9d1d9] h-screen flex flex-col 
                p-4 border-r border-[#30363d] transition-all duration-300 ease-in-out
                ${open ? "w-64" : "w-24"}`}
        >
            {/* Cabeçalho */}
            <div className="flex items-center relative px-4 py-3 border-b border-[#30363d]">
                <div className="bg-white w-8 h-8 rounded-md shrink-0 flex justify-center items-center">
                    <span className="text-black font-bold text-sm">A</span>
                </div>
                <div className={`absolute left-16 transition-all duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                    <h1 className="font-semibold text-sm text-white">Nosso Espaço</h1>
                    <p className="text-xs text-zinc-500">Salão</p>
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
            <div className="border-t border-[#30363d] p-3 flex items-center gap-3 relative">
                <img
                    src="https://avatars.githubusercontent.com/u/139895814?v=4"
                    alt="user"
                    className="w-8 h-8 rounded-full shrink-0"
                />
                <div className={`absolute left-16 transition-all duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                    <p className="text-sm font-medium text-white">Usuário</p>
                    <p className="text-xs text-zinc-400">email@exemplo.com</p>
                </div>
            </div>
        </aside>
    );
}
