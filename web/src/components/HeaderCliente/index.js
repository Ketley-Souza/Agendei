import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";

export default function HeaderCliente() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { usuario } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo/Nome */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <h1 className="text-xl font-semibold text-gray-800">Agendei</h1>
                    </div>

                    {/* Informações do usuário e logout */}
                    <div className="flex items-center gap-4">
                        {/* Informações do usuário */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <UserCircleIcon size={24} className="text-gray-500" />
                            <div className="hidden sm:block">
                                <p className="font-medium">{usuario?.nome || "Cliente"}</p>
                                <p className="text-xs text-gray-500">{usuario?.email || ""}</p>
                            </div>
                        </div>

                        {/* Botão de logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200
                                border border-red-200 hover:border-red-300"
                        >
                            <SignOutIcon size={20} />
                            <span className="hidden sm:inline">Desconectar</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

