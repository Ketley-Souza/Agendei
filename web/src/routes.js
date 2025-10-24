import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './styles.css';
import Sidebar from './components/Sidebar';

import Agendamentos from './pages/Agendamentos';

const SiteRoutes = () => {
    return (
        <>
            <div className='container-fluid h-100'>
                <div className='row h-100'>
                    <Router>
                        <Sidebar />
                        <Routes>
                            <Route path='/' element={<Agendamentos />} />
                        </Routes>
                    </Router>
                </div>
            </div>
            
            
        </>
    );
};

export default SiteRoutes;
