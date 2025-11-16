// src/pages/Agendamento.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allServicos } from "../../../store/slices/servicoSlice";
import CONSTS from "../../../consts";
import { Calendar, CaretDown } from "@phosphor-icons/react";
import EspecialistaPicker from "../../../components/EspecialistaPicker";


import {
  fetchDisponibilidade,
  updateAgendamento,
  setServicosSelecionados,
} from "../../../store/slices/salaoSlice";

import DrawerServicos from "../../../components/DrawerServicos";
import CardDataHorario from "../../../components/CardDataHorario";
import util from "../../../services/util";

export default function Agendamento() {
  const dispatch = useDispatch();

  // Redux
  const servicos = useSelector((state) => state.servico.servicos);
  const servicosSelecionados = useSelector((state) => state.salao.servicosSelecionados);
  const dataSelecionada = useSelector((state) => state.salao.dataSelecionada);
  const colaboradorSelecionado = useSelector((state) => state.salao.colaboradorSelecionado);
  const horariosDisponiveis = useSelector((state) => state.salao.horariosDisponiveis);
  const colaboradoresDisponiveis = useSelector((state) => state.salao.colaboradoresDisponiveis);
  const horaSelecionada = useSelector((state) => state.salao.horaSelecionada);

  // Pré-selecionado vindo da Home
  const servicoPreSelecionado = useSelector(
    (state) => state.salao.servicoPreSelecionado
  );

  const [drawerOpen, setDrawerOpen] = useState(true);

  /* ===========================
     1) Buscar serviços
  =========================== */
  useEffect(() => {
    dispatch(allServicos());
  }, [dispatch]);

  /* ===========================
     2) Aplicar serviço vindo da Home
  =========================== */
  useEffect(() => {
    if (servicoPreSelecionado) {
      dispatch(setServicosSelecionados([servicoPreSelecionado]));

      dispatch(
        updateAgendamento({
          campo: "servicoId",
          valor: servicoPreSelecionado._id,
        })
      );

      dispatch(fetchDisponibilidade());

      setDrawerOpen(false);
    }
  }, [servicoPreSelecionado, dispatch]);

  /* ===========================
     3) Seleção de serviços via Drawer
  =========================== */
  const handleSelecionarServicos = (selecionados) => {
    dispatch(setServicosSelecionados(selecionados));

    const principal = selecionados[0] || null;

    dispatch(
      updateAgendamento({
        campo: "servicoId",
        valor: principal?._id || null,
      })
    );

    dispatch(
      updateAgendamento({
        campo: "servicosAdicionais",
        valor: selecionados.slice(1),
      })
    );

    if (principal) {
      dispatch(fetchDisponibilidade());
    }

    setDrawerOpen(false);
  };

  /* ===========================
     4) Alterar data
  =========================== */
  const handleChangeDate = (novaData) => {
    dispatch(
      updateAgendamento({
        campo: "dataSelecionada",
        valor: util.toLocalISO(novaData),
      })
    );
    dispatch(fetchDisponibilidade());
  };

  /* ===========================
     5) Selecionar colaborador
  =========================== */
  const handleSelectColaborador = (colabId) => {
    dispatch(
      updateAgendamento({
        campo: "colaboradorSelecionado",
        valor: colabId,
      })
    );
    dispatch(fetchDisponibilidade());
  };

  /* ===========================
     6) Selecionar horário
  =========================== */
  const handleSelectHora = (hora) => {
    dispatch(
      updateAgendamento({
        campo: "horaSelecionada",
        valor: hora,
      })
    );
  };

  /* ===========================
     7) Confirmar agendamento
  =========================== */
  const handleAgendar = async () => {
    try {
      if (!servicosSelecionados.length || !colaboradorSelecionado || !horaSelecionada || !dataSelecionada) {
        alert("Preencha todos os campos para agendar.");
        return;
      }

      const principal = servicosSelecionados[0];
      const adicionais = servicosSelecionados.slice(1).map((s) => s._id);

      const clienteId = CONSTS.clienteId;
      const salaoId = CONSTS.salaoId;

      const dataObj = new Date(dataSelecionada);
      const [h, m] = horaSelecionada.split(":").map(Number);
      dataObj.setHours(h, m, 0, 0);

      const payload = {
        clienteId,
        salaoId,
        servicoId: principal._id,
        servicosAdicionais: adicionais,
        colaboradorId: colaboradorSelecionado,
        data: dataObj,
      };

      const res = await fetch("/agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        alert("Erro ao agendar: " + data.message);
      } else {
        alert("Agendamento realizado com sucesso!");

        dispatch(setServicosSelecionados([]));
        dispatch(updateAgendamento({ campo: "colaboradorSelecionado", valor: null }));
        dispatch(updateAgendamento({ campo: "horaSelecionada", valor: null }));
        dispatch(updateAgendamento({ campo: "dataSelecionada", valor: util.toLocalISO(new Date()) }));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao agendar.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 pt-5 pb-6 overflow-y-auto">

      {/* CARD CENTRALIZADO IGUAL LOGIN */}
      <div
        className={`bg-white shadow-2xl rounded-2xl p-10 w-full max-w-3xl min-h-[520px] font-catamaran transition-all duration-300
          ${drawerOpen ? "pb-0" : "pb-[40px]"}
        `}
      >


        {/* Título */}
        <h2 className="text-lg lg:text-3xl font-semibold mb-2 text-center text-gray-800">
          Agende um atendimento
        </h2>

        <p className="text-gray-500 text-center mb-8">
          Selecione data, horário e profissional para concluir seu agendamento
        </p>

        {/* Serviços selecionados */}
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Serviços Selecionados</h3>

          {servicosSelecionados.length > 0 ? (
            <ul className="space-y-3">
              {servicosSelecionados.map((s, index) => (
                <li
                  key={s._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={s.imagem || "https://via.placeholder.com/60"}
                      className="w-14 h-14 rounded-xl object-cover"
                      alt="Serviço"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {index === 0 ? "Principal: " : "Adicional: "}
                        {s.nomeServico ?? s.nome}
                      </p>
                      {s.preco && (
                        <p className="text-sm text-gray-500">R$ {s.preco}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum serviço selecionado</p>
          )}
        </div>

        {/* Datas + horários */}
        {servicosSelecionados.length > 0 && (
          <div className="mb-6">

            <CardDataHorario
              data={new Date(dataSelecionada)}
              onChangeDate={handleChangeDate}
              horarios={horariosDisponiveis}
              onSelectHora={handleSelectHora}
              horaSelecionada={horaSelecionada}
            />
          </div>
        )}

        {/* Colaborador */}
        {servicosSelecionados.length > 0 && (
          <div className="mb-8">
            <EspecialistaPicker
              colaboradores={colaboradoresDisponiveis}
              selecionado={colaboradorSelecionado}
              onSelect={handleSelectColaborador}
            />

          </div>
        )}

        {/* Botão */}
        {servicosSelecionados.length > 0 && (
          <button
            onClick={handleAgendar}
            className="w-full bg-[#CDA327] text-white font-semibold py-3.5 rounded-xl hover:bg-yellow-700 transition"
          >
            AGENDAR
          </button>
        )}
      </div>

      {/* Drawer */}
      <DrawerServicos
        open={drawerOpen}
        onClose={setDrawerOpen}
        servicos={servicos}
        onSelect={handleSelecionarServicos}
      />
    </div>
  );
}