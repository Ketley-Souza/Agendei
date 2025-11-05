import React, { useState, useEffect } from "react";
import DrawerServicos from "../../../components/DrawerServicos";

import api from "../../../services/api";
import CONSTS from "../../../consts";

// componentes estão dentro de src/components/Agendamento)
import CalendarioPopover from "../../../components/Agendamento/CalendarioPopover";
import DropdownEspecialistas from "../../../components/Agendamento/DropdownEspecialistas";

const { salaoId } = CONSTS;

const Agendamento = () => {
  const [servicos, setServicos] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState("");
  const [especialistas, setEspecialistas] = useState([]);

  const buscarServicos = async () => {
    try {
      const response = await api.get("/servico/salao/" + salaoId);
      setServicos(response.data.servicos);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  const buscarEspecialistas = async () => {
    try {
      const response = await api.get("/colaborador/salao/" + salaoId);
      setEspecialistas(response.data.colaboradores);
    } catch (error) {
      console.error("Erro ao buscar especialistas:", error);
    }
  };

  useEffect(() => {
    buscarServicos();
    buscarEspecialistas();
  }, []);

  const handleSelectServico = (servico) => {
    setServicoSelecionado(servico);
    setDrawerOpen(false);
  };

  const handleAgendar = () => {
    console.log({
      servicoSelecionado,
      dataSelecionada,
      especialistaSelecionado,
    });
    // dps chamar o o endpoint para criar o agendamento
  };

  return (
    <div className="relative h-screen bg-gray-50 flex flex-col items-center justify-start pt-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-center">Agende um atendimento</h2>
        <p className="text-gray-500 text-center mb-6">
          Selecione data, horário e profissional para criar o agendamento
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Serviço Selecionado</h3>
          {servicoSelecionado ? (
            <div className="flex items-center gap-3">
              <img
                src={servicoSelecionado.foto || "https://via.placeholder.com/60"}
                alt={servicoSelecionado.nomeServico}
                className="rounded-lg w-16 h-16 object-cover"
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

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Data</label>
          <CalendarioPopover onSelect={setDataSelecionada} />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Horários</label>
          <div className="grid grid-cols-4 gap-2">
            {["09:00", "10:00", "11:00", "12:00", "19:00", "20:00", "21:00"].map((hora) => (
              <button key={hora} className="border rounded-lg py-2 hover:bg-yellow-500 hover:text-white transition">
                {hora}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Especialista</label>
          <DropdownEspecialistas especialistas={especialistas} onSelect={setEspecialistaSelecionado} />
        </div>

        <button onClick={handleAgendar} className="w-full bg-yellow-600 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700 transition">
          AGENDAR
        </button>
      </div>

      <DrawerServicos open={drawerOpen} onClose={setDrawerOpen} servicos={servicos} onSelect={handleSelectServico} />
    </div>
  );
};

export default Agendamento;
