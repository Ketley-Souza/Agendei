import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ClockIcon,
  CalendarIcon,
  ChatText,
  Phone,
  MapPin,
  ShareNetwork,
} from "@phosphor-icons/react";

import api from "../../../services/api";
import CONSTS from "../../../consts";
import util from "../../../services/util";
import {
  setServicoSelecionado,
  limparServicoSelecionado,
} from "../../../store/slices/agendamentoSlice";

const { salaoId, apiUrl } = CONSTS;

const HomeCliente = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clienteId = useSelector((state) => state.auth.usuario?.id);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);

  const getFoto = (servico) => {
    const img = servico?.imagem || servico?.foto;
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;

    return `${apiUrl}/${img.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const carregarServicos = async () => {
      setLoading(true);
      try {
        const resposta = await api.get(`/servico/salao/${salaoId}`);
        const lista = resposta?.data?.servicos || [];
        setServicos(lista.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarServicos();
  }, []);

  const irParaAgendamento = (servicoSelecionado = null) => {
    const usuarioSalvo = util.getUsuarioFromLocalStorage();

    if (!usuarioSalvo) {
      navigate("/login");
      return;
    }

    if (servicoSelecionado) {
      dispatch(setServicoSelecionado(servicoSelecionado));
    } else {
      dispatch(limparServicoSelecionado());
    }

    navigate("/agendamento");
  };

  const compartilharPagina = async () => {
    const link = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "Agende seu horário ✨",
          text: "Confira os serviços disponíveis!",
          url: link,
        })
        .catch((err) =>
          console.log("Compartilhamento cancelado", err)
        );
    } else {
      navigator.clipboard.writeText(link);
      alert("🔗 Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* BANNER */}
      <div className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/70 via-black/40 to-[#0A0A0A]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none bg-gradient-to-b from-transparent to-[#0A0A0A]" />

        <img
          src="/salao-login.jpg"
          alt="Salão"
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
        />

        <div className="relative z-30 text-center px-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-56 sm:w-72 lg:w-80 mx-auto drop-shadow-[0_10px_40px_rgba(205,163,39,0.3)]"
          />

          <p className="mt-6 text-sm sm:text-base tracking-[0.4em] text-[#CDA327] font-light uppercase">
            Nosso Espaço
          </p>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ÍCONES */}
        <div className="flex justify-center -mt-12 mb-12 relative z-20">
          <div className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-xl">
            {/* MENSAGEM */}
            <a
              href={`https://wa.me/5534992338445?text=${encodeURIComponent(
                "Olá! Gostaria de agendar um horário 😊"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center no-underline"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-[#CDA327] to-[#B89020] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-[#CDA327]/20 group-hover:shadow-xl group-hover:shadow-[#CDA327]/30 group-hover:scale-105 transition-all duration-300">
                <ChatText size={26} weight="fill" className="text-black" />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 mt-3 font-light">
                Mensagem
              </span>
            </a>

            {/* LIGAR */}
            <a
              href="tel:+5534992338445"
              className="group flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-white/15 group-hover:border-[#CDA327]/60 group-hover:scale-105 transition-all duration-300 no-underline">
                <Phone
                  size={26}
                  weight="fill"
                  className="text-[#CDA327]"
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 mt-3 font-light">
                Ligar
              </span>
            </a>

            {/* MAPA */}
            <a
              href="https://www.google.com/maps?q=Av.+Patr%C3%ADcio+Filho,+05+-+Jardim+Esperanca,+Patos+de+Minas+-+MG,+38703-698"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center no-underline"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-white/15 group-hover:border-[#CDA327]/60 group-hover:scale-105 transition-all duration-300">
                <MapPin
                  size={26}
                  weight="fill"
                  className="text-[#CDA327]"
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 mt-3 font-light">
                Visitar
              </span>
            </a>

            {/* COMPARTILHAR */}
            <button
              onClick={compartilharPagina}
              className="group flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-white/15 group-hover:border-[#CDA327]/60 group-hover:scale-105 transition-all duration-300 no-underline">
                <ShareNetwork
                  size={26}
                  weight="fill"
                  className="text-[#CDA327]"
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 mt-3 font-light">
                Enviar
              </span>
            </button>
          </div>
        </div>

        {/* BOTÃO AGENDAR */}
        <button
          onClick={() => irParaAgendamento()}
          className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#CDA327] via-[#D4AC2A] to-[#CDA327] p-[2px] shadow-xl shadow-[#CDA327]/15 hover:shadow-xl hover:shadow-[#CDA327]/20 transition-all duration-300"
        >
          <div className="relative bg-black rounded-full px-8 py-4 sm:py-5 flex items-center justify-center gap-3 transition-all duration-300 group-hover:brightness-110 group-hover:bg-black/90">
            <ClockIcon
              size={24}
              weight="fill"
              className="text-[#CDA327]"
            />
            <span className="text-base sm:text-lg lg:text-xl font-medium text-white tracking-wide">
              Agendar Horário
            </span>
          </div>
        </button>

        <div className="w-full h-[1.5px] bg-[#181818] rounded-full my-10" />

        {/* SERVIÇOS */}
        <div className="mt-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-light text-white mb-2">
              Serviços{" "}
              <span className="text-[#CDA327] font-normal">
                em Destaque
              </span>
            </h2>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#CDA327] to-transparent mx-auto mt-4" />
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-[#CDA327]/20 border-t-[#CDA327] rounded-full animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {servicos.map((servico) => (
              <button
                key={servico._id}
                onClick={() => irParaAgendamento(servico)}
                className="group relative bg-transparent rounded-2xl overflow-hidden border border-white/10 hover:border-[#CDA327]/50 transition-all duration-400 hover:scale-[1.01] shadow-[0_2px_8px_0_rgba(0,0,0,0.18)] hover:shadow-[0_2px_12px_0_rgba(205,163,39,0.10)] min-h-[320px] p-0"
              >
                {/* FOTO */}
                <div className="relative h-40 sm:h-48 lg:h-52 w-full overflow-hidden rounded-t-2xl">
                  <img
                    src={getFoto(servico)}
                    alt={servico.nomeServico}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <ClockIcon
                      size={13}
                      weight="fill"
                      className="text-[#CDA327]"
                    />
                    <span className="text-xs text-white font-light">
                      {servico.duracao || "60"} min
                    </span>
                  </div>

                  {/* HOVER AGENDAR */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="bg-[#CDA327]/70 text-black px-5 py-2.5 rounded-full font-medium text-xs flex items-center gap-2 transition-all duration-300 border border-[#CDA327]/30 group-hover:bg-[#CDA327]/90">
                      <CalendarIcon size={16} weight="fill" />
                      Agendar
                    </div>
                  </div>
                </div>

                {/* TEXTO */}
                <div className="bg-[#181818] rounded-b-2xl p-4 sm:p-5 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-[#CDA327] transition-colors line-clamp-1 text-left">
                      {servico.nomeServico}
                    </h3>

                    <div className="flex items-baseline gap-1 ml-3">
                      <span className="text-md sm:text-lg font-semibold text-white">
                        R$ {servico.preco}
                      </span>
                      <span className="text-xs text-gray-500">
                        a partir
                      </span>
                    </div>
                  </div>

                  {servico.descricao && (
                    <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px] text-left">
                      {servico.descricao}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;
