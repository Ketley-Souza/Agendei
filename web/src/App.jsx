import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import NovoAgendamento from "./pages/Agendamentos/NovoAgendamento";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a raiz para /agendamentos */}
        <Route path="/" element={<Navigate to="/agendamentos" />} />

        {/* Rotas principais */}
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/agendamentos/novo" element={<NovoAgendamento />} />
        <Route path="/clientes" element={<Clientes />} />

        {/* Página não encontrada */}
        <Route path="*" element={<h2>Página não encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
