import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import HeaderCliente from "../components/HeaderCliente";
import Agendamento from "../pages/Cliente/Agendamento";
import Agenda from "../pages/Cliente/Agenda";

const ClienteRoutes = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header com informações do cliente e logout */}
            <HeaderCliente />
            
            {/* Conteúdo principal */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    {/* Redireciona "/" para "/agendamento" */}
                    <Route path="/" element={<Navigate to="/agendamento" replace />} />

                    {/* Rotas protegidas - apenas para clientes logados */}
                    <Route
                        path="/agendamento"
                        element={
                            <ProtectedRoute requiredType="cliente">
                                <Agendamento />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agenda"
                        element={
                            <ProtectedRoute requiredType="cliente">
                                <Agenda />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<h2 className="p-4">Página não encontrada</h2>} />
                </Routes>
            </div>
        </div>
    );
};

export default ClienteRoutes;
