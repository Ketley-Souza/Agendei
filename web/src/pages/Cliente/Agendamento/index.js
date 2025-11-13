import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Calendar, User } from "lucide-react"; // 👈 ícones
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
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState(null);
  const [especialistas, setEspecialistas] = useState([]);
  const [horaSelecionada, setHoraSelecionada] = useState("");

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

  // Se veio da Home
  useEffect(() => {
    if (servicoPreSelecionado) {
      setServicosSelecionados([servicoPreSelecionado]);
      setDrawerOpen(false);
      dispatch(limparServicoSelecionado());
    }
  }, [servicoPreSelecionado, dispatch]);

  const handleSelectServico = (selecionados) => {
    setServicosSelecionados(selecionados);
    setDrawerOpen(false);
  };

  const handleSelectHora = (hora) => {
    if (!dataSelecionada) {
      alert("Selecione a data antes do horário!");
      return;
    }

    setHoraSelecionada(hora);
    const dataComHora = `${dataSelecionada}T${hora}:00`;
    setDataSelecionada(dataComHora);
  };

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
    <div
      style={{
        background: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "0.5rem",
            color: "#1f1f1f",
          }}
        >
          Agende um atendimento
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b6b6b",
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
          }}
        >
          Selecione data, horário e profissional
        </p>

        {/* Serviços */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: 500, marginBottom: "6px" }}>
            Serviços
          </label>
          {servicosSelecionados.length > 0 ? (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={
                  servicosSelecionados[0].imagem
                    ? urlImagem(servicosSelecionados[0].imagem)
                    : "https://via.placeholder.com/50"
                }
                alt={servicosSelecionados[0].nomeServico}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
              <div>
                <p style={{ fontWeight: 600, color: "#333", marginBottom: 2 }}>
                  {servicosSelecionados[0].nomeServico}
                </p>
                <p style={{ color: "#777", fontSize: "0.9rem" }}>
                  Total R$ {servicosSelecionados[0].preco}
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
                background: "#fafafa",
                color: "#777",
              }}
            >
              Nenhum serviço selecionado
            </div>
          )}
        </div>

        {/* Data */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: "6px" }}>
            Data
          </label>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#555" }}>
              <Calendar size={18} />
              <CalendarioPopover onSelect={setDataSelecionada} />
            </div>
          </div>
        </div>

        {/* Horários */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: "6px" }}>
            Horários
          </label>
          {[
            { titulo: "Manhã", horas: ["09:00", "10:00", "11:00", "12:00"] },
            { titulo: "Tarde", horas: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
            { titulo: "Noite", horas: ["19:00", "20:00", "21:00"] },
          ].map((periodo) => (
            <div key={periodo.titulo} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {periodo.horas.map((hora) => (
                  <button
                    key={hora}
                    onClick={() => handleSelectHora(hora)}
                    style={{
                      padding: "8px 14px",
                      border: horaSelecionada === hora ? "2px solid #c8a100" : "1px solid #ccc",
                      borderRadius: "8px",
                      background: horaSelecionada === hora ? "#f0d66e" : "#fff",
                      fontWeight: horaSelecionada === hora ? 600 : 400,
                      color: "#333",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Especialista */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: "6px" }}>
            Especialista
          </label>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#555",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} />
              <DropdownEspecialistas
                especialistas={especialistas}
                onSelect={setEspecialistaSelecionado}
              />
            </div>
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={handleAgendar}
          style={{
            width: "100%",
            background: "#c8a100",
            color: "white",
            fontWeight: 600,
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#b19000")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#c8a100")}
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
