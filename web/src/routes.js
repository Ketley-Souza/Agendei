import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './styles.css';
import Sidebar from './components/Sidebar';

import Agendamentos from './pages/Agendamentos';
import NovoAgendamento from './pages/Agendamentos/NovoAgendamento'; // 👈 novo import
import Clientes from './pages/Clientes';
import Colaboradores from './pages/Colaboradores';
import Servicos from './pages/Servicos';
import HorariosAtendimento from './pages/HorariosAtendimento';

const SiteRoutes = () => {
    return (
        <>
            <div className="container-fluid h-100">
                <div className="row h-100">
                    <Router>
                        <div className="flex h-full">
                            {/* Menu lateral */}
                            <Sidebar />

                            {/* Área principal das páginas */}
                            <div className="flex-1 overflow-auto">
                                <Routes>
                                    {/* Redireciona a raiz para /agendamentos */}
                                    <Route path="/" element={<Navigate to="/agendamentos" />} />

                                    {/* Páginas principais */}
                                    <Route path="/agendamentos" element={<Agendamentos />} />
                                    <Route path="/agendamentos/novo" element={<NovoAgendamento />} /> {/* 👈 nova rota */}
                                    <Route path="/clientes" element={<Clientes />} />
                                    <Route path="/colaboradores" element={<Colaboradores />} />
                                    <Route path="/servicos" element={<Servicos />} />
                                    <Route path="/horarios-atendimento" element={<HorariosAtendimento />} />

                                    {/* Página não encontrada */}
                                    <Route path="*" element={<h2 className="p-4">Página não encontrada</h2>} />
                                </Routes>
                            </div>
                        </div>
                    </Router>
                </div>
            </div>
        </>
    );
};

export default SiteRoutes;
