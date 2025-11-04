import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "../styles.css";

// Componentes
import Sidebar from "../components/Sidebar";

// Páginas
import Agendamentos from "../pages/Admin/Agendamentos";
import Clientes from "../pages/Admin/Clientes";
import Colaboradores from "../pages/Admin/Colaboradores";
import Servicos from "../pages/Admin/Servicos";
import HorariosAtendimento from "../pages/Admin/HorariosAtendimento";

const AdminRoutes = () => {
  return (
    <Router>
      <div className="container-fluid h-100">
        <div className="row h-100 flex">
          {/* Sidebar fixa à esquerda */}
          <Sidebar />

          {/* Área principal das páginas */}
          <div className="flex-1 overflow-auto">
            <Routes>
              {/* Redireciona a raiz para /agendamentos */}
              <Route path="/" element={<Navigate to="/agendamentos" />} />

              {/* Páginas principais */}
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/horarios-atendimento" element={<HorariosAtendimento />} />

              {/* Página não encontrada */}
              <Route path="*" element={<h2 className="p-4">Página não encontrada</h2>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default AdminRoutes;
