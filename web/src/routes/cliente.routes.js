import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Agendamento from "../pages/Cliente/Agendamento";
import Agenda from "../pages/Cliente/Agenda";
import "../styles.css";

const ClienteRoutes = () => {
    return (
        <Router>
            <div className="container-fluid h-100">
                <div className="row h-100 flex">
                    <div className="flex-1 overflow-auto">
                        <Routes>
                            {/* Redireciona "/" para "/agendamento" */}
                            <Route path="/" element={<Navigate to="/agendamento" />} />

                            <Route path="/agendamento" element={<Agendamento />} />
                            <Route path="/agenda" element={<Agenda />} />
                            <Route path="*" element={<h2 className="p-4">Página não encontrada</h2>} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default ClienteRoutes;
