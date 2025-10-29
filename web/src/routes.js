import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './styles.css';
import Sidebar from './components/Sidebar';

import Agendamentos from './pages/Agendamentos';
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
                            <Sidebar />
                            <div className="flex-1 overflow-auto">
                                <Routes>
                                    <Route path="/" element={<Agendamentos />} />
                                    <Route path="/clientes" element={<Clientes />} />
                                    <Route path="/colaboradores" element={<Colaboradores />} />
                                    <Route path="/servicos" element={<Servicos />} />
                                    <Route path="/horarios-atendimento" element={<HorariosAtendimento />} />
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
