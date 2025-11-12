import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import DrawerServicos from "../../../components/DrawerServicos";
import api, { urlImagem } from "../../../services/api";
import CONSTS from "../../../consts";
import CalendarioPopover from "../../../components/Agendamento/CalendarioPopover";
import DropdownEspecialistas from "../../../components/Agendamento/DropdownEspecialistas";
import { limparServicoSelecionado } from "../../../store/slices/agendamentoSlice";

const { salaoId, clienteId } = CONSTS;

const Agendamento = () => {
  const dispatch = useDispatch();
  const servicoPreSelecionado = useSelector(
    (state) => state.agendamento.servicoSelecionado
  );

  const [servicos, setServicos] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(""); // conterá data + hora
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState(null);
  const [especialistas, setEspecialistas] = useState([]);

  // Buscar dados do backend
  useEffect(() => {
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

    buscarServicos();
    buscarEspecialistas();
  }, []);

  // Se vier da Home
  useEffect(() => {
    if (servicoPreSelecionado) {
      setServicosSelecionados([servicoPreSelecionado]);
      setDrawerOpen(false);
      dispatch(limparServicoSelecionado());
    }
  }, [servicoPreSelecionado, dispatch]);

  // Confirmar serviços
  const handleSelectServico = (selecionados) => {
    setServicosSelecionados(selecionados);
    setDrawerOpen(false);
  };

  // Clicar em horário → junta com data
  const handleSelectHora = (hora) => {
    if (!dataSelecionada) {
      alert("Selecione a data antes do horário!");
      return;
    }

    const dataComHora = `${dataSelecionada}T${hora}:00`;
    setDataSelecionada(dataComHora);
  };

  // Criar agendamento
  const handleAgendar = async () => {
    if (!servicosSelecionados.length) {
      alert("Selecione pelo menos um serviço");
      return;
    }
    if (!especialistaSelecionado) {
      alert("Selecione um especialista");
      return;
    }
    if (!dataSelecionada) {
      alert("Selecione data e horário");
      return;
    }

    const servicoPrincipal = servicosSelecionados[0];
    const servicosAdicionais = servicosSelecionados.slice(1);

    const payload = {
      salaoId,
      clienteId,
      colaboradorId: especialistaSelecionado._id,
      servicoId: servicoPrincipal._id,
      servicosAdicionais: servicosAdicionais.map((s) => s._id),
      data: dataSelecionada,
    };

    try {
      const response = await api.post("/agendamento", payload);
      console.log("Agendamento criado:", response.data.agendamento);
      alert("Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar o agendamento");
    }
  };

  return (
    <div className="relative h-screen bg-gray-50 flex flex-col items-center justify-start pt-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mb-6 font-catamaran">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Agende um atendimento
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Selecione data, horário e profissional para criar o agendamento
        </p>

        {/* Serviços selecionados */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Serviços Selecionados</h3>
          {servicosSelecionados.length > 0 ? (
            <ul className="space-y-3">
              {servicosSelecionados.map((s, index) => (
                <li
                  key={s._id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.imagem ? urlImagem(s.imagem) : "https://via.placeholder.com/50"}
                      alt={s.nomeServico}
                      className="w-12 h-12 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {index === 0 ? "Principal: " : "Adicional: "}
                        {s.nomeServico}
                      </p>
                      <p className="text-sm text-gray-500">R$ {s.preco}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum serviço selecionado</p>
          )}
        </div>

        {/* Data */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Data</label>
          <CalendarioPopover onSelect={setDataSelecionada} />
        </div>

        {/* Horários */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Horários</label>
          <div className="grid grid-cols-4 gap-2">
            {["09:00", "10:00", "11:00", "12:00", "19:00", "20:00", "21:00"].map(
              (hora) => (
                <button
                  key={hora}
                  onClick={() => handleSelectHora(hora)}
                  className="border rounded-lg py-2 hover:bg-yellow-500 hover:text-white transition"
                >
                  {hora}
                </button>
              )
            )}
          </div>
        </div>

        {/* Especialista */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Especialista
          </label>
          <DropdownEspecialistas
            especialistas={especialistas}
            onSelect={setEspecialistaSelecionado}
          />
        </div>

        <button
          onClick={handleAgendar}
          className="w-full bg-[#CDA327] text-white font-semibold py-3 rounded-lg hover:bg-yellow-700 transition"
        >
          AGENDAR
        </button>
      </div>

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
