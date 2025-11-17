import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";

// Páginas
import Agendamentos from "../pages/Admin/Agendamentos";
import Clientes from "../pages/Admin/Clientes";
import Colaboradores from "../pages/Admin/Colaboradores";
import Servicos from "../pages/Admin/Servicos";
import HorariosAtendimento from "../pages/Admin/HorariosAtendimento";

const AdminRoutes = () => {
  return (
    <div className="container-fluid h-100">
      <div className="row h-100 flex">
        {/* Sidebar fixa à esquerda */}
        <Sidebar />

        {/* Área principal das páginas */}
        <div className="flex-1 overflow-auto">
          <Routes>
            {/* Redireciona a raiz para /agendamentos */}
            <Route path="/" element={<Navigate to="/agendamentos" replace />} />

            {/* Páginas principais - protegidas para salão e colaborador */}
            <Route
              path="/agendamentos"
              element={
                <ProtectedRoute requiredType={['salao', 'colaborador']}>
                  <Agendamentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute requiredType="salao">
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute requiredType="salao">
                  <Colaboradores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos"
              element={
                <ProtectedRoute requiredType={['salao', 'colaborador']}>
                  <Servicos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/horarios-atendimento"
              element={
                <ProtectedRoute requiredType={['salao', 'colaborador']}>
                  <HorariosAtendimento />
                </ProtectedRoute>
              }
            />

            {/* Página não encontrada */}
            <Route path="*" element={<h2 className="p-4">Página não encontrada</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;
