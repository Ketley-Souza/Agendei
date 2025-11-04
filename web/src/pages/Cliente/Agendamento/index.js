import React, { useState, useEffect } from "react";
import DrawerServicos from "../../../components/DrawerServicos";
import api from "../../../services/api";
import CONSTS from "../../../consts";

const { salaoId } = CONSTS;

const Agendamento = () => {
  const [servicos, setServicos] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const buscarServicos = async () => {
    try {
      const response = await api.get("/servico/salao/" + salaoId);
      setServicos(response.data.servicos);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  useEffect(() => {
    buscarServicos();
  }, []);

  const handleSelectServico = (servico) => {
    setServicoSelecionado(servico);
    setDrawerOpen(false);
  };

  return (
    <div className="relative h-screen bg-gray-50 flex flex-col items-center justify-start pt-6">
      {/* Card principal */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-center">Agende um atendimento</h2>
        <p className="text-gray-500 text-center mb-6">
          Selecione data, horário e profissional para criar o agendamento
        </p>

        {/* Serviço selecionado */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Serviço Selecionado</h3>
          {servicoSelecionado ? (
            <div className="flex items-center gap-3">
              <img
                src="https://via.placeholder.com/60"
                alt={servicoSelecionado.nomeServico}
                className="rounded-lg"
              />
              <div>
                <p className="font-semibold">{servicoSelecionado.nomeServico}</p>
                <p className="text-gray-500 text-sm">R$ {servicoSelecionado.preco}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum serviço selecionado</p>
          )}
        </div>

        {/* Data */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Data</label>
          <input type="date" defaultValue="2024-10-01" className="w-full border rounded-lg px-3 py-2" />
        </div>

        {/* Horários */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Horários</label>
          <div className="grid grid-cols-4 gap-2">
            {["09:00", "10:00", "11:00", "12:00", "19:00", "20:00", "21:00"].map((hora) => (
              <button
                key={hora}
                className="border rounded-lg py-2 hover:bg-yellow-500 hover:text-white transition"
              >
                {hora}
              </button>
            ))}
          </div>
        </div>

        {/* Especialista */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Especialista</label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Nome do especialista</option>
          </select>
        </div>

        {/* Botão Agendar */}
        <button className="w-full bg-yellow-600 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700 transition">
          AGENDAR
        </button>
      </div>

      {/* Drawer */}
      <DrawerServicos
        open={drawerOpen}
        onClose={setDrawerOpen}
        servicos={servicos}
        onSelect={handleSelectServico}
      />
    </div>
  );
};

export default Agendamento;
