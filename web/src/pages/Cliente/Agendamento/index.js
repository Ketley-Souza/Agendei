import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CONSTS from "../../../consts";
import { allServicos } from "../../../store/slices/servicoSlice";
import EspecialistaPicker from "../../../components/Agendamento/EspecialistaPicker";
import DrawerServicos from "../../../components/Agendamento/DrawerServicos";
import CardDataHorario from "../../../components/Agendamento/CardDataHorario";
import util from "../../../services/util";


import {
  fetchDisponibilidade,
  updateAgendamento,
  setServicosSelecionados,
} from "../../../store/slices/salaoSlice";


export default function Agendamento() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const servicos = useSelector((state) => state.servico.servicos);
  const servicosSelecionados = useSelector((state) => state.salao.servicosSelecionados);
  const dataSelecionada = useSelector((state) => state.salao.dataSelecionada);
  const colaboradorSelecionado = useSelector((state) => state.salao.colaboradorSelecionado);
  const horariosDisponiveis = useSelector((state) => state.salao.horariosDisponiveis);
  const colaboradoresDisponiveis = useSelector((state) => state.salao.colaboradoresDisponiveis);
  const horaSelecionada = useSelector((state) => state.salao.horaSelecionada);

  const servicoPreSelecionado = useSelector(
    (state) => state.salao.servicoPreSelecionado
  );

  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    dispatch(allServicos());
  }, [dispatch]);

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

  const handleChangeDate = (novaData) => {
    dispatch(
      updateAgendamento({
        campo: "dataSelecionada",
        valor: util.toLocalISO(novaData),
      })
    );
    dispatch(fetchDisponibilidade());
  };

  const handleSelectColaborador = (colabId) => {
    dispatch(
      updateAgendamento({
        campo: "colaboradorSelecionado",
        valor: colabId,
      })
    );
    dispatch(fetchDisponibilidade());
  };

  const handleSelectHora = (hora) => {
    dispatch(
      updateAgendamento({
        campo: "horaSelecionada",
        valor: hora,
      })
    );
  };

  const handleAgendar = async () => {
    try {
      if (!servicosSelecionados.length || !colaboradorSelecionado || !horaSelecionada || !dataSelecionada) {
        alert("Preencha todos os campos para agendar.");
        return;
      }

      const principal = servicosSelecionados[0];
      const adicionais = servicosSelecionados.slice(1).map((s) => s._id);

      const clienteId = util.getClienteIdFromLocalStorage() || CONSTS.clienteId;
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
        navigate('/agenda');
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao agendar.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-2 sm:px-4 pt-5 pb-10 overflow-y-auto">

      <div
        className={`bg-white shadow-2xl rounded-2xl py-6 px-8 w-full max-w-3xl min-h-[520px] font-catamaran transition-all duration-300 mb-8
          ${drawerOpen ? "pb-0" : "pb-30"}
        `}
      >

        <h2 className="text-lg lg:text-2xl font-semibold mb-2 text-center text-gray-800">
          Agende um atendimento
        </h2>

        <p className="text-gray-500 text-center mb-6">
          Selecione data, horário e profissional para concluir seu agendamento
        </p>

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

        {servicosSelecionados.length > 0 && (
          <div className="mb-8">
            <EspecialistaPicker
              colaboradores={colaboradoresDisponiveis || []}
              selecionado={colaboradorSelecionado}
              onSelect={handleSelectColaborador}
            />
          </div>
        )}

        {servicosSelecionados.length > 0 && (
          <button
            onClick={handleAgendar}
            className="w-full bg-[#CDA327] text-white font-semibold py-3.5 rounded-xl hover:bg-yellow-700 transition"
          >
            AGENDAR
          </button>
        )}
      </div>

      <DrawerServicos
        open={drawerOpen}
        onClose={setDrawerOpen}
        servicos={servicos}
        onSelect={handleSelecionarServicos}
      />
    </div>
  );
}